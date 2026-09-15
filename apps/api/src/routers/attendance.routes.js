const { Router } = require("express");
const attendanceController = require("../controllers/attendanceController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const ROLES = require("../enums/roles.enum.js");

const router = Router();

router.use(authMiddleware, authorize(ROLES.MEMBER));

router.post("/check-in", attendanceController.checkIn);
router.get("/", attendanceController.history);

module.exports = router;
