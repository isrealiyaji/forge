const pool = require("../db/pool.js");

const log = async ({ actorUserId, action, entityType, entityId, metadata }) => {
  await pool.query(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [actorUserId || null, action, entityType, entityId ? String(entityId) : null, metadata ? JSON.stringify(metadata) : null],
  );
};

module.exports = { log };
