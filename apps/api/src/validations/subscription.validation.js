const { z } = require("zod");

const createPlanSchema = z.object({
  name: z.string().trim().min(1),
  priceCents: z.coerce.number().int().nonnegative(),
  interval: z.enum(["monthly", "quarterly", "annual"]),
  paystackPlanCode: z.string().trim().min(1),
  features: z.array(z.string()).optional(),
});

const subscribeSchema = z.object({
  planId: z.coerce.number().int().positive(),
});

module.exports = { createPlanSchema, subscribeSchema };
