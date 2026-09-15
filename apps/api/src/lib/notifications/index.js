const config = require("../../config/index.js");
const resendProvider = require("./providers/resendProvider.js");

// Add new providers here and switch NOTIFICATION_PROVIDER in .env —
// nothing else in the codebase needs to change.
const PROVIDERS = {
  resend: resendProvider,
};

const activeProvider = PROVIDERS[config.notifications.provider];
if (!activeProvider) {
  throw new Error(`Unknown notification provider: ${config.notifications.provider}`);
}

module.exports = activeProvider;
