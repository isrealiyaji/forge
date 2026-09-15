const { Router } = require("express");
const nutritionPlanController = require("../controllers/nutritionPlanController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const {
  proposePlanSchema,
  revisePlanSchema,
  reviewPlanSchema,
} = require("../validations/nutritionPlan.validation.js");

const router = Router();

router.use(authMiddleware);

router.get("/me", authorize(ROLES.MEMBER), nutritionPlanController.myPlan);

router.post("/", authorize(ROLES.INSTRUCTOR), validate(proposePlanSchema), nutritionPlanController.propose);
router.patch("/:id", authorize(ROLES.INSTRUCTOR), validate(revisePlanSchema), nutritionPlanController.revise);

router.get("/pending", authorize(ROLES.ADMIN), nutritionPlanController.pending);
router.post("/:id/review", authorize(ROLES.ADMIN), validate(reviewPlanSchema), nutritionPlanController.review);

module.exports = router;
