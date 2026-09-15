const pool = require("../db/pool.js");
const config = require("../config/index.js");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../lib/jwt.js");
const { hashToken } = require("../lib/tokens.js");
const AppError = require("../lib/AppError.js");

const ttlToMs = (ttl) => {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 15 * 60 * 1000;
  const [, value, unit] = match;
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return Number(value) * multiplier;
};

const issueTokenPair = async (user, { userAgent, ip } = {}) => {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip, expires_at)
     VALUES ($1, $2, $3, $4, now() + $5::interval)`,
    [user.id, hashToken(refreshToken), userAgent || null, ip || null, config.jwt.refreshTtl],
  );

  return { accessToken, refreshToken };
};

const rotateRefreshToken = async (rawRefreshToken, meta) => {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError("Session expired. Please sign in again.", 401);
  }

  const tokenHash = hashToken(rawRefreshToken);
  const { rows } = await pool.query(
    `SELECT id FROM refresh_tokens
     WHERE user_id = $1 AND token_hash = $2 AND revoked_at IS NULL AND expires_at > now()`,
    [payload.sub, tokenHash],
  );
  if (rows.length === 0) {
    throw new AppError("Session expired. Please sign in again.", 401);
  }

  // Rotate: revoke the used token and issue a fresh pair.
  await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [rows[0].id]);
  return issueTokenPair({ id: payload.sub, role: payload.role }, meta);
};

const revokeRefreshToken = async (rawRefreshToken) => {
  await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`, [
    hashToken(rawRefreshToken),
  ]);
};

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie("access_token", accessToken, { ...COOKIE_BASE, maxAge: ttlToMs(config.jwt.accessTtl) });
  res.cookie("refresh_token", refreshToken, { ...COOKIE_BASE, maxAge: ttlToMs(config.jwt.refreshTtl) });
};

const clearAuthCookies = (res) => {
  res.clearCookie("access_token", COOKIE_BASE);
  res.clearCookie("refresh_token", COOKIE_BASE);
};

module.exports = { issueTokenPair, rotateRefreshToken, revokeRefreshToken, setAuthCookies, clearAuthCookies };
