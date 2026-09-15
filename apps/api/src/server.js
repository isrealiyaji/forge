const app = require("./app.js");
const config = require("./config/index.js");
const scheduleGracePeriodCheck = require("./jobs/gracePeriodCheck.job.js");

app.listen(config.port, () => {
  console.log(`Forge API listening on port ${config.port}`);
  scheduleGracePeriodCheck();
});
