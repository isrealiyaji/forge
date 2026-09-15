const { Router } = require("express");
const inviteController = require("../controllers/inviteController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const { createInviteSchema, acceptInviteSchema } = require("../validations/invite.validation.js");

const router = Router();

router.post("/accept", validate(acceptInviteSchema), inviteController.accept);

router.use(authMiddleware, authorize(ROLES.ADMIN));
router.post("/", validate(createInviteSchema), inviteController.create);
router.get("/", inviteController.list);
router.delete("/:id", inviteController.revoke);

module.exports = router;
