const passwordResetTemplate = ({ resetUrl }) => ({
  subject: "Reset your password — Forge Athletic Club",
  html: `
    <p>We received a request to reset your password.</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you didn't request this, ignore this email — your password won't change.</p>
  `,
});

module.exports = passwordResetTemplate;
