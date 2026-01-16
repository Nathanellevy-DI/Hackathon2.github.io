const { z } = require('zod');

const goalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100).trim(),
    targetValue: z.number().positive('Target value must be positive'),
    currentValue: z.number().min(0).optional().default(0),
    unit: z.string().max(20).optional().default('workouts'),
    deadline: z.string().datetime().optional().nullable(),
    completed: z.boolean().optional().default(false)
}).strict(); // Reject unknown fields

const goalUpdateSchema = goalSchema.partial(); // Allow partial updates

module.exports = { goalSchema, goalUpdateSchema };
