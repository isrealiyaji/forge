const asyncHandler = require("../lib/asyncHandler.js");
const memberService = require("../services/memberService.js");
const userService = require("../services/userService.js");
const assignmentService = require("../services/assignmentService.js");

const list = asyncHandler(async (req, res) => {
  const members = await memberService.listMembers(req.query);
  res.json({ members });
});

const me = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  res.json({ member });
});

const updateMe = asyncHandler(async (req, res) => {
  await memberService.updateMemberProfile(req.user.id, req.body);
  res.status(204).send();
});

const updatePassword = asyncHandler(async (req, res) => {
  await userService.updatePassword(req.user.id, req.body);
  res.status(204).send();
});

const myInstructor = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  const instructor = await assignmentService.getMemberInstructor(member.member_id);
  res.json({ instructor });
});

const deactivate = asyncHandler(async (req, res) => {
  await memberService.softDeleteMember(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { list, me, updateMe, updatePassword, myInstructor, deactivate };
