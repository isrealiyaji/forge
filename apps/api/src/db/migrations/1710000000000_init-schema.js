/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- Identity & auth
    CREATE TABLE users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','instructor','member')),
      phone TEXT,
      email_verified_at TIMESTAMPTZ,
      failed_login_attempts INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      timezone TEXT,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE email_verification_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE password_reset_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE refresh_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      user_agent TEXT,
      ip TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE invites (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','instructor','member')),
      invited_by BIGINT REFERENCES users(id),
      token_hash TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','revoked')),
      expires_at TIMESTAMPTZ NOT NULL,
      accepted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- People
    CREATE TABLE members (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      dob DATE,
      current_streak INT NOT NULL DEFAULT 0,
      longest_streak INT NOT NULL DEFAULT 0,
      last_checkin_local_date DATE,
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE instructors (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      bio TEXT,
      specialty TEXT,
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE instructor_members (
      id BIGSERIAL PRIMARY KEY,
      instructor_id BIGINT NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
      member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      assigned_manually BOOLEAN NOT NULL DEFAULT FALSE,
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      unassigned_at TIMESTAMPTZ
    );
    -- A member has at most one active instructor at a time.
    CREATE UNIQUE INDEX instructor_members_active_member_idx
      ON instructor_members(member_id) WHERE unassigned_at IS NULL;
    CREATE INDEX instructor_members_active_instructor_idx
      ON instructor_members(instructor_id) WHERE unassigned_at IS NULL;

    -- Config
    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_by BIGINT REFERENCES users(id),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Subscriptions (Paystack native)
    CREATE TABLE subscription_plans (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price_cents INT NOT NULL,
      interval TEXT NOT NULL,
      paystack_plan_code TEXT UNIQUE,
      features JSONB NOT NULL DEFAULT '[]',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE subscriptions (
      id BIGSERIAL PRIMARY KEY,
      member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
      paystack_customer_code TEXT,
      paystack_subscription_code TEXT,
      paystack_email_token TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','cancelled')),
      current_period_end TIMESTAMPTZ,
      past_due_since TIMESTAMPTZ,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ended_at TIMESTAMPTZ
    );
    CREATE INDEX subscriptions_member_idx ON subscriptions(member_id);

    CREATE TABLE invoices (
      id BIGSERIAL PRIMARY KEY,
      subscription_id BIGINT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
      paystack_invoice_code TEXT UNIQUE,
      amount_cents INT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
      attempt_count INT NOT NULL DEFAULT 0,
      next_retry_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Classes
    CREATE TABLE classes (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      instructor_id BIGINT REFERENCES instructors(id),
      capacity INT NOT NULL,
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE class_schedules (
      id BIGSERIAL PRIMARY KEY,
      class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      recurrence_rule TEXT
    );

    CREATE TABLE class_bookings (
      id BIGSERIAL PRIMARY KEY,
      schedule_id BIGINT NOT NULL REFERENCES class_schedules(id) ON DELETE CASCADE,
      member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','waitlisted','cancelled','attended','no_show')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX class_bookings_schedule_status_idx ON class_bookings(schedule_id, status);

    -- Attendance
    CREATE TABLE attendance (
      id BIGSERIAL PRIMARY KEY,
      member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      method TEXT NOT NULL DEFAULT 'manual' CHECK (method IN ('qr','manual'))
    );
    CREATE INDEX attendance_member_checked_in_idx ON attendance(member_id, checked_in_at);

    -- Nutrition (versioned)
    CREATE TABLE nutrition_plans (
      id BIGSERIAL PRIMARY KEY,
      member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      instructor_id BIGINT NOT NULL REFERENCES instructors(id),
      current_version_id BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE nutrition_plan_versions (
      id BIGSERIAL PRIMARY KEY,
      nutrition_plan_id BIGINT NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
      version_number INT NOT NULL,
      content JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      rejection_reason TEXT,
      reviewed_by BIGINT REFERENCES users(id),
      reviewed_at TIMESTAMPTZ,
      created_by BIGINT NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX nutrition_plan_versions_plan_idx ON nutrition_plan_versions(nutrition_plan_id);

    ALTER TABLE nutrition_plans
      ADD CONSTRAINT nutrition_plans_current_version_fk
      FOREIGN KEY (current_version_id) REFERENCES nutrition_plan_versions(id);

    -- Audit
    CREATE TABLE audit_logs (
      id BIGSERIAL PRIMARY KEY,
      actor_user_id BIGINT REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS audit_logs CASCADE;
    DROP TABLE IF EXISTS nutrition_plan_versions CASCADE;
    DROP TABLE IF EXISTS nutrition_plans CASCADE;
    DROP TABLE IF EXISTS attendance CASCADE;
    DROP TABLE IF EXISTS class_bookings CASCADE;
    DROP TABLE IF EXISTS class_schedules CASCADE;
    DROP TABLE IF EXISTS classes CASCADE;
    DROP TABLE IF EXISTS invoices CASCADE;
    DROP TABLE IF EXISTS subscriptions CASCADE;
    DROP TABLE IF EXISTS subscription_plans CASCADE;
    DROP TABLE IF EXISTS settings CASCADE;
    DROP TABLE IF EXISTS instructor_members CASCADE;
    DROP TABLE IF EXISTS instructors CASCADE;
    DROP TABLE IF EXISTS members CASCADE;
    DROP TABLE IF EXISTS invites CASCADE;
    DROP TABLE IF EXISTS refresh_tokens CASCADE;
    DROP TABLE IF EXISTS password_reset_tokens CASCADE;
    DROP TABLE IF EXISTS email_verification_tokens CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
};
