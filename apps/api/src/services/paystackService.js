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

const disableSubscription = ({ subscriptionCode, emailToken }) =>
  paystackRequest("/subscription/disable", {
    method: "POST",
    body: { code: subscriptionCode, token: emailToken },
  });

const fetchSubscription = (subscriptionCode) => paystackRequest(`/subscription/${subscriptionCode}`);

module.exports = { initializeCheckout, disableSubscription, fetchSubscription };
