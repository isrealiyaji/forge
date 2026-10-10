const { z } = require("zod");

// Paystack rejects plan amounts below 100 NGN (10,000 kobo) — enforced here
// too so admins see a clear error instead of a raw Paystack API failure.
const MIN_PRICE_KOBO = 10000;

const createPlanSchema = z.object({
  name: z.string().trim().min(1),
  priceCents: z.coerce.number().int().gte(MIN_PRICE_KOBO, "Price must be at least ₦100."),
  interval: z.enum(["monthly", "annually"]),
  description: z.string().trim().optional(),
  features: z.array(z.string()).optional(),
});

const subscribeSchema = z.object({
  planId: z.coerce.number().int().positive(),
});

const updatePlanSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    priceCents: z.coerce.number().int().gte(MIN_PRICE_KOBO, "Price must be at least ₦100.").optional(),
    interval: z.enum(["monthly", "annually"]).optional(),
    description: z.string().trim().optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field is required." });

module.exports = { createPlanSchema, subscribeSchema, updatePlanSchema };
