const { Router } = require("express");
const memberController = require("../controllers/memberController.js");
const uploadController = require("../controllers/uploadController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const upload = require("../middlewares/upload.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const { updateProfileSchema, updatePasswordSchema } = require("../validations/member.validation.js");

const router = Router();

router.use(authMiddleware);

router.get("/me", authorize(ROLES.MEMBER), memberController.me);
router.patch("/me", authorize(ROLES.MEMBER), validate(updateProfileSchema), memberController.updateMe);
router.patch("/me/password", authorize(ROLES.MEMBER), validate(updatePasswordSchema), memberController.updatePassword);
router.post("/me/photo", authorize(ROLES.MEMBER), upload.single("photo"), uploadController.profilePhoto);
router.get("/me/instructor", authorize(ROLES.MEMBER), memberController.myInstructor);

router.get("/", authorize(ROLES.ADMIN), memberController.list);
router.delete("/:id", authorize(ROLES.ADMIN), memberController.deactivate);

module.exports = router;
