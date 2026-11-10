import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { outbox } from '../src/services/email.js';

const PASSWORD = 'Passw0rdTest';
const ID = '507f1f77bcf86cd799439011';

beforeAll(async () => {
    if (!env.MONGODB_URI_TEST || env.MONGODB_URI_TEST === env.MONGODB_URI) {
        throw new Error('Refusing to run tests on the main database');
    }
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.MONGODB_URI_TEST);
    }
});

beforeEach(async () => {
    await User.deleteMany({});
    outbox.length = 0;
});

afterAll(async () => {
    await mongoose.connection.close();
});

async function registerAndVerify(email) {
    await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email, password: PASSWORD });
    const mail = [...outbox].reverse().find((m) => m.to === email);
    await request(app).post('/api/auth/verify-email').send({ token: mail.token });
}

const protectedRoutes = [
    ['POST', '/api/listings'],
    ['PATCH', `/api/listings/${ID}`],
    ['DELETE', `/api/listings/${ID}`],
    ['PATCH', `/api/listings/${ID}/sold`],
    ['POST', `/api/listings/${ID}/inquiries`],
    ['POST', `/api/listings/${ID}/reports`],
    ['POST', `/api/wishlist/${ID}`],
    ['DELETE', `/api/wishlist/${ID}`],
    ['GET', '/api/wishlist'],
    ['GET', '/api/inquiries'],
    ['PATCH', `/api/inquiries/${ID}/read`],
    ['GET', '/api/users/me/listings'],
    ['GET', '/api/users/me/settings'],
    ['PATCH', '/api/users/me/settings'],
    ['GET', '/api/admin/reports'],
    ['PATCH', `/api/admin/reports/${ID}`],
    ['GET', '/api/auth/me'],
];

describe('every protected route needs a login', () => {
    it.each(protectedRoutes)('%s %s returns 401 when logged out', async (method, path) => {
        const res = await request(app)[method.toLowerCase()](path).send({});
        expect(res.status).toBe(401);
    });
});

describe('injection and mass assignment', () => {
    it('rejects objects in place of an email or password', async () => {
        const byEmail = await request(app)
            .post('/api/auth/login')
            .send({ email: { $ne: null }, password: PASSWORD });
        expect(byEmail.status).toBe(400);

        const byPassword = await request(app)
            .post('/api/auth/login')
            .send({ email: 'someone@snuniv.ac.in', password: { $ne: null } });
        expect(byPassword.status).toBe(400);
    });

    it('cannot make yourself an admin when registering', async () => {
        const email = 'sneaky@snuniv.ac.in';
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Sneaky', email, password: PASSWORD, role: 'admin' });
        const user = await User.findOne({ email });
        // either the request was refused (no user) or the role was ignored
        expect(user?.role ?? 'student').toBe('student');
    });
});

describe('cookie flags', () => {
    it('the login cookie is HttpOnly and SameSite=Lax', async () => {
        const email = 'cookie@snuniv.ac.in';
        await registerAndVerify(email);
        const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
        expect(res.status).toBe(200);
        const cookie = res.headers['set-cookie'].find((c) => c.startsWith('campuskart_token='));
        expect(cookie).toMatch(/HttpOnly/i);
        expect(cookie).toMatch(/SameSite=Lax/i);
    });
});