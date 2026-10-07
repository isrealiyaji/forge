const asyncHandler = require("../lib/asyncHandler.js");
const userService = require("../services/userService.js");
const analyticsService = require("../services/analyticsService.js");
const settingsService = require("../services/settingsService.js");
const nutritionPlanService = require("../services/nutritionPlanService.js");

const me = asyncHandler(async (req, res) => {
  const admin = await userService.getById(req.user.id);
  res.json({ admin });
});

const updateMe = asyncHandler(async (req, res) => {
  await userService.updateContactInfo(req.user.id, req.body);
  res.status(204).send();
});

const updatePassword = asyncHandler(async (req, res) => {
  await userService.updatePassword(req.user.id, req.body);
  res.status(204).send();
});

const dashboard = asyncHandler(async (req, res) => {
  const [summary, pendingPlans] = await Promise.all([
    analyticsService.getDashboardSummary(),
    nutritionPlanService.listPendingForAdmin(),
  ]);
  res.json({ summary, pendingNutritionPlans: pendingPlans });
});

const analytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAnalytics();
  res.json(data);
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getAllSettings();
  res.json({ settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const { maxMembersPerInstructor, subscriptionGracePeriodDays } = req.body;
  if (maxMembersPerInstructor !== undefined) {
    await settingsService.setSetting("max_members_per_instructor", maxMembersPerInstructor, req.user.id);
  }
  if (subscriptionGracePeriodDays !== undefined) {
    await settingsService.setSetting("subscription_grace_period_days", subscriptionGracePeriodDays, req.user.id);
  }
  res.status(204).send();
});

module.exports = { me, updateMe, updatePassword, dashboard, analytics, getSettings, updateSettings };
