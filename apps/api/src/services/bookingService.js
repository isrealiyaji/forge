const pool = require("../db/pool.js");
const AppError = require("../lib/AppError.js");
const CLASS_BOOKING_STATUS = require("../enums/classBookingStatus.enum.js");

const getScheduleCapacity = async (scheduleId) => {
  const { rows } = await pool.query(
    `SELECT c.capacity, COUNT(cb.id) FILTER (WHERE cb.status = 'booked') AS booked_count
     FROM class_schedules cs
     JOIN classes c ON c.id = cs.class_id
     LEFT JOIN class_bookings cb ON cb.schedule_id = cs.id
     WHERE cs.id = $1
     GROUP BY c.capacity`,
    [scheduleId],
  );
  if (!rows[0]) throw new AppError("Class schedule not found.", 404);
  return { capacity: rows[0].capacity, bookedCount: Number(rows[0].booked_count) };
};

// Books directly if there's room, otherwise queues onto the waitlist —
// waitlist order is just created_at, no separate position column needed.
const createBooking = async (scheduleId, memberId) => {
  const { rows: existing } = await pool.query(
    `SELECT id FROM class_bookings WHERE schedule_id = $1 AND member_id = $2 AND status IN ('booked','waitlisted')`,
    [scheduleId, memberId],
  );
  if (existing.length > 0) {
    throw new AppError("You're already booked or waitlisted for this class.", 409);
  }

  const { capacity, bookedCount } = await getScheduleCapacity(scheduleId);
  const status = bookedCount < capacity ? CLASS_BOOKING_STATUS.BOOKED : CLASS_BOOKING_STATUS.WAITLISTED;

  const { rows } = await pool.query(
    `INSERT INTO class_bookings (schedule_id, member_id, status) VALUES ($1, $2, $3)
     RETURNING id, schedule_id, member_id, status`,
    [scheduleId, memberId, status],
  );
  return rows[0];
};

const cancelBooking = async (bookingId, memberId) => {
  const { rows } = await pool.query(
    `UPDATE class_bookings SET status = $1 WHERE id = $2 AND member_id = $3 AND status IN ('booked','waitlisted')
     RETURNING schedule_id`,
    [CLASS_BOOKING_STATUS.CANCELLED, bookingId, memberId],
  );
  if (!rows[0]) throw new AppError("Booking not found.", 404);

  await promoteWaitlistIfRoom(rows[0].schedule_id);
};

// Promotes the oldest waitlisted booking into a confirmed seat whenever a
// spot opens — a cancellation, or admin raising the class capacity.
const promoteWaitlistIfRoom = async (scheduleId) => {
  const { capacity, bookedCount } = await getScheduleCapacity(scheduleId);
  if (bookedCount >= capacity) return null;

  const { rows } = await pool.query(
    `UPDATE class_bookings SET status = $1
     WHERE id = (
       SELECT id FROM class_bookings
       WHERE schedule_id = $2 AND status = $3
       ORDER BY created_at ASC LIMIT 1
     )
     RETURNING id, member_id`,
    [CLASS_BOOKING_STATUS.BOOKED, scheduleId, CLASS_BOOKING_STATUS.WAITLISTED],
  );
  return rows[0] || null;
};

module.exports = { createBooking, cancelBooking, promoteWaitlistIfRoom };
