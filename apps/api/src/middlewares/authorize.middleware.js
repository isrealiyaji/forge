const AppError = require("../lib/AppError.js");

// authorize('admin', 'instructor') — must run after authMiddleware.
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError("You don't have access to this resource.", 403));
  }
  return next();
};

module.exports = authorize;
