const asyncHandler = require("../lib/asyncHandler.js");
const inviteService = require("../services/inviteService.js");

const create = asyncHandler(async (req, res) => {
  const invite = await inviteService.createInvite(req.body, req.user.id);
  res.status(201).json({ invite });
});

const list = asyncHandler(async (req, res) => {
  const invites = await inviteService.listPendingInvites();
  res.json({ invites });
});

const revoke = asyncHandler(async (req, res) => {
  await inviteService.revokeInvite(req.params.id, req.user.id);
  res.status(204).send();
});

const accept = asyncHandler(async (req, res) => {
  const user = await inviteService.acceptInvite(req.body);
  res.status(201).json({ user });
});

module.exports = { create, list, revoke, accept };
