import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'campuskart_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// we email the plain token, and store only its hash
export function createVerifyToken() {
    const token = crypto.randomBytes(32).toString('hex');
    return {
        token,
        hash: hashToken(token),
        expires: new Date(Date.now() + ONE_DAY_MS),
    };
}

export function signSession(userId) {
    return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifySession(token) {
    return jwt.verify(token, env.JWT_SECRET);
}

export function cookieOptions() {
    return {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SEVEN_DAYS_MS,
    };
}

export function clearCookieOptions() {
    const { maxAge, ...rest } = cookieOptions();
    return rest;
}