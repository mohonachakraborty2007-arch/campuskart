import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const isServerError = statusCode >= 500;

    if (isServerError) {
        console.error(err);
    }

    const body = {
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: isServerError && env.NODE_ENV === 'production'
                ? 'Something went wrong'
                : err.message,
        },
    };

    if (err.fields) {
        body.error.fields = err.fields;
    }

    if (env.NODE_ENV !== 'production' && isServerError) {
        body.error.stack = err.stack;
    }

    res.status(statusCode).json(body);
}