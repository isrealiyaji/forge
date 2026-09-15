const provider = require("../lib/notifications/index.js");
const verifyEmailTemplate = require("../lib/notifications/templates/verifyEmail.js");
const inviteEmailTemplate = require("../lib/notifications/templates/inviteEmail.js");
const passwordResetTemplate = require("../lib/notifications/templates/passwordReset.js");
const gracePeriodWarningTemplate = require("../lib/notifications/templates/gracePeriodWarning.js");
const nutritionRejectedTemplate = require("../lib/notifications/templates/nutritionRejected.js");

// The only file in the app that composes a template and calls the active
// email provider. Callers never touch lib/notifications directly.
const sendVerificationEmail = ({ to, name, verifyUrl }) => {
  const { subject, html } = verifyEmailTemplate({ name, verifyUrl });
  return provider.send({ to, subject, html });
};

const sendInviteEmail = ({ to, role, acceptUrl }) => {
  const { subject, html } = inviteEmailTemplate({ role, acceptUrl });
  return provider.send({ to, subject, html });
};

const sendPasswordResetEmail = ({ to, resetUrl }) => {
  const { subject, html } = passwordResetTemplate({ resetUrl });
  return provider.send({ to, subject, html });
};

const sendGracePeriodWarning = ({ to, name, daysLeft, manageUrl }) => {
  const { subject, html } = gracePeriodWarningTemplate({ name, daysLeft, manageUrl });
  return provider.send({ to, subject, html });
};

const sendNutritionRejected = ({ to, memberName, reason, planUrl }) => {
  const { subject, html } = nutritionRejectedTemplate({ memberName, reason, planUrl });
  return provider.send({ to, subject, html });
};

module.exports = {
  sendVerificationEmail,
  sendInviteEmail,
  sendPasswordResetEmail,
  sendGracePeriodWarning,
  sendNutritionRejected,
};
