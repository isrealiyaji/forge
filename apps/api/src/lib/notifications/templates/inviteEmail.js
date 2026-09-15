const inviteEmailTemplate = ({ role, acceptUrl }) => ({
  subject: `You're invited to Forge Athletic Club as ${role}`,
  html: `
    <p>You've been invited to join Forge Athletic Club as ${role.toLowerCase()}.</p>
    <p><a href="${acceptUrl}">${acceptUrl}</a></p>
    <p>This link expires in 7 days.</p>
  `,
});

module.exports = inviteEmailTemplate;
