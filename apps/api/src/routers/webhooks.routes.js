const { Router, raw } = require("express");
const webhookController = require("../controllers/webhookController.js");

const router = Router();

// Raw body only, mounted here rather than globally — the signature check
// needs the exact bytes Paystack sent, before JSON parsing touches them.
router.post("/paystack", raw({ type: "application/json" }), webhookController.paystack);

module.exports = router;
