const crypto = require("crypto");

// Opaque tokens for refresh/verification/reset/invite flows: the raw value
// is emailed or set as a cookie and never stored; only its hash lives in the DB,
// so a leaked database dump can't be replayed as a live token.

const generateToken = () => crypto.randomBytes(32).toString("hex");

const hashToken = (rawToken) => crypto.createHash("sha256").update(rawToken).digest("hex");

module.exports = { generateToken, hashToken };
