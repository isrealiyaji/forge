const { Router } = require("express");
const bookingController = require("../controllers/bookingController.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const validate = require("../middlewares/validate.middleware.js");
const ROLES = require("../enums/roles.enum.js");
const { createBookingSchema } = require("../validations/booking.validation.js");

const router = Router();

router.use(authMiddleware, authorize(ROLES.MEMBER));

router.post("/", validate(createBookingSchema), bookingController.create);
router.delete("/:id", bookingController.cancel);

module.exports = router;
