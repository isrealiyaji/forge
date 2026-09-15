# Forge Athletic Club — Gym Management App

A monorepo for a single-gym management platform: subscriptions (Paystack), instructor/member relationship management, class scheduling with waitlists, attendance streaks, and a versioned nutrition-plan approval workflow.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full data model, business rules, and design direction ("Fight Card").

## Structure

```
apps/
  api/   Express API (JavaScript, layered: routers -> controllers -> services)
  web/   Next.js frontend (App Router, Tailwind)
```

This is an npm workspaces monorepo — install once from the root.

## Getting started

```bash
npm install
```

### Backend (`apps/api`)

1. Copy the env template and fill in real values:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
2. Create a local Postgres database and point `DATABASE_URL` at it.
3. Run migrations:
   ```bash
   npm run migrate:up --workspace apps/api
   ```
4. Start the API:
   ```bash
   npm run dev --workspace apps/api
   ```
   Runs on `http://localhost:4000`. `/health` is a plain liveness check.

### Frontend (`apps/web`)

```bash
npm run dev --workspace apps/web
```

Runs on `http://localhost:3000`. Currently wired against static mock data (`apps/web/lib/mock-data.ts`) — not yet connected to the API above.

## Status

- **Frontend**: landing page, admin/member/instructor dashboards, auth pages (login/register/forgot-password/reset-password/accept-invite), and settings pages for all three roles are built and visually complete, but still running on mock data — no API calls wired up yet.
- **Backend**: full schema, migrations, and layered API scaffold matching the architecture doc. Core flows (auth, email verification, invites, auto-assignment, class booking/waitlist, versioned nutrition plans, subscription plans) are implemented and have been exercised end-to-end against a real Postgres database. Paystack webhook handling and the grace-period cron are implemented but untested against live Paystack traffic. Wiring the frontend to this API is the next step.
