const pool = require("../db/pool.js");
const AppError = require("../lib/AppError.js");
const auditService = require("./auditService.js");

const listInstructors = async () => {
  const { rows } = await pool.query(
    `SELECT i.id, u.name, u.email, i.specialty,
            COUNT(im.id) FILTER (WHERE im.unassigned_at IS NULL) AS member_count
     FROM instructors i
     JOIN users u ON u.id = i.user_id
     LEFT JOIN instructor_members im ON im.instructor_id = i.id
     WHERE i.deleted_at IS NULL
     GROUP BY i.id, u.name, u.email
     ORDER BY u.name ASC`,
  );
  return rows.map((r) => ({ ...r, member_count: Number(r.member_count) }));
};

const getInstructorByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT u.id AS user_id, u.name, u.email, u.phone, i.id AS instructor_id, i.bio, i.specialty
     FROM instructors i
     JOIN users u ON u.id = i.user_id
     WHERE u.id = $1 AND i.deleted_at IS NULL`,
    [userId],
  );
  if (!rows[0]) throw new AppError("Instructor not found.", 404);
  return rows[0];
};

const updateInstructorProfile = async (userId, { name, phone, bio, specialty }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = now() WHERE id = $3`,
      [name ?? null, phone ?? null, userId],
    );
    await client.query(
      `UPDATE instructors SET bio = COALESCE($1, bio), specialty = COALESCE($2, specialty) WHERE user_id = $3`,
      [bio ?? null, specialty ?? null, userId],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getRoster = async (instructorId) => {
  const { rows } = await pool.query(
    `SELECT m.id AS member_id, u.name, m.current_streak,
            s.status AS subscription_status
     FROM instructor_members im
     JOIN members m ON m.id = im.member_id
     JOIN users u ON u.id = m.user_id
     LEFT JOIN subscriptions s ON s.member_id = m.id AND s.ended_at IS NULL
     WHERE im.instructor_id = $1 AND im.unassigned_at IS NULL
     ORDER BY u.name ASC`,
    [instructorId],
  );
  return rows;
};

const softDeleteInstructor = async (instructorId, actorUserId) => {
  await pool.query("UPDATE instructors SET deleted_at = now() WHERE id = $1", [instructorId]);
  await pool.query(
    "UPDATE instructor_members SET unassigned_at = now() WHERE instructor_id = $1 AND unassigned_at IS NULL",
    [instructorId],
  );
  await auditService.log({
    actorUserId,
    action: "instructor.deactivated",
    entityType: "instructor",
    entityId: instructorId,
  });
};

module.exports = { listInstructors, getInstructorByUserId, updateInstructorProfile, getRoster, softDeleteInstructor };
