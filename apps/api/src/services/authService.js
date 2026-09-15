const pool = require("../db/pool.js");
const config = require("../config/index.js");
const ROLES = require("../enums/roles.enum.js");
const AppError = require("../lib/AppError.js");
const { hashPassword, comparePassword } = require("../lib/password.js");
const { generateToken, hashToken } = require("../lib/tokens.js");
const notificationService = require("./notificationService.js");
const assignmentService = require("./assignmentService.js");
const auditService = require("./auditService.js");

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION = "15 minutes";
const VERIFICATION_TOKEN_TTL = "24 hours";
const RESET_TOKEN_TTL = "1 hour";

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerifiedAt: user.email_verified_at,
});

const register = async ({ name, email, password, phone, timezone }) => {
  const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.length > 0) {
    throw new AppError("An account with that email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  let userId;
  let memberId;
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone, timezone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role`,
      [name, email, passwordHash, ROLES.MEMBER, phone || null, timezone || null],
    );
    userId = rows[0].id;
    const { rows: memberRows } = await client.query(
      `INSERT INTO members (user_id) VALUES ($1) RETURNING id`,
      [userId],
    );
    memberId = memberRows[0].id;
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  // Auto-balance the new member across active instructors — not fatal to
  // registration if it fails; admin can assign manually from the dashboard.
  await assignmentService.autoAssignMember(memberId).catch((err) => console.error("Auto-assign failed:", err));

  const rawToken = generateToken();
  await pool.query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + $3::interval)`,
    [userId, hashToken(rawToken), VERIFICATION_TOKEN_TTL],
  );
  // The account and its verification token are already committed — a flaky
  // email provider shouldn't fail the whole registration. They can resend.
  await notificationService
    .sendVerificationEmail({ to: email, name, verifyUrl: `${config.webAppUrl}/verify-email?token=${rawToken}` })
    .catch((err) => console.error("Verification email failed:", err));

  await auditService.log({ actorUserId: userId, action: "register", entityType: "user", entityId: userId });

  return { id: userId, name, email, role: ROLES.MEMBER };
};

const login = async ({ email, password }) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, role, email_verified_at, failed_login_attempts, locked_until, deleted_at
     FROM users WHERE email = $1`,
    [email],
  );
  const user = rows[0];
  if (!user || user.deleted_at) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new AppError("Too many failed attempts. Try again later.", 423);
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    const attempts = user.failed_login_attempts + 1;
    const lock = attempts >= MAX_FAILED_ATTEMPTS;
    await pool.query(
      `UPDATE users SET failed_login_attempts = $1, locked_until = ${lock ? `now() + '${LOCK_DURATION}'::interval` : "NULL"}
       WHERE id = $2`,
      [attempts, user.id],
    );
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.email_verified_at) {
    throw new AppError("Please verify your email before signing in.", 403);
  }

  await pool.query("UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1", [user.id]);

  return toPublicUser(user);
};

const verifyEmail = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const { rows } = await pool.query(
    `SELECT id, user_id FROM email_verification_tokens
     WHERE token_hash = $1 AND verified_at IS NULL AND expires_at > now()`,
    [tokenHash],
  );
  const record = rows[0];
  if (!record) {
    throw new AppError("This verification link is invalid or has expired.", 400);
  }

  await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [record.user_id]);
  await pool.query("UPDATE email_verification_tokens SET verified_at = now() WHERE id = $1", [record.id]);
};

const resendVerification = async (email) => {
  const { rows } = await pool.query(
    "SELECT id, name, email_verified_at FROM users WHERE email = $1 AND deleted_at IS NULL",
    [email],
  );
  const user = rows[0];
  if (!user || user.email_verified_at) return; // silent no-op: never confirm account existence

  const rawToken = generateToken();
  await pool.query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + $3::interval)`,
    [user.id, hashToken(rawToken), VERIFICATION_TOKEN_TTL],
  );
  await notificationService
    .sendVerificationEmail({ to: email, name: user.name, verifyUrl: `${config.webAppUrl}/verify-email?token=${rawToken}` })
    .catch((err) => console.error("Verification email failed:", err));
};

const forgotPassword = async (email) => {
  const { rows } = await pool.query("SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL", [email]);
  const user = rows[0];
  if (!user) return; // silent no-op: never confirm account existence

  const rawToken = generateToken();
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + $3::interval)`,
    [user.id, hashToken(rawToken), RESET_TOKEN_TTL],
  );
  await notificationService
    .sendPasswordResetEmail({ to: email, resetUrl: `${config.webAppUrl}/reset-password?token=${rawToken}` })
    .catch((err) => console.error("Password reset email failed:", err));
};

const resetPassword = async ({ token, password }) => {
  const tokenHash = hashToken(token);
  const { rows } = await pool.query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [tokenHash],
  );
  const record = rows[0];
  if (!record) {
    throw new AppError("This reset link is invalid or has expired.", 400);
  }

  const passwordHash = await hashPassword(password);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, record.user_id]);
  await pool.query("UPDATE password_reset_tokens SET used_at = now() WHERE id = $1", [record.id]);
  // Force re-authentication everywhere — a leaked old session shouldn't survive a reset.
  await pool.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [
    record.user_id,
  ]);
};

const getUserById = async (id) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, role, email_verified_at FROM users WHERE id = $1 AND deleted_at IS NULL",
    [id],
  );
  if (!rows[0]) throw new AppError("User not found.", 404);
  return toPublicUser(rows[0]);
};

module.exports = { register, login, verifyEmail, resendVerification, forgotPassword, resetPassword, getUserById };
