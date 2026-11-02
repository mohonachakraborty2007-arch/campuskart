import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { outbox } from '../src/services/email.js';

const EMAIL = 'test.student@snuniv.ac.in';
const PASSWORD = 'Passw0rdTest';
const validBody = { name: 'Test Student', email: EMAIL, password: PASSWORD };

function lastTokenFor(email) {
    const mail = [...outbox].reverse().find((m) => m.to === email);
    return mail?.token;
}

beforeAll(async () => {
    if (env.NODE_ENV !== 'test') {
        throw new Error('Tests must run with NODE_ENV=test');
    }
    if (!env.MONGODB_URI_TEST) {
        throw new Error('Add MONGODB_URI_TEST (a separate database) to server/.env');
    }
    if (env.MONGODB_URI_TEST === env.MONGODB_URI) {
        throw new Error('MONGODB_URI_TEST must be a different database from MONGODB_URI');
    }
    await mongoose.connect(env.MONGODB_URI_TEST);
    await User.init();
});

beforeEach(async () => {
    await User.deleteMany({});
    outbox.length = 0;
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
    it('rejects a non-college email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...validBody, email: 'someone@gmail.com' });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
        expect(res.body.error.fields.email).toBe('Use your college email');
    });

    it('rejects a weak password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...validBody, password: 'short' });
        expect(res.status).toBe(400);
        expect(res.body.error.fields.password).toBeTruthy();
    });

    it('creates an account and stores only a password hash', async () => {
        const res = await request(app).post('/api/auth/register').send(validBody);
        expect(res.status).toBe(201);
        expect(JSON.stringify(res.body)).not.toContain('passwordHash');

        const saved = await User.findOne({ email: EMAIL }).select('+passwordHash');
        expect(saved.emailVerified).toBe(false);
        expect(saved.passwordHash).not.toBe(PASSWORD);
        expect(saved.passwordHash).toMatch(/^\$2/);
        expect(lastTokenFor(EMAIL)).toBeTruthy();
    });

    it('returns 409 for a duplicate email', async () => {
        await request(app).post('/api/auth/register').send(validBody);
        const res = await request(app).post('/api/auth/register').send(validBody);
        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('EMAIL_TAKEN');
    });
});

describe('POST /api/auth/login', () => {
    it('fails before the email is verified', async () => {
        await request(app).post('/api/auth/register').send(validBody);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: EMAIL, password: PASSWORD });
        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
    });

    it('gives the same error for a wrong password and an unknown user', async () => {
        await request(app).post('/api/auth/register').send(validBody);
        const wrong = await request(app)
            .post('/api/auth/login')
            .send({ email: EMAIL, password: 'WrongPass123' });
        const unknown = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@snuniv.ac.in', password: 'WrongPass123' });
        expect(wrong.status).toBe(401);
        expect(unknown.status).toBe(401);
        expect(wrong.body).toEqual(unknown.body);
    });
});

describe('verify, login, me, logout', () => {
    it('rejects a bad verification token', async () => {
        const res = await request(app)
            .post('/api/auth/verify-email')
            .send({ token: 'not-a-real-token' });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('works end to end and the token cannot be reused', async () => {
        await request(app).post('/api/auth/register').send(validBody);
        const token = lastTokenFor(EMAIL);

        const verify = await request(app).post('/api/auth/verify-email').send({ token });
        expect(verify.status).toBe(200);

        const again = await request(app).post('/api/auth/verify-email').send({ token });
        expect(again.status).toBe(400);

        const agent = request.agent(app);
        const login = await agent
            .post('/api/auth/login')
            .send({ email: EMAIL, password: PASSWORD });
        expect(login.status).toBe(200);
        expect(login.body.data.user.email).toBe(EMAIL);
        expect(JSON.stringify(login.body)).not.toContain('passwordHash');

        const cookie = login.headers['set-cookie'][0];
        expect(cookie).toContain('campuskart_token=');
        expect(cookie).toContain('HttpOnly');

        const me = await agent.get('/api/auth/me');
        expect(me.status).toBe(200);
        expect(me.body.data.user.emailVerified).toBe(true);
        expect(JSON.stringify(me.body)).not.toContain('passwordHash');

        const logout = await agent.post('/api/auth/logout');
        expect(logout.status).toBe(200);

        const meAfter = await agent.get('/api/auth/me');
        expect(meAfter.status).toBe(401);
    });

    it('/me needs a cookie', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});