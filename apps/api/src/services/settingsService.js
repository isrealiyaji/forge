const pool = require("../db/pool.js");
const config = require("../config/index.js");
const auditService = require("./auditService.js");

const DEFAULTS = {
  max_members_per_instructor: config.defaults.maxMembersPerInstructor,
  subscription_grace_period_days: config.defaults.subscriptionGracePeriodDays,
};

const getSetting = async (key) => {
  const { rows } = await pool.query("SELECT value FROM settings WHERE key = $1", [key]);
  return rows[0] ? rows[0].value : DEFAULTS[key];
};

const getAllSettings = async () => {
  const { rows } = await pool.query("SELECT key, value FROM settings");
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...byKey };
};

const setSetting = async (key, value, actorUserId) => {
  await pool.query(
    `INSERT INTO settings (key, value, updated_by, updated_at) VALUES ($1, $2, $3, now())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = now()`,
    [key, JSON.stringify(value), actorUserId],
  );
  await auditService.log({ actorUserId, action: "settings.updated", entityType: "settings", entityId: key, metadata: { value } });
};

module.exports = { getSetting, getAllSettings, setSetting };
