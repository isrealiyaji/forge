const { Router } = require("express");
const subscriptionController = require("../controllers/subscriptionController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const { createPlanSchema, subscribeSchema } = require("../validations/subscription.validation.js");

const router = Router();

router.use(authMiddleware);

router.get("/plans", subscriptionController.listPlans);
router.post("/plans", authorize(ROLES.ADMIN), validate(createPlanSchema), subscriptionController.createPlan);

router.get("/me", authorize(ROLES.MEMBER), subscriptionController.myCurrentSubscription);
router.post("/checkout", authorize(ROLES.MEMBER), validate(subscribeSchema), subscriptionController.checkout);
router.post("/upgrade", authorize(ROLES.MEMBER), validate(subscribeSchema), subscriptionController.upgrade);
router.post("/cancel", authorize(ROLES.MEMBER), subscriptionController.cancel);

module.exports = router;
