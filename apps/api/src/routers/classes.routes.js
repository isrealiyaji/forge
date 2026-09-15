const { Router } = require("express");
const classController = require("../controllers/classController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const {
  createClassSchema,
  updateClassCapacitySchema,
  createScheduleSchema,
} = require("../validations/class.validation.js");

const router = Router();

router.use(authMiddleware);

router.get("/", classController.list);
router.get("/schedules", classController.listSchedules);

router.post("/", authorize(ROLES.ADMIN), validate(createClassSchema), classController.create);
router.patch(
  "/:id/capacity",
  authorize(ROLES.ADMIN),
  validate(updateClassCapacitySchema),
  classController.updateCapacity,
);
router.post("/schedules", authorize(ROLES.ADMIN), validate(createScheduleSchema), classController.createSchedule);

module.exports = router;
