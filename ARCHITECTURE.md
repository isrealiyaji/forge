# Gym Management App — Architecture

## 1. Stack

- **DB**: PostgreSQL
- **Backend**: Express (JavaScript), layered as Router → Controller (thin, no logic) → Service (business logic)
- **Frontend**: Next.js (App Router)
- **Payments**: Paystack native Subscriptions API (plan codes, auto-charge)
- **File storage**: Cloudinary
- **Email/notifications**: Resend, behind a provider-agnostic interface

## 2. Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manage members/instructors, create & edit subscription plans, manage classes & schedules, set instructor assignment cap, reassign members, approve/reject nutrition plans, view analytics dashboard, invite users |
| **Instructor** | View assigned members, view assigned classes/sessions, propose (and revise) nutrition plans |
| **Member** | Authenticate, view assigned instructor, manage subscription (upgrade/cancel), book classes, check in, track streak |

## 3. Data model

```sql
-- Identity & auth
users (
  id, email UNIQUE, password_hash, role[admin|instructor|member],
  email_verified_at TIMESTAMPTZ,        -- NULL until verified; login blocked until set
  failed_login_attempts INT DEFAULT 0, locked_until TIMESTAMPTZ,
  timezone TEXT,                        -- IANA string, e.g. "Europe/Paris", captured client-side
  deleted_at TIMESTAMPTZ,               -- soft delete
  created_at, updated_at
)

email_verification_tokens (
  id, user_id FK, token_hash, expires_at, verified_at, created_at
  -- self-registered members: required before first login
  -- invited members: skipped — accepting the invite link already proves email ownership,
  --   so invite acceptance sets email_verified_at directly
)

refresh_tokens (
  id, user_id FK, token_hash, user_agent, ip,
  expires_at, revoked_at, created_at
)

invites (
  id, email, role[member|instructor|admin], invited_by FK -> users.id NULL,
  token_hash, status[pending|accepted|expired|revoked],
  expires_at, accepted_at, created_at
)

-- People
members (
  id, user_id FK, phone, dob,
  current_streak INT DEFAULT 0, longest_streak INT DEFAULT 0,
  last_checkin_local_date DATE,
  deleted_at TIMESTAMPTZ
)

instructors (
  id, user_id FK, bio, specialty, deleted_at TIMESTAMPTZ
)

instructor_members (
  id, instructor_id FK, member_id FK,
  assigned_manually BOOLEAN DEFAULT FALSE,   -- pins against auto-rebalance
  assigned_at, unassigned_at
)

-- Config
settings (
  key TEXT PRIMARY KEY, value JSONB, updated_by FK, updated_at
  -- e.g. "max_members_per_instructor": 25, "subscription_grace_period_days": 3
)

-- Subscriptions (Paystack native)
subscription_plans (
  id, name, price_cents, interval, paystack_plan_code UNIQUE,
  features JSONB, is_active BOOLEAN, deleted_at
)

subscriptions (
  id, member_id FK, plan_id FK,
  paystack_customer_code, paystack_subscription_code,
  status[active|past_due|cancelled],
  current_period_end, started_at, ended_at
  -- upgrade/cancel closes this row (ended_at) and opens a new one; no in-place mutation
)

invoices (
  id, subscription_id FK, paystack_invoice_code UNIQUE,  -- unique constraint = webhook idempotency
  amount_cents, status[pending|success|failed],
  attempt_count INT DEFAULT 0, next_retry_at, paid_at, created_at
)

-- Classes
classes (
  id, name, description, instructor_id FK, capacity INT, deleted_at
)

class_schedules (
  id, class_id FK, start_time, end_time, recurrence_rule
)

class_bookings (
  id, schedule_id FK, member_id FK,
  status[booked|waitlisted|cancelled|attended|no_show],
  created_at   -- waitlist order = created_at ASC
)

-- Attendance
attendance (
  id, member_id FK, checked_in_at TIMESTAMPTZ,  -- always UTC
  method[qr|manual]
)

-- Nutrition (versioned)
nutrition_plans (
  id, member_id FK, instructor_id FK,
  current_version_id FK -> nutrition_plan_versions.id,
  created_at
)

nutrition_plan_versions (
  id, nutrition_plan_id FK, version_number INT,
  content JSONB, status[pending|approved|rejected],
  rejection_reason TEXT,
  reviewed_by FK -> users.id, reviewed_at,
  created_by FK -> users.id, created_at
)

-- Audit
audit_logs (
  id, actor_user_id FK, action TEXT, entity_type TEXT, entity_id,
  metadata JSONB, created_at
)
```

