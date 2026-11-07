import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import app from '../src/app.js';
import { Listing } from '../src/models/Listing.js';
import { User } from '../src/models/User.js';
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
        title: `Test item number ${counter}`,
        description: 'A perfectly fine item in decent condition.',
        category: 'books',
        condition: 'good',
        price: 100,
        images: [{ url: 'https://example.com/x.jpg', publicId: `t/${counter}` }],
        ...overrides,
    });
}

beforeAll(async () => {
    if (env.NODE_ENV !== 'test') throw new Error('Tests must run with NODE_ENV=test');
    if (!env.MONGODB_URI_TEST) throw new Error('Add MONGODB_URI_TEST to server/.env');
    if (env.MONGODB_URI_TEST === env.MONGODB_URI) {
        throw new Error('MONGODB_URI_TEST must be a different database from MONGODB_URI');
    }
    await mongoose.connect(env.MONGODB_URI_TEST);
    await Promise.all([User.init(), Listing.init()]);
});

beforeEach(async () => {
    await User.deleteMany({});
    await Listing.deleteMany({});
    outbox.length = 0;
});

afterAll(async () => {
    await User.deleteMany({});
    await Listing.deleteMany({});
    await mongoose.disconnect();
});

describe('GET /api/listings', () => {
    it('shows only active listings and pages correctly', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        for (let i = 0; i < 5; i++) await addListing(seller._id);
        await addListing(seller._id, { status: 'sold' });
        await addListing(seller._id, { status: 'removed' });

        const all = await request(app).get('/api/listings');
        expect(all.status).toBe(200);
        expect(all.body.data.meta.total).toBe(5);

        const page3 = await request(app).get('/api/listings?limit=2&page=3');
        expect(page3.body.data.listings).toHaveLength(1);
        expect(page3.body.data.meta).toEqual({ page: 3, limit: 2, total: 5, pages: 3 });
    });

    it('caps the page size at 24', async () => {
        const res = await request(app).get('/api/listings?limit=100');
        expect(res.status).toBe(200);
        expect(res.body.data.meta.limit).toBe(24);
    });

    it('combines category, condition, price and exchange filters', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        await addListing(seller._id, { title: 'Book A exact', price: 100 });
        await addListing(seller._id, { title: 'Book B pricey', price: 500 });
        await addListing(seller._id, { title: 'Book C fair', price: 150, condition: 'fair' });
        await addListing(seller._id, { title: 'Cycle D', price: 120, category: 'cycles' });
        await addListing(seller._id, { title: 'Book E swap', price: 140, openToExchange: true });

        const res = await request(app).get(
            '/api/listings?category=books&condition=good&minPrice=100&maxPrice=200'
        );
        expect(res.body.data.listings.map((l) => l.title).sort()).toEqual([
            'Book A exact',
            'Book E swap',
        ]);

        const swap = await request(app).get(
            '/api/listings?category=books&condition=good&minPrice=100&maxPrice=200&exchange=true'
        );
        expect(swap.body.data.listings.map((l) => l.title)).toEqual(['Book E swap']);
    });

    it('sorts by price', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        for (const price of [300, 100, 200]) await addListing(seller._id, { price });

        const asc = await request(app).get('/api/listings?sort=price_asc');
        expect(asc.body.data.listings.map((l) => l.price)).toEqual([100, 200, 300]);

        const desc = await request(app).get('/api/listings?sort=price_desc');
        expect(desc.body.data.listings.map((l) => l.price)).toEqual([300, 200, 100]);
    });

    it('searches by whole words in title and description', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        await addListing(seller._id, { title: 'Casio scientific calculator' });
        await addListing(seller._id, { title: 'Mountain cycle', category: 'cycles' });

        const res = await request(app).get('/api/listings?q=calculator');
        expect(res.status).toBe(200);
        expect(res.body.data.listings).toHaveLength(1);
        expect(res.body.data.listings[0].title).toBe('Casio scientific calculator');
    });

    it('rejects invalid or dangerous query options (400)', async () => {
        const bad = [
            '/api/listings?minPrice[$gt]=0',
            '/api/listings?category[$ne]=books',
            '/api/listings?q[$ne]=x',
            '/api/listings?bogus=1',
            '/api/listings?category=books&category=cycles',
            '/api/listings?category=nope',
            '/api/listings?minPrice=300&maxPrice=100',
            '/api/listings?page=0',
            `/api/listings?q=${'a'.repeat(61)}`,
        ];
        for (const url of bad) {
            const res = await request(app).get(url);
            expect(res.status, url).toBe(400);
            expect(res.body.error.code).toBe('VALIDATION_ERROR');
        }
    });
});

describe('GET /api/listings/:id', () => {
    it('returns 400 for a bad id and 404 for an unknown one', async () => {
        const bad = await request(app).get('/api/listings/abc');
        expect(bad.status).toBe(400);
        expect(bad.body.error.code).toBe('INVALID_ID');

        const unknown = await request(app).get(`/api/listings/${new mongoose.Types.ObjectId()}`);
        expect(unknown.status).toBe(404);
    });

    it('shows a listing with public seller info only', async () => {
        const seller = await makeUserDoc('Public Seller', 'private.email@snuniv.ac.in');
        const listing = await addListing(seller._id);

        const res = await request(app).get(`/api/listings/${listing._id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.listing.seller.name).toBe('Public Seller');

        const text = JSON.stringify(res.body);
        expect(text).not.toContain('private.email');
        expect(text).not.toContain('passwordHash');
    });

    it('shows sold listings', async () => {
        const seller = await makeUserDoc('Seller', 'seller@snuniv.ac.in');
        const listing = await addListing(seller._id, { status: 'sold' });
        const res = await request(app).get(`/api/listings/${listing._id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.listing.status).toBe('sold');
    });

    it('hides a removed listing from everyone except its owner', async () => {
        const owner = await makeLoggedInUser('owner@snuniv.ac.in');
        const other = await makeLoggedInUser('other@snuniv.ac.in');
        const listing = await addListing(owner.id, { status: 'removed' });
        const url = `/api/listings/${listing._id}`;

        expect((await request(app).get(url)).status).toBe(404);
        expect((await other.agent.get(url)).status).toBe(404);
        expect((await owner.agent.get(url)).status).toBe(200);
    });
});

describe('GET /api/users/:id', () => {
    it('shows a public profile with counts and no private data', async () => {
        const seller = await makeUserDoc('Profile Person', 'secret.person@snuniv.ac.in');
        await addListing(seller._id);
        await addListing(seller._id);
        await addListing(seller._id, { status: 'sold' });
        await addListing(seller._id, { status: 'removed' });

        const res = await request(app).get(`/api/users/${seller._id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.user.name).toBe('Profile Person');
        expect(res.body.data.user.counts).toEqual({ active: 2, sold: 1 });
        expect(res.body.data.listings.active).toHaveLength(2);
        expect(res.body.data.listings.sold).toHaveLength(1);

        const text = JSON.stringify(res.body);
        expect(text).not.toContain('secret.person');
        expect(text).not.toContain('passwordHash');
    });

    it('returns 400 for a bad id and 404 for an unknown user', async () => {
        expect((await request(app).get('/api/users/abc')).status).toBe(400);
        expect(
            (await request(app).get(`/api/users/${new mongoose.Types.ObjectId()}`)).status
        ).toBe(404);
    });
});