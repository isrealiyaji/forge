const { z } = require("zod");

const updateGymSettingsSchema = z.object({
  maxMembersPerInstructor: z.coerce.number().int().positive().optional(),
  subscriptionGracePeriodDays: z.coerce.number().int().nonnegative().optional(),
});

module.exports = { updateGymSettingsSchema };
