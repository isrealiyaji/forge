const pool = require("../db/pool.js");

const getDashboardSummary = async () => {
  const [members, instructors, pastDue, pendingPlans, classesThisWeek] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM members WHERE deleted_at IS NULL"),
    pool.query("SELECT COUNT(*) FROM instructors WHERE deleted_at IS NULL"),
    pool.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'past_due'"),
    pool.query(
      `SELECT COUNT(*) FROM nutrition_plans np
       JOIN nutrition_plan_versions npv ON npv.id = np.current_version_id
       WHERE npv.status = 'pending'`,
    ),
    pool.query(
      "SELECT COUNT(*) FROM class_schedules WHERE start_time BETWEEN now() AND now() + interval '7 days'",
    ),
  ]);

  return {
    activeMembers: Number(members.rows[0].count),
    instructors: Number(instructors.rows[0].count),
    pastDueSubscriptions: Number(pastDue.rows[0].count),
    pendingNutritionPlans: Number(pendingPlans.rows[0].count),
    classesThisWeek: Number(classesThisWeek.rows[0].count),
  };
};

// Normalizes every plan's price to a monthly figure so mixed billing
// intervals (quarterly, annual) roll up into one comparable MRR number.
const getAnalytics = async () => {
  const [summary, mrr, subsByStatus, membersByMonth, attendanceByDay] = await Promise.all([
    getDashboardSummary(),
    pool.query(`
      SELECT COALESCE(SUM(
        CASE p.interval
          WHEN 'monthly' THEN p.price_cents
          WHEN 'quarterly' THEN p.price_cents / 3.0
          WHEN 'annual' THEN p.price_cents / 12.0
        END
      ), 0) AS mrr_cents
      FROM subscriptions s
      JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.status = 'active' AND s.ended_at IS NULL
    `),
    pool.query(`
      SELECT CASE WHEN ended_at IS NOT NULL THEN 'ended' ELSE status END AS bucket, COUNT(*)
      FROM subscriptions
      GROUP BY bucket
    `),
    pool.query(`
      SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') AS month, COUNT(*)
      FROM users
      WHERE role = 'member' AND created_at > now() - interval '6 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at) ASC
    `),
    pool.query(`
      SELECT to_char(checked_in_at::date, 'Dy, Mon DD') AS day, COUNT(*)
      FROM attendance
      WHERE checked_in_at > now() - interval '7 days'
      GROUP BY checked_in_at::date
      ORDER BY checked_in_at::date ASC
    `),
  ]);

  return {
    summary,
    mrrCents: Math.round(Number(mrr.rows[0].mrr_cents)),
    subscriptionsByStatus: subsByStatus.rows.map((r) => ({ status: r.bucket, count: Number(r.count) })),
    newMembersByMonth: membersByMonth.rows.map((r) => ({ month: r.month, count: Number(r.count) })),
    attendanceByDay: attendanceByDay.rows.map((r) => ({ day: r.day, count: Number(r.count) })),
  };
};

module.exports = { getDashboardSummary, getAnalytics };
