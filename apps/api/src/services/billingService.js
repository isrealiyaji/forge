const pool = require("../db/pool.js");
const settingsService = require("./settingsService.js");
const notificationService = require("./notificationService.js");
const config = require("../config/index.js");

// A failed renewal starts the grace period; the member keeps access while
// it runs. gracePeriodSweep (run daily by jobs/gracePeriodCheck.job.js)
// is what actually revokes access once the window closes.
const startGracePeriod = async (subscriptionId) => {
  await pool.query(
    `UPDATE subscriptions SET status = 'past_due', past_due_since = COALESCE(past_due_since, now())
     WHERE id = $1`,
    [subscriptionId],
  );

  const { rows } = await pool.query(
    `SELECT u.email, u.name FROM subscriptions s
     JOIN members m ON m.id = s.member_id JOIN users u ON u.id = m.user_id
     WHERE s.id = $1`,
    [subscriptionId],
  );
  const gracePeriodDays = await settingsService.getSetting("subscription_grace_period_days");
  if (rows[0]) {
    await notificationService
      .sendGracePeriodWarning({
        to: rows[0].email,
        name: rows[0].name,
        daysLeft: gracePeriodDays,
        manageUrl: `${config.webAppUrl}/member/subscription`,
      })
      .catch((err) => console.error("Grace period email failed:", err));
  }
};

const gracePeriodSweep = async () => {
  const gracePeriodDays = await settingsService.getSetting("subscription_grace_period_days");
  const { rows } = await pool.query(
    `UPDATE subscriptions
     SET status = 'cancelled', ended_at = now()
     WHERE status = 'past_due'
       AND past_due_since IS NOT NULL
       AND past_due_since < now() - ($1 || ' days')::interval
     RETURNING id, member_id`,
    [gracePeriodDays],
  );
  return rows;
};

module.exports = { startGracePeriod, gracePeriodSweep };
