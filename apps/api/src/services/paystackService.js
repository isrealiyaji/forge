const { paystackRequest } = require("../lib/paystackClient.js");
const config = require("../config/index.js");

// Passing `plan` to transaction/initialize makes Paystack create the
// subscription itself on first successful payment — no separate call needed.
const initializeCheckout = ({ email, planCode }) =>
  paystackRequest("/transaction/initialize", {
    method: "POST",
    body: {
      email,
      plan: planCode,
      callback_url: `${config.webAppUrl}/member/subscription?checkout=complete`,
    },
  });

// Plans are owned by our admin UI, not the Paystack dashboard — every create
// or edit here is mirrored to Paystack so the two never drift apart.
const createPlan = ({ name, amount, interval, description }) =>
  paystackRequest("/plan", {
    method: "POST",
    body: { name, amount, interval, description, currency: config.paystack.currency },
  });

const updatePlan = (planCode, { name, amount, interval, description }) =>
  paystackRequest(`/plan/${planCode}`, {
    method: "PUT",
    body: { name, amount, interval, description },
  });

const disableSubscription = ({ subscriptionCode, emailToken }) =>
  paystackRequest("/subscription/disable", {
    method: "POST",
    body: { code: subscriptionCode, token: emailToken },
  });

const fetchSubscription = (subscriptionCode) => paystackRequest(`/subscription/${subscriptionCode}`);

module.exports = { initializeCheckout, createPlan, updatePlan, disableSubscription, fetchSubscription };
