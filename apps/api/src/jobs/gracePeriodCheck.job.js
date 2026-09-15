const cron = require("node-cron");
const billingService = require("../services/billingService.js");

// Runs daily at 03:00 server time: flips any subscription past its grace
// window from `past_due` to `cancelled`, revoking access.
const scheduleGracePeriodCheck = () => {
  cron.schedule("0 3 * * *", async () => {
    try {
      const cancelled = await billingService.gracePeriodSweep();
      if (cancelled.length > 0) {
        console.log(`Grace period sweep cancelled ${cancelled.length} subscription(s).`);
      }
    } catch (err) {
      console.error("Grace period sweep failed:", err);
    }
  });
};

module.exports = scheduleGracePeriodCheck;
