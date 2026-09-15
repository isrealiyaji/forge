const { Resend } = require("resend");
const config = require("../../../config/index.js");

const client = new Resend(config.notifications.resend.apiKey);

/** @type {import("../NotificationProvider.js")} */
const resendProvider = {
  send: async ({ to, subject, html }) => {
    const { error } = await client.emails.send({
      from: config.notifications.emailFrom,
      to,
      subject,
      html,
    });
    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }
  },
};

module.exports = resendProvider;
