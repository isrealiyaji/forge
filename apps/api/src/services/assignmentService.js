const pool = require("../db/pool.js");
const settingsService = require("./settingsService.js");
const auditService = require("./auditService.js");
const AppError = require("../lib/AppError.js");

// Instructors ranked by current active load, ascending.
const getInstructorLoads = async () => {
  const { rows } = await pool.query(`
    SELECT i.id, u.name, COUNT(im.id) FILTER (WHERE im.unassigned_at IS NULL) AS load
    FROM instructors i
    JOIN users u ON u.id = i.user_id
    LEFT JOIN instructor_members im ON im.instructor_id = i.id
    WHERE i.deleted_at IS NULL
    GROUP BY i.id, u.name
    ORDER BY load ASC, i.id ASC
  `);
  return rows.map((r) => ({ id: r.id, name: r.name, load: Number(r.load) }));
};

// New member -> least-loaded active instructor under the admin-set cap.
// Leaves the member unassigned (rather than throwing) if every instructor
// is already at capacity; admin can assign manually from the dashboard.
const autoAssignMember = async (memberId) => {
  const cap = await settingsService.getSetting("max_members_per_instructor");
  const loads = await getInstructorLoads();
  const candidate = loads.find((instructor) => instructor.load < cap);
  if (!candidate) return null;

  await pool.query(`INSERT INTO instructor_members (instructor_id, member_id) VALUES ($1, $2)`, [
    candidate.id,
    memberId,
  ]);
  return candidate.id;
};

// Admin override: pins the pairing so future rebalances skip it.
const reassignMember = async (memberId, instructorId, actorUserId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE instructor_members SET unassigned_at = now() WHERE member_id = $1 AND unassigned_at IS NULL`,
      [memberId],
    );
    await client.query(
      `INSERT INTO instructor_members (instructor_id, member_id, assigned_manually) VALUES ($1, $2, TRUE)`,
      [instructorId, memberId],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  await auditService.log({
    actorUserId,
    action: "member.reassigned",
    entityType: "member",
    entityId: memberId,
    metadata: { instructorId },
  });
};

// Re-balances every non-pinned assignment against the current cap and
// instructor roster. Manually-pinned pairs are left untouched.
const rebalance = async (actorUserId) => {
  const { rows: movable } = await pool.query(
    `SELECT member_id FROM instructor_members WHERE unassigned_at IS NULL AND assigned_manually = FALSE`,
  );

  await pool.query(
    `UPDATE instructor_members SET unassigned_at = now()
     WHERE unassigned_at IS NULL AND assigned_manually = FALSE`,
  );

  for (const { member_id: memberId } of movable) {
    // eslint-disable-next-line no-await-in-loop
    await autoAssignMember(memberId);
  }

  await auditService.log({ actorUserId, action: "assignments.rebalanced", entityType: "instructor_members" });
  return { rebalancedCount: movable.length };
};

const getMemberInstructor = async (memberId) => {
  const { rows } = await pool.query(
    `SELECT i.id, u.name, i.specialty
     FROM instructor_members im
     JOIN instructors i ON i.id = im.instructor_id
     JOIN users u ON u.id = i.user_id
     WHERE im.member_id = $1 AND im.unassigned_at IS NULL`,
    [memberId],
  );
  if (!rows[0]) throw new AppError("No instructor assigned yet.", 404);
  return rows[0];
};

module.exports = { getInstructorLoads, autoAssignMember, reassignMember, rebalance, getMemberInstructor };
