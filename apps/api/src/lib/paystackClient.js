const config = require("../config/index.js");

// Thin transport only — every business rule (plan mapping, upgrade/cancel
// semantics, dunning) lives in services/paystackService.js.
const paystackRequest = async (path, { method = "GET", body } = {}) => {
  const response = await fetch(`${config.paystack.baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.paystack.secretKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json();
  if (!response.ok || payload.status === false) {
    const error = new Error(payload.message || "Paystack request failed");
    error.status = response.status;
    error.paystack = payload;
    throw error;
  }
  return payload.data;
};

module.exports = { paystackRequest };
