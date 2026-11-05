import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

// Fake Cloudinary: no real uploads happen in tests.
vi.mock('../src/services/images.js', () => ({
    uploadBuffer: vi.fn(async () => ({
        url: 'https://example.com/fake.jpg',
        publicId: `fake/${Math.random().toString(36).slice(2)}`,
    })),
    deleteImage: vi.fn(async () => { }),
}));

import { env } from '../src/config/env.js';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Listing } from '../src/models/Listing.js';
import { outbox } from '../src/services/email.js';
import { deleteImage } from '../src/services/images.js';

const PASSWORD = 'Passw0rdTest';

// a tiny but real PNG (starts with the PNG signature)
const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
);

const listingFields = {
    title: 'Engineering Mathematics book',
    description: 'Good condition, no torn pages, with notes.',
    category: 'books',
    condition: 'good',
    price: '280',
};

async function makeUser(email, { verify = true } = {}) {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({ name: 'Test User', email, password: PASSWORD });
    if (verify) {
        const mail = [...outbox].reverse().find((m) => m.to === email);
        await request(app).post('/api/auth/verify-email').send({ token: mail.token });
        await agent.post('/api/auth/login').send({ email, password: PASSWORD });
    }
    return agent;
}

function postListing(agent, { photos = 1, fields = listingFields } = {}) {
    let req = agent.post('/api/listings');
    for (const [key, value] of Object.entries(fields)) req = req.field(key, value);
    for (let i = 0; i < photos; i++) {
        req = req.attach('images', PNG, { filename: `p${i}.png`, contentType: 'image/png' });
    }
    return req;
}

beforeAll(async () => {
    if (env.NODE_ENV !== 'test') throw new Error('Tests must run with NODE_ENV=test');
    if (!env.MONGODB_URI_TEST) throw new Error('Add MONGODB_URI_TEST to server/.env');
    if (env.MONGODB_URI_TEST === env.MONGODB_URI) {
        throw new Error('MONGODB_URI_TEST must be a different database from MONGODB_URI');
    }
    await mongoose.connect(env.MONGODB_URI_TEST);
    await User.init();
    await Listing.init();
});

beforeEach(async () => {
    await User.deleteMany({});
    await Listing.deleteMany({});
    outbox.length = 0;
    vi.clearAllMocks();
});

afterAll(async () => {
    await User.deleteMany({});
    await Listing.deleteMany({});
    await mongoose.disconnect();
});

describe('creating a listing', () => {
    it('needs a login (401)', async () => {
        const res = await postListing(request(app));
        expect(res.status).toBe(401);
    });

    it('needs a verified email (403)', async () => {
        const agent = request.agent(app);
        await agent
            .post('/api/auth/register')
            .send({ name: 'Unverified', email: 'unverified@snuniv.ac.in', password: PASSWORD });
        const res = await postListing(agent);
        // not logged in at all yet, because login is blocked until verification
        expect([401, 403]).toContain(res.status);
    });

    it('rejects invalid data (400)', async () => {
        const agent = await makeUser('a@snuniv.ac.in');
        const res = await postListing(agent, {
            fields: { ...listingFields, title: 'ab', price: '-5' },
        });
        expect(res.status).toBe(400);
        expect(res.body.error.fields.title).toBeTruthy();
        expect(res.body.error.fields.price).toBeTruthy();
    });

    it('rejects a listing with no photos (400)', async () => {
        const agent = await makeUser('a@snuniv.ac.in');
        const res = await postListing(agent, { photos: 0 });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('IMAGES_REQUIRED');
    });

    it('rejects a PDF renamed to .jpg (400)', async () => {
        const agent = await makeUser('a@snuniv.ac.in');
        let req = agent.post('/api/listings');
        for (const [k, v] of Object.entries(listingFields)) req = req.field(k, v);
        req = req.attach('images', Buffer.from('%PDF-1.4 not an image at all'), {
            filename: 'fake.jpg',
            contentType: 'image/jpeg',
        });
        const res = await req;
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('rejects more than 5 photos (400)', async () => {
        const agent = await makeUser('a@snuniv.ac.in');
        const res = await postListing(agent, { photos: 6 });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('TOO_MANY_FILES');
    });

    it('creates a listing for the logged-in user and ignores a fake seller id', async () => {
        const agent = await makeUser('a@snuniv.ac.in');
        const res = await postListing(agent, {
            photos: 3,
            fields: {
                ...listingFields,
                seller: '64b000000000000000000000',
                status: 'sold',
            },
        });
        expect(res.status).toBe(201);
        const listing = res.body.data.listing;
        expect(listing.images).toHaveLength(3);
        expect(listing.status).toBe('active');

        const me = await agent.get('/api/auth/me');
        expect(listing.seller).toBe(me.body.data.user.id);
    });
});

describe('changing a listing', () => {
    it('only the owner can edit, mark sold or delete (403 for others)', async () => {
        const owner = await makeUser('owner@snuniv.ac.in');
        const other = await makeUser('other@snuniv.ac.in');
        const created = await postListing(owner);
        const id = created.body.data.listing.id;

        const edit = await other.patch(`/api/listings/${id}`).field('title', 'Hacked title');
        expect(edit.status).toBe(403);

        const sold = await other.patch(`/api/listings/${id}/sold`);
        expect(sold.status).toBe(403);

        const del = await other.delete(`/api/listings/${id}`);
        expect(del.status).toBe(403);

        const stored = await Listing.findById(id);
        expect(stored.title).toBe(listingFields.title);
        expect(stored.status).toBe('active');
    });

    it('the owner can edit: remove one photo and add one', async () => {
        const owner = await makeUser('owner@snuniv.ac.in');
        const created = await postListing(owner, { photos: 2 });
        const listing = created.body.data.listing;
        const firstId = listing.images[0].publicId;

        const res = await owner
            .patch(`/api/listings/${listing.id}`)
            .field('title', 'Updated title here')
            .field('removeImages', firstId)
            .attach('images', PNG, { filename: 'new.png', contentType: 'image/png' });

        expect(res.status).toBe(200);
        expect(res.body.data.listing.title).toBe('Updated title here');
        expect(res.body.data.listing.images).toHaveLength(2);
        expect(res.body.data.listing.images.map((i) => i.publicId)).not.toContain(firstId);
        expect(deleteImage).toHaveBeenCalledWith(firstId);
    });

    it('soft delete hides the listing and "my listings" shows each status', async () => {
        const owner = await makeUser('owner@snuniv.ac.in');
        const created = await postListing(owner);
        const id = created.body.data.listing.id;

        const sold = await owner.patch(`/api/listings/${id}/sold`);
        expect(sold.status).toBe(200);
        expect(sold.body.data.listing.status).toBe('sold');

        const soldList = await owner.get('/api/users/me/listings?status=sold');
        expect(soldList.body.data.listings).toHaveLength(1);

        const del = await owner.delete(`/api/listings/${id}`);
        expect(del.status).toBe(200);
        expect(del.body.data.listing.status).toBe('removed');

        const again = await owner.patch(`/api/listings/${id}`).field('title', 'Edit after delete');
        expect(again.status).toBe(404);

        const all = await owner.get('/api/users/me/listings');
        expect(all.body.data.listings).toHaveLength(1);
        expect(all.body.data.listings[0].status).toBe('removed');
    });

    it('"my listings" needs a login (401)', async () => {
        const res = await request(app).get('/api/users/me/listings');
        expect(res.status).toBe(401);
    });
});