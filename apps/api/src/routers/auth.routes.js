const { Router } = require("express");
const authController = require("../controllers/authController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const { loginLimiter } = require("../middlewares/rateLimiter.middleware.js");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require("../validations/auth.validation.js");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
router.post("/resend-verification", loginLimiter, authController.resendVerification);
router.post("/forgot-password", loginLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
