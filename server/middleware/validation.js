const { z } = require('zod');

/**
 * Middleware to validate request body against a Zod schema
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            // Parse validates the data and throws if invalid
            // .parse returns the typed data (with transformations if any)
            // but we just want to ensure it's valid.
            // We can also use schema.parse(req.body) to strip unknown keys if configured in schema
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation Error',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return res.status(500).json({ error: 'Internal Validation Error' });
        }
    };
};

module.exports = { validateBody };
