const pool = require("../db/pool.js");
const AppError = require("../lib/AppError.js");
const bookingService = require("./bookingService.js");
const auditService = require("./auditService.js");

const createClass = async ({ name, description, instructorId, capacity }, actorUserId) => {
  const { rows } = await pool.query(
    `INSERT INTO classes (name, description, instructor_id, capacity) VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, instructor_id, capacity`,
    [name, description || null, instructorId, capacity],
  );
  await auditService.log({ actorUserId, action: "class.created", entityType: "class", entityId: rows[0].id });
  return rows[0];
};

const listClasses = async () => {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.description, c.capacity, u.name AS instructor_name
     FROM classes c
     LEFT JOIN instructors i ON i.id = c.instructor_id
     LEFT JOIN users u ON u.id = i.user_id
     WHERE c.deleted_at IS NULL
     ORDER BY c.name ASC`,
  );
  return rows;
};

// Raising capacity can free up room on the waitlist, so we promote right after.
const updateCapacity = async (classId, capacity, actorUserId) => {
  const { rows } = await pool.query(
    "UPDATE classes SET capacity = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id",
    [capacity, classId],
  );
  if (!rows[0]) throw new AppError("Class not found.", 404);

  const { rows: schedules } = await pool.query("SELECT id FROM class_schedules WHERE class_id = $1", [classId]);
  for (const schedule of schedules) {
    // eslint-disable-next-line no-await-in-loop
    await bookingService.promoteWaitlistIfRoom(schedule.id);
  }

  await auditService.log({ actorUserId, action: "class.capacity_updated", entityType: "class", entityId: classId, metadata: { capacity } });
  return rows[0];
};

const archiveClass = async (classId, actorUserId) => {
  const { rows } = await pool.query(
    "UPDATE classes SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id",
    [classId],
  );
  if (!rows[0]) throw new AppError("Class not found.", 404);
  await auditService.log({ actorUserId, action: "class.archived", entityType: "class", entityId: classId });
};

const createSchedule = async ({ classId, startTime, endTime, recurrenceRule }) => {
  const { rows } = await pool.query(
    `INSERT INTO class_schedules (class_id, start_time, end_time, recurrence_rule)
     VALUES ($1, $2, $3, $4) RETURNING id, class_id, start_time, end_time`,
    [classId, startTime, endTime, recurrenceRule || null],
  );
  return rows[0];
};

const listUpcomingSchedules = async () => {
  const { rows } = await pool.query(
    `SELECT cs.id AS schedule_id, cs.start_time, cs.end_time, c.name, c.capacity,
            COUNT(cb.id) FILTER (WHERE cb.status = 'booked') AS booked_count
     FROM class_schedules cs
     JOIN classes c ON c.id = cs.class_id
     LEFT JOIN class_bookings cb ON cb.schedule_id = cs.id
     WHERE cs.start_time > now() AND c.deleted_at IS NULL
     GROUP BY cs.id, c.name, c.capacity
     ORDER BY cs.start_time ASC`,
  );
  return rows.map((r) => ({ ...r, booked_count: Number(r.booked_count) }));
};

module.exports = {
  createClass,
  listClasses,
  updateCapacity,
  archiveClass,
  createSchedule,
  listUpcomingSchedules,
};
