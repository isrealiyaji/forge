const nutritionRejectedTemplate = ({ memberName, reason, planUrl }) => ({
  subject: `Nutrition plan for ${memberName} needs a revision`,
  html: `
    <p>Your proposed nutrition plan for ${memberName} was rejected.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p><a href="${planUrl}">Revise and resubmit</a></p>
  `,
});

module.exports = nutritionRejectedTemplate;
