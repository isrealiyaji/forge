const { Router } = require("express");
const assignmentController = require("../controllers/assignmentController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const { reassignInstructorSchema } = require("../validations/member.validation.js");

const router = Router();

router.use(authMiddleware, authorize(ROLES.ADMIN));

router.get("/loads", assignmentController.listLoads);
router.post("/reassign", validate(reassignInstructorSchema), assignmentController.reassign);
router.post("/rebalance", assignmentController.rebalance);

module.exports = router;
