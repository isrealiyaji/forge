const pool = require("../db/pool.js");
const AppError = require("../lib/AppError.js");
const { localDateString, daysBetween } = require("../lib/dateTime.js");

// Attendance is stored in UTC; "today" is always derived from the member's
// own timezone at write time, never stored pre-converted.
const checkIn = async (userId) => {
  // pg returns DATE columns as JS Date objects by default — cast to text so
  // this compares against localDateString()'s YYYY-MM-DD output correctly.
  const { rows } = await pool.query(
    `SELECT m.id, m.current_streak, m.longest_streak, m.last_checkin_local_date::text AS last_checkin_local_date, u.timezone
     FROM members m JOIN users u ON u.id = m.user_id
     WHERE u.id = $1 AND m.deleted_at IS NULL`,
    [userId],
  );
  const member = rows[0];
  if (!member) throw new AppError("Member not found.", 404);

  const timezone = member.timezone || "UTC";
  const today = localDateString(new Date(), timezone);
  const lastDate = member.last_checkin_local_date;

  if (lastDate === today) {
    return { alreadyCheckedIn: true, streak: member.current_streak, longestStreak: member.longest_streak };
  }

  const nextStreak = lastDate && daysBetween(lastDate, today) === 1 ? member.current_streak + 1 : 1;
  const nextLongest = Math.max(member.longest_streak, nextStreak);

  await pool.query("INSERT INTO attendance (member_id, method) VALUES ($1, 'manual')", [member.id]);
  await pool.query(
    `UPDATE members SET current_streak = $1, longest_streak = $2, last_checkin_local_date = $3 WHERE id = $4`,
    [nextStreak, nextLongest, today, member.id],
  );

  return { alreadyCheckedIn: false, streak: nextStreak, longestStreak: nextLongest };
};

const listHistory = async (memberId, { limit = 30 } = {}) => {
  const { rows } = await pool.query(
    `SELECT checked_in_at, method FROM attendance WHERE member_id = $1 ORDER BY checked_in_at DESC LIMIT $2`,
    [memberId, limit],
  );
  return rows;
};

module.exports = { checkIn, listHistory };
