const { Router } = require("express");
const adminController = require("../controllers/adminController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const { updateProfileSchema } = require("../validations/admin.validation.js");
const { updatePasswordSchema } = require("../validations/member.validation.js");
const { updateGymSettingsSchema } = require("../validations/settings.validation.js");

const router = Router();

router.use(authMiddleware, authorize(ROLES.ADMIN));

router.get("/dashboard", adminController.dashboard);
router.get("/me", adminController.me);
router.patch("/me", validate(updateProfileSchema), adminController.updateMe);
router.patch("/me/password", validate(updatePasswordSchema), adminController.updatePassword);
router.get("/settings", adminController.getSettings);
router.patch("/settings", validate(updateGymSettingsSchema), adminController.updateSettings);

module.exports = router;
