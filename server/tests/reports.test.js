import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import app from '../src/app.js';
import { Listing } from '../src/models/Listing.js';
import { Report } from '../src/models/Report.js';
import { User } from '../src/models/User.js';
import { outbox } from '../src/services/email.js';

const PASSWORD = 'Passw0rdTest';
let counter = 0;

async function makeLoggedInUser(email) {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({ name: 'Test User', email, password: PASSWORD });
    const mail = [...outbox].reverse().find((m) => m.to === email);
    await request(app).post('/api/auth/verify-email').send({ token: mail.token });
    await agent.post('/api/auth/login').send({ email, password: PASSWORD });
    const me = await agent.get('/api/auth/me');
    return { agent, id: me.body.data.user.id };
}

function addListing(sellerId, overrides = {}) {
    counter += 1;
    return Listing.create({
        seller: sellerId,
        title: `Report test item ${counter}`,
        description: 'A perfectly fine item in decent condition.',
        category: 'books',
        condition: 'good',
        price: 100,
        images: [{ url: 'https://example.com/x.jpg', publicId: `r/${counter}` }],
        ...overrides,
    });
}

async function setup() {
    const seller = await makeLoggedInUser('seller@snuniv.ac.in');
    const buyer = await makeLoggedInUser('buyer@snuniv.ac.in');
    const admin = await makeLoggedInUser('admin@snuniv.ac.in');
    await User.updateOne({ _id: admin.id }, { role: 'admin' });
    const listing = await addListing(seller.id);
    return { seller, buyer, admin, listing };
}

beforeAll(async () => {
    if (!env.MONGODB_URI_TEST || env.MONGODB_URI_TEST === env.MONGODB_URI) {
        throw new Error('Refusing to run tests on the main database');
    }
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.MONGODB_URI_TEST);
    }
});

beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Listing.deleteMany({}), Report.deleteMany({})]);
    outbox.length = 0;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('reports', () => {
    it('reporting the same listing twice gives 409', async () => {
        const { buyer, listing } = await setup();
        const url = `/api/listings/${listing.id}/reports`;
        const first = await buyer.agent.post(url).send({ reason: 'spam' });
        expect(first.status).toBe(201);
        const second = await buyer.agent.post(url).send({ reason: 'scam' });
        expect(second.status).toBe(409);
        expect(second.body.error.code).toBe('ALREADY_REPORTED');
    });

    it('cannot report your own listing', async () => {
        const { seller, listing } = await setup();
        const res = await seller.agent.post(`/api/listings/${listing.id}/reports`).send({ reason: 'spam' });
        expect(res.status).toBe(400);
    });

    it('rejects an invalid reason and over-long details', async () => {
        const { buyer, listing } = await setup();
        const url = `/api/listings/${listing.id}/reports`;
        const bad = await buyer.agent.post(url).send({ reason: 'because' });
        expect(bad.status).toBe(400);
        const long = await buyer.agent.post(url).send({ reason: 'spam', details: 'a'.repeat(301) });
        expect(long.status).toBe(400);
    });
});

describe('admin', () => {
    it('non-admins get 403, logged-out users get 401', async () => {
        const { buyer } = await setup();
        const asUser = await buyer.agent.get('/api/admin/reports');
        expect(asUser.status).toBe(403);
        const asGuest = await request(app).get('/api/admin/reports');
        expect(asGuest.status).toBe(401);
    });

    it('an admin sees open reports', async () => {
        const { buyer, admin, listing } = await setup();
        await buyer.agent.post(`/api/listings/${listing.id}/reports`).send({ reason: 'scam', details: 'Looks fake' });
        const res = await admin.agent.get('/api/admin/reports');
        expect(res.status).toBe(200);
        expect(res.body.data.reports).toHaveLength(1);
        expect(res.body.data.reports[0].reason).toBe('scam');
    });

    it('removing a listing hides it from browse and settles its reports', async () => {
        const { buyer, admin, listing } = await setup();
        await buyer.agent.post(`/api/listings/${listing.id}/reports`).send({ reason: 'prohibited' });
        const report = await Report.findOne();

        const res = await admin.agent.patch(`/api/admin/reports/${report.id}`).send({ action: 'remove-listing' });
        expect(res.status).toBe(200);

        const browse = await request(app).get('/api/listings');
        expect(browse.body.data.listings).toHaveLength(0);
        const open = await admin.agent.get('/api/admin/reports');
        expect(open.body.data.reports).toHaveLength(0);
    });

    it('dismissing keeps the listing live', async () => {
        const { buyer, admin, listing } = await setup();
        await buyer.agent.post(`/api/listings/${listing.id}/reports`).send({ reason: 'other' });
        const report = await Report.findOne();

        const res = await admin.agent.patch(`/api/admin/reports/${report.id}`).send({ action: 'dismiss' });
        expect(res.status).toBe(200);

        const browse = await request(app).get('/api/listings');
        expect(browse.body.data.listings).toHaveLength(1);
    });
});