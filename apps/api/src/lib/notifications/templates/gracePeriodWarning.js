const gracePeriodWarningTemplate = ({ name, daysLeft, manageUrl }) => ({
  subject: "Your payment didn't go through",
  html: `
    <p>Hi ${name},</p>
    <p>Your last subscription renewal failed. You have ${daysLeft} day(s) left before your access is paused.</p>
    <p><a href="${manageUrl}">Update your payment method</a></p>
  `,
});

module.exports = gracePeriodWarningTemplate;