**Timezone rule**: every timestamp is stored in UTC (`timestamptz`); the IANA timezone string is captured once per user. "Local day" for streaks is always derived at read/business-logic time from `checked_in_at` + `users.timezone` — never store pre-converted local timestamps (breaks under DST, not re-derivable).

## 4. Key flows

**Email verification**: self-registered members get `email_verified_at = NULL` and a row in `email_verification_tokens`; login is blocked (with a "resend verification" endpoint) until they click the emailed link. Admin-invited users skip this — accepting the invite token already proves inbox ownership, so `email_verified_at` is set at acceptance time.

**Notifications (provider-agnostic)**: nothing outside `lib/notifications/` ever imports Resend directly.

```
lib/notifications/
  NotificationProvider.js     # contract: send({ to, subject, html })
  providers/
    resendProvider.js         # implements the contract using the Resend SDK
  templates/
    inviteEmail.js
    verifyEmail.js
    gracePeriodWarning.js
    nutritionRejected.js
  index.js                    # reads config.notifications.provider, exports the active provider

services/notificationService.js   # the only thing the rest of the app calls:
                                   # notificationService.sendInvite(...), .sendVerification(...), etc.
                                   # composes a template + calls the active provider
```

To switch providers later: add `providers/sendgridProvider.js` (same contract), flip `NOTIFICATION_PROVIDER` in config. `notificationService` and every caller (authService, inviteService, billingService, nutritionPlanService) stay untouched.

**Paystack subscription lifecycle**: `subscription.create`, `charge.success`, `invoice.payment_failed`, `subscription.disable` webhooks upsert `invoices`/`subscriptions` keyed by their Paystack code (unique constraint) — duplicate deliveries just re-update the same row; we always return `200`.

**Dunning**: on `invoice.payment_failed`, subscription → `past_due`; `settings.subscription_grace_period_days` (default 3) grace window starts, member keeps access. Daily cron (`jobs/gracePeriodCheck.job.js`) flips any `past_due` subscription past its window to `cancelled`, revokes access, and sends the grace-period-expired email.

**Upgrade**: disable old Paystack subscription, create a new one on the new plan code, close old `subscriptions` row, open a new one — effective immediately, no proration/refund.

**Cancel**: disable Paystack subscription; member keeps access until `current_period_end`, then row closes.

**Waitlist**: booking a full class inserts `status='waitlisted'`; a cancellation triggers `bookingService.promoteNextWaitlisted()`, flipping the oldest waitlisted row to `booked` and notifying them. Raising `classes.capacity` also triggers a promotion check.

**Auto-assignment**: `settings.max_members_per_instructor` drives `assignmentService` — new members get round-robin assigned to the least-loaded active instructor under the cap. Manual reassignment sets `assigned_manually=true`, which pins that pair against future auto-rebalances.

**Nutrition versioning**: rejection writes `rejection_reason` + `status='rejected'` on that version; instructor edits create a new `nutrition_plan_versions` row (`version_number + 1`); `nutrition_plans.current_version_id` repoints. Admin only ever reviews the current version.

**Auth**: access + refresh JWT pair in httpOnly cookies. Refresh tokens live in `refresh_tokens` (hashed), revoked (`revoked_at`) on logout. Login rate-limited by IP (`express-rate-limit`) and by account (`failed_login_attempts`/`locked_until` on `users`).

**File uploads**: Cloudinary via `uploadService` — profile photos, nutrition plan attachments.

**Audit logging**: `auditService.log(actorId, action, entityType, entityId, metadata)` called from subscription-plan edits, nutrition approve/reject, manual reassignment, capacity changes, invites issued/revoked.

