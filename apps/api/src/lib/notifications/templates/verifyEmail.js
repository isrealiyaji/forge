const verifyEmailTemplate = ({ name, verifyUrl }) => ({
  subject: "Verify your email — Forge Athletic Club",
  html: `
    <p>Hi ${name},</p>
    <p>Welcome to Forge Athletic Club. Confirm your email to activate your account:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>This link expires in 24 hours.</p>
  `,
});

module.exports = verifyEmailTemplate;
