const asyncHandler = require("../lib/asyncHandler.js");
const bookingService = require("../services/bookingService.js");
const memberService = require("../services/memberService.js");

const create = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  const booking = await bookingService.createBooking(req.body.scheduleId, member.member_id);
  res.status(201).json({ booking });
});

const cancel = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  await bookingService.cancelBooking(req.params.id, member.member_id);
  res.status(204).send();
});

module.exports = { create, cancel };
