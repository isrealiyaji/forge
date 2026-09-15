const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional(),
});

module.exports = { updateProfileSchema };
