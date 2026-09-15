const pool = require("../db/pool.js");
const AppError = require("../lib/AppError.js");
const { hashPassword, comparePassword } = require("../lib/password.js");

// Shared across all three roles — role-specific profile fields (specialty/bio,
// phone/dob/timezone) live in instructorService / memberService instead.

const updatePassword = async (userId, { currentPassword, newPassword }) => {
  const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
  if (!rows[0]) throw new AppError("User not found.", 404);

  const matches = await comparePassword(currentPassword, rows[0].password_hash);
  if (!matches) throw new AppError("Current password is incorrect.", 401);

  const passwordHash = await hashPassword(newPassword);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);
  // A password change should end every other active session.
  await pool.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [
    userId,
  ]);
};

const updateName = async (userId, name) => {
  await pool.query("UPDATE users SET name = $1, updated_at = now() WHERE id = $2", [name, userId]);
};

// For roles with no extra profile fields of their own (admin).
const updateContactInfo = async (userId, { name, phone }) => {
  await pool.query(
    `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = now() WHERE id = $3`,
    [name ?? null, phone ?? null, userId],
  );
};

const getById = async (userId) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, phone, role FROM users WHERE id = $1 AND deleted_at IS NULL",
    [userId],
  );
  if (!rows[0]) throw new AppError("User not found.", 404);
  return rows[0];
};

module.exports = { updatePassword, updateName, updateContactInfo, getById };
