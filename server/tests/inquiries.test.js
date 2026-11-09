import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import app from '../src/app.js';
import { Inquiry } from '../src/models/Inquiry.js';
import { Listing } from '../src/models/Listing.js';
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
        title: `Inquiry test item ${counter}`,
        description: 'A perfectly fine item in decent condition.',
        category: 'books',
        condition: 'good',
        price: 100,
        images: [{ url: 'https://example.com/x.jpg', publicId: `i/${counter}` }],
        ...overrides,
    });
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
    await Promise.all([User.deleteMany({}), Listing.deleteMany({}), Inquiry.deleteMany({})]);
    outbox.length = 0;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('inquiries', () => {
    it('rejects logged-out users with 401', async () => {
        const res = await request(app).get('/api/inquiries');
        expect(res.status).toBe(401);
    });

    it('cannot message yourself', async () => {
        const { agent, id } = await makeLoggedInUser('owner@snuniv.ac.in');
        const listing = await addListing(id);
        const res = await agent.post(`/api/listings/${listing.id}/inquiries`).send({ message: 'Hello me' });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('CANNOT_MESSAGE_SELF');
    });

    it('cannot message about a sold listing', async () => {
        const seller = await makeLoggedInUser('seller@snuniv.ac.in');
        const buyer = await makeLoggedInUser('buyer@snuniv.ac.in');
        const listing = await addListing(seller.id, { status: 'sold' });
        const res = await buyer.agent.post(`/api/listings/${listing.id}/inquiries`).send({ message: 'Still there?' });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('LISTING_SOLD');
    });

    it('rejects empty and too-long messages', async () => {
        const seller = await makeLoggedInUser('seller@snuniv.ac.in');
        const buyer = await makeLoggedInUser('buyer@snuniv.ac.in');
        const listing = await addListing(seller.id);
        const url = `/api/listings/${listing.id}/inquiries`;

        const empty = await buyer.agent.post(url).send({ message: '   ' });
        expect(empty.status).toBe(400);

        const long = await buyer.agent.post(url).send({ message: 'a'.repeat(501) });
        expect(long.status).toBe(400);
    });

    it('delivers a message to the seller only', async () => {
        const seller = await makeLoggedInUser('seller@snuniv.ac.in');
        const buyer = await makeLoggedInUser('buyer@snuniv.ac.in');
        const listing = await addListing(seller.id);

        const sent = await buyer.agent
            .post(`/api/listings/${listing.id}/inquiries`)
            .send({ message: 'Is this still available?' });
        expect(sent.status).toBe(201);

        const sellerInbox = await seller.agent.get('/api/inquiries');
        expect(sellerInbox.body.data.inquiries).toHaveLength(1);
        expect(sellerInbox.body.data.unread).toBe(1);
        expect(sellerInbox.body.data.inquiries[0].from.name).toBe('Test User');
        expect(JSON.stringify(sellerInbox.body)).not.toContain('buyer@snuniv.ac.in');

        const buyerInbox = await buyer.agent.get('/api/inquiries');
        expect(buyerInbox.body.data.inquiries).toHaveLength(0);
    });

    it('only the recipient can mark a message read', async () => {
        const seller = await makeLoggedInUser('seller@snuniv.ac.in');
        const buyer = await makeLoggedInUser('buyer@snuniv.ac.in');
        const listing = await addListing(seller.id);
        await buyer.agent.post(`/api/listings/${listing.id}/inquiries`).send({ message: 'Hi there' });
        const inquiry = await Inquiry.findOne();

        const stranger = await buyer.agent.patch(`/api/inquiries/${inquiry.id}/read`);
        expect(stranger.status).toBe(404);

        const ok = await seller.agent.patch(`/api/inquiries/${inquiry.id}/read`);
        expect(ok.status).toBe(200);

        const inbox = await seller.agent.get('/api/inquiries');
        expect(inbox.body.data.unread).toBe(0);
    });

    it('shares WhatsApp only if the seller opted in', async () => {
        const seller = await makeLoggedInUser('seller@snuniv.ac.in');
        const buyer = await makeLoggedInUser('buyer@snuniv.ac.in');
        const listing = await addListing(seller.id);
        const url = `/api/listings/${listing.id}/inquiries`;

        await seller.agent
            .patch('/api/users/me/settings')
            .send({ whatsapp: '+91 98300 12345', showWhatsapp: false });
        const hidden = await buyer.agent.post(url).send({ message: 'Hello' });
        expect(hidden.body.data.contact).toBeNull();

        await seller.agent.patch('/api/users/me/settings').send({ showWhatsapp: true });
        const shown = await buyer.agent.post(url).send({ message: 'Hello again' });
        expect(shown.body.data.contact.whatsapp).toBe('+9198300 12345'.replace(' ', ''));

        // never leaks on public endpoints
        const detail = await request(app).get(`/api/listings/${listing.id}`);
        expect(JSON.stringify(detail.body)).not.toContain('9830012345');
        const profile = await request(app).get(`/api/users/${seller.id}`);
        expect(JSON.stringify(profile.body)).not.toContain('9830012345');
    });
});

describe('settings', () => {
    it('rejects an invalid number', async () => {
        const { agent } = await makeLoggedInUser('user@snuniv.ac.in');
        const res = await agent.patch('/api/users/me/settings').send({ whatsapp: 'abc' });
        expect(res.status).toBe(400);
        expect(res.body.error.fields.whatsapp).toBeTruthy();
    });

    it('cannot show WhatsApp without a number', async () => {
        const { agent } = await makeLoggedInUser('user@snuniv.ac.in');
        const res = await agent.patch('/api/users/me/settings').send({ showWhatsapp: true });
        expect(res.status).toBe(400);
    });

    it('saves and returns settings', async () => {
        const { agent } = await makeLoggedInUser('user@snuniv.ac.in');
        const saved = await agent
            .patch('/api/users/me/settings')
            .send({ department: 'CSE', whatsapp: '+919830012345', showWhatsapp: true });
        expect(saved.status).toBe(200);

        const res = await agent.get('/api/users/me/settings');
        expect(res.body.data.settings.department).toBe('CSE');
        expect(res.body.data.settings.showWhatsapp).toBe(true);
    });
});