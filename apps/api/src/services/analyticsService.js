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

module.exports = { getDashboardSummary };
