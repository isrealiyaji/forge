const crypto = require("crypto");
const config = require("../config/index.js");
const subscriptionService = require("../services/subscriptionService.js");
const asyncHandler = require("../lib/asyncHandler.js");

// Verified against the raw body (see routers/webhooks.routes.js, which
// mounts express.raw() only on this route) — a parsed/re-serialized body
// would not reproduce Paystack's original signature.
const paystack = asyncHandler(async (req, res) => {
  const signature = req.get("x-paystack-signature");
  const expected = crypto.createHmac("sha512", config.paystack.secretKey).update(req.body).digest("hex");

  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid signature." });
  }

  const event = JSON.parse(req.body.toString("utf8"));

  // Always ack Paystack with 200 once the signature checks out, even if we
  // later no-op on an event we don't recognize — retries help nothing here.
  res.status(200).json({ received: true });

  try {
    await subscriptionService.handleWebhookEvent(event);
  } catch (err) {
    console.error("Webhook processing failed:", err);
  }
});

module.exports = { paystack };
