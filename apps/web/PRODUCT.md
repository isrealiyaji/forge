# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), talking to a separate Express/PostgreSQL API in `apps/api`.

## Users

- **Admin** — the gym's owner/manager. Runs day-to-day operations: members, instructors, subscription plans, class scheduling, nutrition-plan approvals, and an analytics view. Likely desktop-primary.
- **Instructor** — gym staff assigned a roster of members and a set of classes/sessions. Views their caseload and proposes nutrition plans for review. Mixed desktop/mobile use, often during or around sessions.
- **Member** — a paying gym member. Views their assigned instructor, manages their subscription (Paystack), books classes, and checks in to track a daily attendance streak. Primarily mobile web, used in and around visits to the gym.

## Product Purpose

Digitizes the operations of **one specific gym** (not a multi-tenant SaaS): subscription billing, instructor-member relationship management, class scheduling with capacity/waitlist, attendance and streak tracking, and a nutrition-plan proposal-and-approval workflow between instructors, members, and admin.

## Positioning

Not a generic gym-management template. It's built around this one gym's own operation, with two mechanisms most off-the-shelf gym software doesn't bundle together: automatic, capacity-based instructor-member assignment (admin sets a per-instructor cap, the system balances load, admin can override), and a versioned nutrition-plan review pipeline (instructor proposes → admin approves/rejects with a reason → instructor revises → resubmits).

## Operating Context

- Members check in physically at the gym; the app is where they see the resulting streak, so it needs to read well on a phone, likely on the gym's wifi or mobile data, possibly mid-workout.
- Instructors consult their roster and classes around session times, and draft nutrition plans between sessions.
- Admin reviews and manages less frequently but in more depth (analytics, plan approvals, scheduling), most likely at a desk.

## Capabilities and Constraints

- Subscriptions run on Paystack's native Subscriptions API: members can upgrade or cancel only — no refunds, no proration.
- Failed renewal charges enter a grace period (admin-configurable, default 3 days) before access is suspended.
- Class booking has a real waitlist: a full class queues bookings and promotes the oldest waitlisted member when a spot opens or capacity is raised.
- Instructor-member assignment is auto-balanced against an admin-set cap (e.g. 25 members/instructor), with manual admin override that pins a pairing against future rebalancing.
- Nutrition plans are versioned: rejections carry a reason, and instructors revise-and-resubmit rather than starting over.
- Attendance streaks are computed from UTC-stored check-ins plus each member's stored timezone — "today" is always the member's local day.
- All members must verify their email before first login; admin-invited users skip this (accepting the invite already proves inbox ownership). Members may also self-register.
- Single gym only for now — no multi-branch/tenant switching; this is an explicit constraint on scope, not a gap.

## Brand Commitments

None yet. No existing gym name, logo, palette, or photography — the user has asked for a fresh brand identity to be proposed as part of the design work rather than supplied.

## Evidence on Hand

None. No real gym name, member photos, testimonials, or copy exist yet. Design work should propose a plausible identity/persona clearly as a creative concept, and must not fabricate specific real-world claims (testimonials, member counts, press) as if factual.

## Product Principles

1. Design for one real gym's operation, not a generalized multi-tenant product — no gym-switcher, no tenant settings, no hedging for hypothetical other gyms.
2. Each role sees only what serves its job: admin gets oversight and control surfaces, instructors get a focused roster/proposal workflow, members get a personal, motivating daily-use experience.
3. Money and health-adjacent data (payments, nutrition plans) require legibility over cleverness — status, history, and next action must always be obvious.
4. Automate what's mechanical (assignment balancing, streak math, grace periods) so members and instructors feel low friction; keep that complexity's controls on the admin side only.

## Accessibility & Inclusion

None established yet.
