const pool = require("../db/pool.js");
const AppError = require("../lib/AppError.js");
const NUTRITION_PLAN_STATUS = require("../enums/nutritionPlanStatus.enum.js");
const notificationService = require("./notificationService.js");
const auditService = require("./auditService.js");
const config = require("../config/index.js");

const proposePlan = async ({ memberId, content }, instructorId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let { rows: planRows } = await client.query(
      "SELECT id FROM nutrition_plans WHERE member_id = $1 AND instructor_id = $2",
      [memberId, instructorId],
    );
    let planId = planRows[0]?.id;
    if (!planId) {
      const { rows } = await client.query(
        "INSERT INTO nutrition_plans (member_id, instructor_id) VALUES ($1, $2) RETURNING id",
        [memberId, instructorId],
      );
      planId = rows[0].id;
    }

    const { rows: versionRows } = await client.query(
      `INSERT INTO nutrition_plan_versions (nutrition_plan_id, version_number, content, created_by)
       VALUES ($1, 1, $2, (SELECT user_id FROM instructors WHERE id = $3))
       RETURNING id`,
      [planId, JSON.stringify(content), instructorId],
    );
    await client.query("UPDATE nutrition_plans SET current_version_id = $1 WHERE id = $2", [
      versionRows[0].id,
      planId,
    ]);

    await client.query("COMMIT");
    return { planId, versionId: versionRows[0].id };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Rejection writes rejection_reason on the version, not a status the
// instructor can silently overwrite: revising always opens a new version.
const revisePlan = async (planId, { content }, instructorId) => {
  const { rows: planRows } = await pool.query(
    "SELECT id FROM nutrition_plans WHERE id = $1 AND instructor_id = $2",
    [planId, instructorId],
  );
  if (!planRows[0]) throw new AppError("Nutrition plan not found.", 404);

  const { rows: maxRows } = await pool.query(
    "SELECT COALESCE(MAX(version_number), 0) AS max FROM nutrition_plan_versions WHERE nutrition_plan_id = $1",
    [planId],
  );
  const nextVersion = Number(maxRows[0].max) + 1;

  const { rows } = await pool.query(
    `INSERT INTO nutrition_plan_versions (nutrition_plan_id, version_number, content, created_by)
     VALUES ($1, $2, $3, (SELECT user_id FROM instructors WHERE id = $4))
     RETURNING id`,
    [planId, nextVersion, JSON.stringify(content), instructorId],
  );
  await pool.query("UPDATE nutrition_plans SET current_version_id = $1 WHERE id = $2", [rows[0].id, planId]);
  return { planId, versionId: rows[0].id, versionNumber: nextVersion };
};

const reviewPlan = async (planId, { approve, rejectionReason }, adminUserId) => {
  const { rows } = await pool.query(
    `SELECT npv.id, u.email AS instructor_email, u.name AS instructor_name, mu.name AS member_name
     FROM nutrition_plans np
     JOIN nutrition_plan_versions npv ON npv.id = np.current_version_id
     JOIN instructors i ON i.id = np.instructor_id
     JOIN users u ON u.id = i.user_id
     JOIN members m ON m.id = np.member_id
     JOIN users mu ON mu.id = m.user_id
     WHERE np.id = $1`,
    [planId],
  );
  const current = rows[0];
  if (!current) throw new AppError("Nutrition plan not found.", 404);

  const status = approve ? NUTRITION_PLAN_STATUS.APPROVED : NUTRITION_PLAN_STATUS.REJECTED;
  await pool.query(
    `UPDATE nutrition_plan_versions
     SET status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_at = now()
     WHERE id = $4`,
    [status, approve ? null : rejectionReason || null, adminUserId, current.id],
  );

  if (!approve) {
    await notificationService
      .sendNutritionRejected({
        to: current.instructor_email,
        memberName: current.member_name,
        reason: rejectionReason || "No reason given.",
        planUrl: `${config.webAppUrl}/instructor/nutrition-plans`,
      })
      .catch((err) => console.error("Nutrition rejection email failed:", err));
  }

  await auditService.log({
    actorUserId: adminUserId,
    action: approve ? "nutritionPlan.approved" : "nutritionPlan.rejected",
    entityType: "nutrition_plan",
    entityId: planId,
  });
};

const getPlanForMember = async (memberId) => {
  const { rows } = await pool.query(
    `SELECT np.id AS plan_id, npv.id AS version_id, npv.version_number, npv.content, npv.status, npv.rejection_reason
     FROM nutrition_plans np
     JOIN nutrition_plan_versions npv ON npv.id = np.current_version_id
     WHERE np.member_id = $1`,
    [memberId],
  );
  return rows[0] || null;
};

const listPendingForAdmin = async () => {
  const { rows } = await pool.query(
    `SELECT np.id AS plan_id, npv.version_number, npv.created_at, mu.name AS member_name, iu.name AS instructor_name
     FROM nutrition_plans np
     JOIN nutrition_plan_versions npv ON npv.id = np.current_version_id
     JOIN members m ON m.id = np.member_id
     JOIN users mu ON mu.id = m.user_id
     JOIN instructors i ON i.id = np.instructor_id
     JOIN users iu ON iu.id = i.user_id
     WHERE npv.status = 'pending'
     ORDER BY npv.created_at ASC`,
  );
  return rows;
};

module.exports = { proposePlan, revisePlan, reviewPlan, getPlanForMember, listPendingForAdmin };
