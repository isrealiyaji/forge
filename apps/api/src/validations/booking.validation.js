const { z } = require("zod");

const createBookingSchema = z.object({
  scheduleId: z.coerce.number().int().positive(),
});

module.exports = { createBookingSchema };
