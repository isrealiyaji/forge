const { Router } = require("express");
const instructorController = require("../controllers/instructorController.js");
const uploadController = require("../controllers/uploadController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const upload = require("../middlewares/upload.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const { updateProfileSchema } = require("../validations/instructor.validation.js");
const { updatePasswordSchema } = require("../validations/member.validation.js");

const router = Router();

router.use(authMiddleware);

router.get("/me", authorize(ROLES.INSTRUCTOR), instructorController.me);
router.patch("/me", authorize(ROLES.INSTRUCTOR), validate(updateProfileSchema), instructorController.updateMe);
router.patch(
  "/me/password",
  authorize(ROLES.INSTRUCTOR),
  validate(updatePasswordSchema),
  instructorController.updatePassword,
);
router.post("/me/photo", authorize(ROLES.INSTRUCTOR), upload.single("photo"), uploadController.profilePhoto);
router.get("/me/roster", authorize(ROLES.INSTRUCTOR), instructorController.myRoster);

router.get("/", authorize(ROLES.ADMIN), instructorController.list);
router.delete("/:id", authorize(ROLES.ADMIN), instructorController.deactivate);

module.exports = router;
