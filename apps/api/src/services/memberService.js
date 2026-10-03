const pool = require("../db/pool.js");
const AppError = require("../lib/AppError.js");
const auditService = require("./auditService.js");

const listMembers = async ({ limit = 50, offset = 0 } = {}) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, m.id AS member_id, m.current_streak,
            s.status AS subscription_status, iu.name AS instructor_name, u.created_at
     FROM members m
     JOIN users u ON u.id = m.user_id
     LEFT JOIN subscriptions s ON s.member_id = m.id AND s.ended_at IS NULL
     LEFT JOIN instructor_members im ON im.member_id = m.id AND im.unassigned_at IS NULL
     LEFT JOIN instructors i ON i.id = im.instructor_id
     LEFT JOIN users iu ON iu.id = i.user_id
     WHERE m.deleted_at IS NULL
     ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return rows;
};

const getMemberByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT u.id AS user_id, u.name, u.email, u.phone, u.timezone, m.id AS member_id, m.dob,
            m.current_streak, m.longest_streak, m.last_checkin_local_date
     FROM members m
     JOIN users u ON u.id = m.user_id
     WHERE u.id = $1 AND m.deleted_at IS NULL`,
    [userId],
  );
  if (!rows[0]) throw new AppError("Member not found.", 404);
  return rows[0];
};

const updateMemberProfile = async (userId, { name, phone, timezone }) => {
  await pool.query(
    `UPDATE users SET
       name = COALESCE($1, name),
       phone = COALESCE($2, phone),
       timezone = COALESCE($3, timezone),
       updated_at = now()
     WHERE id = $4`,
    [name ?? null, phone ?? null, timezone ?? null, userId],
  );
};

const softDeleteMember = async (memberId, actorUserId) => {
  await pool.query("UPDATE members SET deleted_at = now() WHERE id = $1", [memberId]);
  await pool.query(
    "UPDATE instructor_members SET unassigned_at = now() WHERE member_id = $1 AND unassigned_at IS NULL",
    [memberId],
  );
  await auditService.log({ actorUserId, action: "member.deactivated", entityType: "member", entityId: memberId });
};

module.exports = { listMembers, getMemberByUserId, updateMemberProfile, softDeleteMember };
