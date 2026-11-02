import { AppError } from '../utils/AppError.js';

export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const fields = {};
            for (const issue of result.error.issues) {
                const key = issue.path.join('.') || 'form';
                if (!fields[key]) fields[key] = issue.message;
            }
            return next(new AppError(400, 'VALIDATION_ERROR', 'Please fix the highlighted fields', fields));
        }
        req.body = result.data;
        next();
    };
}