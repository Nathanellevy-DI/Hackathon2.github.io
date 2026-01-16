const { z } = require('zod');

const workoutSchema = z.object({
    exerciseName: z.string().min(1, 'Exercise name is required').max(100).trim(), // Basic sanitization with trim
    category: z.enum(['strength', 'cardio', 'flexibility', 'sports']).optional().default('strength'),
    sets: z.number().int().positive().optional().nullable(),
    reps: z.number().int().positive().optional().nullable(),
    weight: z.number().positive().optional().nullable(),
    duration: z.number().int().positive().optional().nullable(),
    notes: z.string().max(500, 'Notes too long').optional().nullable().transform(val => val ? val.trim() : val),
    date: z.string().datetime().optional().default(() => new Date().toISOString())
}).strict(); // Reject unknown fields

module.exports = { workoutSchema };
