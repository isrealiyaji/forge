const { z } = require("zod");
const ROLES = require("../enums/roles.enum.js");

const createInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum([ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.MEMBER]),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

module.exports = { createInviteSchema, acceptInviteSchema };
