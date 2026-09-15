const { z } = require("zod");

const createClassSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  instructorId: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().positive(),
});

const updateClassCapacitySchema = z.object({
  capacity: z.coerce.number().int().positive(),
});

const createScheduleSchema = z.object({
  classId: z.coerce.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  recurrenceRule: z.string().trim().optional(),
});

module.exports = { createClassSchema, updateClassCapacitySchema, createScheduleSchema };
