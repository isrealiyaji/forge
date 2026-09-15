const asyncHandler = require("../lib/asyncHandler.js");
const authService = require("../services/authService.js");
const tokenService = require("../services/tokenService.js");

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ user });
});

const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);
  const tokens = await tokenService.issueTokenPair(user, {
    userAgent: req.get("user-agent"),
    ip: req.ip,
  });
  tokenService.setAuthCookies(res, tokens);
  res.json({ user });
});

const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refresh_token;
  if (!rawRefreshToken) return res.status(401).json({ error: "Not authenticated." });

  const tokens = await tokenService.rotateRefreshToken(rawRefreshToken, {
    userAgent: req.get("user-agent"),
    ip: req.ip,
  });
  tokenService.setAuthCookies(res, tokens);
  res.status(204).send();
});

const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refresh_token;
  if (rawRefreshToken) await tokenService.revokeRefreshToken(rawRefreshToken);
  tokenService.clearAuthCookies(res);
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.json({ user });
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  res.status(204).send();
});

const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body.email);
  res.json({ message: "If that account exists, a verification email is on its way." });
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({ message: "If that account exists, a reset link is on its way." });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.status(204).send();
});

module.exports = { register, login, refresh, logout, me, verifyEmail, resendVerification, forgotPassword, resetPassword };
