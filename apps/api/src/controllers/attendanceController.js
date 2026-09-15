const asyncHandler = require("../lib/asyncHandler.js");
const attendanceService = require("../services/attendanceService.js");
const memberService = require("../services/memberService.js");

const checkIn = asyncHandler(async (req, res) => {
  const result = await attendanceService.checkIn(req.user.id);
  res.status(201).json(result);
});

const history = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  const entries = await attendanceService.listHistory(member.member_id);
  res.json({ entries });
});

module.exports = { checkIn, history };
