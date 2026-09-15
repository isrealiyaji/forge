const asyncHandler = require("../lib/asyncHandler.js");
const nutritionPlanService = require("../services/nutritionPlanService.js");
const instructorService = require("../services/instructorService.js");
const memberService = require("../services/memberService.js");

const propose = asyncHandler(async (req, res) => {
  const instructor = await instructorService.getInstructorByUserId(req.user.id);
  const result = await nutritionPlanService.proposePlan(req.body, instructor.instructor_id);
  res.status(201).json(result);
});

const revise = asyncHandler(async (req, res) => {
  const instructor = await instructorService.getInstructorByUserId(req.user.id);
  const result = await nutritionPlanService.revisePlan(req.params.id, req.body, instructor.instructor_id);
  res.json(result);
});

const review = asyncHandler(async (req, res) => {
  await nutritionPlanService.reviewPlan(req.params.id, req.body, req.user.id);
  res.status(204).send();
});

const myPlan = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  const plan = await nutritionPlanService.getPlanForMember(member.member_id);
  res.json({ plan });
});

const pending = asyncHandler(async (req, res) => {
  const plans = await nutritionPlanService.listPendingForAdmin();
  res.json({ plans });
});

module.exports = { propose, revise, review, myPlan, pending };
