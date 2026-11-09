import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const inquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => req.user.id, // must run after auth
    skip: () => env.NODE_ENV === 'test',
    handler: (req, res) =>
        res.status(429).json({
            error: {
                code: 'RATE_LIMITED',
                message: 'You have sent too many messages. Please try again in an hour.',
            },
        }),
});