const { z } = require("zod");

const proposePlanSchema = z.object({
  memberId: z.coerce.number().int().positive(),
  content: z.record(z.any()),
});

const revisePlanSchema = z.object({
  content: z.record(z.any()),
});

const reviewPlanSchema = z.object({
  approve: z.boolean(),
  rejectionReason: z.string().trim().optional(),
});

module.exports = { proposePlanSchema, revisePlanSchema, reviewPlanSchema };
