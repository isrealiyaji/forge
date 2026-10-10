const asyncHandler = require("../lib/asyncHandler.js");
const subscriptionService = require("../services/subscriptionService.js");
const memberService = require("../services/memberService.js");

const listPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.listPlans();
  res.json({ plans });
});

const createPlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.createPlan(req.body, req.user.id);
  res.status(201).json({ plan });
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.updatePlan(req.params.id, req.body, req.user.id);
  res.json({ plan });
});

const myCurrentSubscription = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  const subscription = await subscriptionService.getActiveSubscription(member.member_id);
  res.json({ subscription });
});

const checkout = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  const result = await subscriptionService.initializeCheckout(member.member_id, req.body.planId);
  res.json(result);
});

const upgrade = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  const result = await subscriptionService.upgrade(member.member_id, req.body.planId);
  res.json(result);
});

const cancel = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberByUserId(req.user.id);
  await subscriptionService.cancel(member.member_id);
  res.status(204).send();
});

module.exports = { listPlans, createPlan, updatePlan, myCurrentSubscription, checkout, upgrade, cancel };
