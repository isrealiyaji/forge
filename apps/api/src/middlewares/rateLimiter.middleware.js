const rateLimit = require("express-rate-limit");
const config = require("../config/index.js");

// IP-based ceiling for the whole API.
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter IP-based limit on auth endpoints. Per-account lockout (failed
// attempts / locked_until) is handled separately in authService — this
// only stops brute-forcing many accounts from one IP.
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again later." },
});

module.exports = { generalLimiter, loginLimiter };
