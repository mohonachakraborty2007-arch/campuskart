import { AppError } from '../utils/AppError.js';
import { COOKIE_NAME, verifySession } from '../utils/tokens.js';
import { User } from '../models/User.js';

export async function auth(req, res, next) {
    try {
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) throw new AppError(401, 'UNAUTHENTICATED', 'Please log in');

        let payload;
        try {
            payload = verifySession(token);
        } catch {
            throw new AppError(401, 'UNAUTHENTICATED', 'Session expired, please log in again');
        }

        const user = await User.findById(payload.sub);
        if (!user) throw new AppError(401, 'UNAUTHENTICATED', 'Please log in');

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}

export function requireVerified(req, res, next) {
    if (!req.user?.emailVerified) {
        return next(new AppError(403, 'EMAIL_NOT_VERIFIED', 'Verify your college email first'));
    }
    next();
}