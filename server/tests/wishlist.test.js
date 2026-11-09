import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import app from '../src/app.js';
import { Listing } from '../src/models/Listing.js';
import { User } from '../src/models/User.js';
import { Wishlist } from '../src/models/Wishlist.js';
import { outbox } from '../src/services/email.js';

const PASSWORD = 'Passw0rdTest';
let counter = 0;

function makeUserDoc(name, email) {
    return User.create({ name, email, passwordHash: 'not-a-real-hash', emailVerified: true });
}

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
        title: `Wishlist test item ${counter}`,
        description: 'A perfectly fine item in decent condition.',
        category: 'books',
        condition: 'good',
        price: 100,
        images: [{ url: 'https://example.com/x.jpg', publicId: `w/${counter}` }],
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
    await Promise.all([
        User.deleteMany({}),
        Listing.deleteMany({}),
        Wishlist.deleteMany({}),
    ]);
    outbox.length = 0;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('wishlist', () => {
    it('rejects logged-out users with 401', async () => {
        const res = await request(app).get('/api/wishlist');
        expect(res.status).toBe(401);
    });

    it('saves a listing and lists it', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        const listing = await addListing(seller.id);
        const { agent } = await makeLoggedInUser('buyer@snuniv.ac.in');

        const save = await agent.post(`/api/wishlist/${listing.id}`);
        expect(save.status).toBe(200);

        const res = await agent.get('/api/wishlist');
        expect(res.status).toBe(200);
        expect(res.body.data.ids).toEqual([listing.id]);
        expect(res.body.data.listings).toHaveLength(1);
    });

    it('saving twice keeps only one entry', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        const listing = await addListing(seller.id);
        const { agent } = await makeLoggedInUser('buyer@snuniv.ac.in');

        await agent.post(`/api/wishlist/${listing.id}`);
        const again = await agent.post(`/api/wishlist/${listing.id}`);
        expect(again.status).toBe(200);
        expect(await Wishlist.countDocuments()).toBe(1);
    });

    it('unsaves a listing', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        const listing = await addListing(seller.id);
        const { agent } = await makeLoggedInUser('buyer@snuniv.ac.in');

        await agent.post(`/api/wishlist/${listing.id}`);
        const del = await agent.delete(`/api/wishlist/${listing.id}`);
        expect(del.status).toBe(200);

        const res = await agent.get('/api/wishlist');
        expect(res.body.data.ids).toEqual([]);
    });

    it('cannot save your own listing', async () => {
        const { agent, id } = await makeLoggedInUser('owner@snuniv.ac.in');
        const listing = await addListing(id);

        const res = await agent.post(`/api/wishlist/${listing.id}`);
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('CANNOT_SAVE_OWN');
    });

    it('cannot save a removed listing, and removed listings drop out of the list', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        const listing = await addListing(seller.id);
        const gone = await addListing(seller.id, { status: 'removed' });
        const { agent } = await makeLoggedInUser('buyer@snuniv.ac.in');

        const blocked = await agent.post(`/api/wishlist/${gone.id}`);
        expect(blocked.status).toBe(404);

        await agent.post(`/api/wishlist/${listing.id}`);
        await Listing.updateOne({ _id: listing.id }, { status: 'removed' });

        const res = await agent.get('/api/wishlist');
        expect(res.body.data.listings).toHaveLength(0);
    });
});