## 5. Backend architecture (`apps/api/src`)

```
config/index.js          # all env reads (DB, JWT, Paystack, Cloudinary, Resend, rate-limit knobs)
enums/
  roles.enum.js
  subscriptionStatus.enum.js
  invoiceStatus.enum.js
  classBookingStatus.enum.js
  nutritionPlanStatus.enum.js
lib/                      # shared, stateless helpers — no business logic
  jwt.js                  # sign/verify access & refresh tokens
  password.js             # hash/compare
  dateTime.js             # UTC <-> local-day helpers using IANA tz
  cloudinaryClient.js
  paystackClient.js       # thin SDK init only; business logic stays in services
  notifications/          # see section 4 — provider-agnostic email layer
    NotificationProvider.js
    providers/resendProvider.js
    templates/
    index.js
validations/              # zod schemas, one file per resource
  auth.validation.js
  member.validation.js
  subscription.validation.js
  class.validation.js
  booking.validation.js
  nutritionPlan.validation.js
  invite.validation.js
middlewares/
  auth.middleware.js       # verify access token from cookie, attach req.user, block if unverified
  authorize.middleware.js  # authorize('admin','instructor')
  validate.middleware.js   # validate(schema) -> parses req against a validations/* schema
  rateLimiter.middleware.js
  upload.middleware.js     # multer memory storage -> cloudinaryClient
  errorHandler.middleware.js
routers/
  auth.routes.js
  invites.routes.js
  members.routes.js
  instructors.routes.js
  assignments.routes.js
  subscriptions.routes.js
  classes.routes.js
  bookings.routes.js
  attendance.routes.js
  nutritionPlans.routes.js
  admin.routes.js
  webhooks.routes.js       # raw body + signature verification for Paystack
controllers/               # thin: call service, shape HTTP response, no logic
services/
  authService.js
  tokenService.js
  inviteService.js
  notificationService.js   # only caller of lib/notifications
  memberService.js
  instructorService.js
  assignmentService.js     # auto-assign + rebalance algorithm
  subscriptionService.js
  paystackService.js       # wraps paystackClient with our business rules
  billingService.js        # dunning/grace-period logic
  classService.js
  bookingService.js        # waitlist promotion
  attendanceService.js     # streak calculation
  nutritionPlanService.js
  analyticsService.js
  auditService.js
  uploadService.js
jobs/
  gracePeriodCheck.job.js  # daily cron
db/
  pool.js
  migrations/
app.js
server.js
```

## 6. Frontend architecture (`apps/web`)

```
app/
  (auth)/login, register, verify-email/[token], accept-invite/[token]
  (member)/dashboard, instructors, subscription, classes, attendance
  (instructor)/dashboard, members, classes, nutrition-plans/[id]/edit
  (admin)/dashboard, members, instructors/assignments, plans, classes,
          nutrition-plans/review, analytics, settings
middleware.ts             # edge route guard, reads role claim from cookie
lib/
  api/                    # typed fetch wrappers per resource
  auth/                   # session helpers
  dateTime/               # client timezone capture + local-day formatting
enums/                    # mirrors backend enums (roles, statuses) for FE-only use
components/
  ui/                     # buttons, inputs, etc.
  member/ instructor/ admin/
hooks/                    # useAuth, useSubscription, etc.
```

## 7. Build phases

1. Scaffold: monorepo, Postgres schema/migrations, env config
2. Auth: register/login, email verification, JWT + refresh cookies, role middleware, invites
3. Core CRUD: members, instructors, auto-assignment, classes/schedules
4. Subscriptions + Paystack: plans CRUD, checkout, webhook, dunning cron
5. Classes: booking + waitlist promotion
6. Attendance: check-in endpoint, streak calculation
7. Nutrition plans: propose → review → versioned resubmit workflow
8. Admin analytics dashboard
9. Notifications: Resend provider wired into notificationService for every flow above
10. Polish: audit log coverage, rate limiting, deploy config

## 8. Still open (non-blocking)

- Whether SMS is needed anywhere (Resend covers email only).
