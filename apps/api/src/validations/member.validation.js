const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional(),
  timezone: z.string().trim().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const reassignInstructorSchema = z.object({
  memberId: z.coerce.number().int().positive(),
  instructorId: z.coerce.number().int().positive(),
});

module.exports = { updateProfileSchema, updatePasswordSchema, reassignInstructorSchema };
