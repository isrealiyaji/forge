const pool = require("../db/pool.js");
const config = require("../config/index.js");
const ROLES = require("../enums/roles.enum.js");
const INVITE_STATUS = require("../enums/inviteStatus.enum.js");
const AppError = require("../lib/AppError.js");
const { hashPassword } = require("../lib/password.js");
const { generateToken, hashToken } = require("../lib/tokens.js");
const notificationService = require("./notificationService.js");
const assignmentService = require("./assignmentService.js");
const auditService = require("./auditService.js");

const INVITE_TTL = "7 days";

const createInvite = async ({ email, role }, invitedBy) => {
  const { rows: existingUser } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existingUser.length > 0) {
    throw new AppError("An account with that email already exists.", 409);
  }

  const rawToken = generateToken();
  const { rows } = await pool.query(
    `INSERT INTO invites (email, role, invited_by, token_hash, expires_at)
     VALUES ($1, $2, $3, $4, now() + $5::interval)
     RETURNING id, email, role, status, created_at`,
    [email, role, invitedBy, hashToken(rawToken), INVITE_TTL],
  );

  await notificationService
    .sendInviteEmail({ to: email, role, acceptUrl: `${config.webAppUrl}/accept-invite?token=${rawToken}` })
    .catch((err) => console.error("Invite email failed:", err));
  await auditService.log({ actorUserId: invitedBy, action: "invite.sent", entityType: "invite", entityId: rows[0].id });

  return rows[0];
};

const listPendingInvites = async () => {
  const { rows } = await pool.query(
    `SELECT id, email, role, status, created_at FROM invites
     WHERE status = $1 ORDER BY created_at DESC`,
    [INVITE_STATUS.PENDING],
  );
  return rows;
};

const revokeInvite = async (inviteId, actorUserId) => {
  await pool.query(`UPDATE invites SET status = $1 WHERE id = $2 AND status = $3`, [
    INVITE_STATUS.REVOKED,
    inviteId,
    INVITE_STATUS.PENDING,
  ]);
  await auditService.log({ actorUserId, action: "invite.revoked", entityType: "invite", entityId: inviteId });
};

const acceptInvite = async ({ token, name, password }) => {
  const tokenHash = hashToken(token);
  const { rows } = await pool.query(
    `SELECT id, email, role FROM invites
     WHERE token_hash = $1 AND status = $2 AND expires_at > now()`,
    [tokenHash, INVITE_STATUS.PENDING],
  );
  const invite = rows[0];
  if (!invite) {
    throw new AppError("This invite is invalid or has expired.", 400);
  }

  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  let userId;
  let memberId;
  try {
    await client.query("BEGIN");
    // Accepting the invite link already proves inbox ownership, so the
    // account is verified immediately — no separate email-verification step.
    const { rows: userRows } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, email_verified_at)
       VALUES ($1, $2, $3, $4, now()) RETURNING id`,
      [name, invite.email, passwordHash, invite.role],
    );
    userId = userRows[0].id;

    if (invite.role === ROLES.INSTRUCTOR) {
      await client.query(`INSERT INTO instructors (user_id) VALUES ($1)`, [userId]);
    } else if (invite.role === ROLES.MEMBER) {
      const { rows: memberRows } = await client.query(
        `INSERT INTO members (user_id) VALUES ($1) RETURNING id`,
        [userId],
      );
      memberId = memberRows[0].id;
    }

    await client.query(`UPDATE invites SET status = $1, accepted_at = now() WHERE id = $2`, [
      INVITE_STATUS.ACCEPTED,
      invite.id,
    ]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  if (memberId) {
    await assignmentService.autoAssignMember(memberId).catch((err) => console.error("Auto-assign failed:", err));
  }

  await auditService.log({ actorUserId: userId, action: "invite.accepted", entityType: "user", entityId: userId });
  return { id: userId, name, email: invite.email, role: invite.role };
};

module.exports = { createInvite, listPendingInvites, revokeInvite, acceptInvite };
