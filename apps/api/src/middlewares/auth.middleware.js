const { verifyAccessToken } = require("../lib/jwt.js");
const AppError = require("../lib/AppError.js");

// Verifies the access token cookie and attaches { id, role } to req.user.
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return next(new AppError("Not authenticated.", 401));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(new AppError("Session expired. Please sign in again.", 401));
  }
};

module.exports = authMiddleware;
