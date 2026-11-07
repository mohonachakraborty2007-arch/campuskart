import { AppError } from '../utils/AppError.js';

function toFields(issues) {
    const fields = {};
    for (const issue of issues) {
        const key = issue.path.join('.') || 'form';
        if (!fields[key]) fields[key] = issue.message;
    }
    return fields;
}

export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next(
                new AppError(400, 'VALIDATION_ERROR', 'Please fix the highlighted fields', toFields(result.error.issues))
            );
        }
        req.body = result.data;
        next();
    };
}

// For URL parameters like ?category=books&page=2.
// The cleaned result is placed in res.locals.query; req.query is never used directly.
export function validateQuery(schema) {
    return (req, res, next) => {
        // an empty value (?q=) means "not set"
        const cleaned = Object.fromEntries(
            Object.entries(req.query).filter(([, value]) => value !== '')
        );
        const result = schema.safeParse(cleaned);
        if (!result.success) {
            return next(
                new AppError(400, 'VALIDATION_ERROR', 'Some search options are not valid', toFields(result.error.issues))
            );
        }
        res.locals.query = result.data;
        next();
    };
}