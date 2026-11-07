import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Listing } from '../models/Listing.js';
import { User } from '../models/User.js';

if (env.NODE_ENV === 'production') {
    console.error('Seeding is blocked when NODE_ENV=production.');
    process.exit(1);
}

// every demo user has an email like seed.aarav@snuniv.ac.in, so we can find and remove them
const SEED_EMAIL = /^seed\.[a-z]+@snuniv\.ac\.in$/;

const demoUsers = [
    { key: 'aarav', name: 'Aarav Sen', department: 'Computer Science', year: 2 },
    { key: 'diya', name: 'Diya Roy', department: 'Electronics', year: 3 },
    { key: 'kabir', name: 'Kabir Mehta', department: 'Mechanical', year: 1 },
];

const colors = ['1A1D29', '23263A', '2A2E42'];

function photos(title, count, slug) {
    return Array.from({ length: count }, (_, i) => ({
        url: `https://placehold.co/800x600/${colors[i % colors.length]}/F4F5FA.png?text=${encodeURIComponent(title)}`,
        publicId: `seed/${slug}-${i + 1}`,
    }));
}

// [seller, category, condition, price, title, description, pickupSpot, extras]
const items = [
    ['aarav', 'books', 'good', 280, 'Engineering Mathematics II, Grewal', 'Latest edition with a little highlighting in chapters 3 and 4. Everything else is clean.', 'Library entrance', { photoCount: 3 }],
    ['aarav', 'books', 'like-new', 220, 'Let Us C, Yashavant Kanetkar', 'Barely used, no writing inside. Great for the first programming course.', 'Main canteen', {}],
    ['diya', 'books', 'fair', 150, 'Basic Electrical Engineering, Kothari', 'Cover is worn but all pages are intact. Solved examples are marked.', 'Block A lobby', {}],
    ['kabir', 'electronics', 'like-new', 650, 'Casio fx-991EX scientific calculator', 'Works perfectly, comes with the cover. Used for one semester only.', 'Block A lobby', { photoCount: 2 }],
    ['diya', 'electronics', 'good', 900, 'Wireless headphones, 20 hour battery', 'Clear sound, charges with a USB-C cable. Small scratch on the left side.', 'Hostel gate', {}],
    ['aarav', 'electronics', 'good', 700, 'Arduino Uno starter kit with sensors', 'Board, breadboard, jumper wires and 10 sensors. Everything tested.', 'Library entrance', { openToExchange: true, exchangeWants: 'Raspberry Pi or a multimeter', photoCount: 3 }],
    ['kabir', 'cycles', 'good', 3200, 'Hero Sprint 21-speed cycle', 'Serviced last month, new brake pads. Selling because I am graduating.', 'Hostel cycle stand', { photoCount: 3 }],
    ['diya', 'cycles', 'like-new', 4800, 'Hybrid city cycle with lock and basket', 'Ridden for two months only. Comes with a lock, basket and a bell.', 'Main gate', { photoCount: 2 }],
    ['aarav', 'notes', 'good', 60, 'Handwritten Physics notes, semester 1', 'Neat notes for all units with solved previous year questions.', 'Library entrance', { sold: true }],
    ['diya', 'notes', 'good', 0, 'Engineering Drawing sheets, printed and solved', 'Free to a junior who needs them. Pick up from the library.', 'Library entrance', {}],
    ['kabir', 'hostel', 'like-new', 350, 'Study table lamp, rechargeable', 'Three brightness levels, lasts about 6 hours on a full charge.', 'Hostel gate', {}],
    ['diya', 'hostel', 'good', 800, 'Foldable study table for hostel room', 'Sturdy and folds flat. Easy to carry, I can help move it.', 'Hostel block C', { photoCount: 2 }],
    ['aarav', 'clothing', 'good', 150, 'Lab coat, size M', 'Washed and ironed, no stains. Used for one year.', 'Block A lobby', { sold: true }],
    ['kabir', 'clothing', 'like-new', 700, 'Winter jacket, size L', 'Worn only a few times last winter. Warm and lightweight.', 'Main canteen', {}],
    ['diya', 'stationery', 'good', 180, 'Drafter and geometry box', 'Complete set, the drafter moves smoothly. Needed for Engineering Drawing.', 'Library entrance', {}],
    ['kabir', 'stationery', 'new', 90, 'Lab record file with practical sheets', 'Unused file with printed practical sheets for the mechanical lab.', 'Block B corridor', { sold: true }],
    ['aarav', 'other', 'good', 300, 'Electric kettle, 1.5 litre', 'Auto switch-off, works well. Good for hostel rooms.', 'Hostel gate', {}],
    ['diya', 'other', 'fair', 250, 'Bedside storage rack, 3 shelves', 'A few scratches but very stable. Easy to assemble.', 'Hostel block C', { openToExchange: true, exchangeWants: 'A desk fan' }],
];

async function clearSeed() {
    const users = await User.find({ email: SEED_EMAIL }).select('_id');
    const ids = users.map((u) => u._id);
    const listings = await Listing.deleteMany({ seller: { $in: ids } });
    const removed = await User.deleteMany({ _id: { $in: ids } });
    return { users: removed.deletedCount, listings: listings.deletedCount };
}

async function createSeed() {
    const sellers = {};
    for (const u of demoUsers) {
        // nobody can log in as a demo user: the password is random and thrown away
        const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
        sellers[u.key] = await User.create({
            name: u.name,
            email: `seed.${u.key}@snuniv.ac.in`,
            passwordHash,
            emailVerified: true,
            department: u.department,
            year: u.year,
        });
    }

    const now = Date.now();
    const docs = items.map(([sellerKey, category, condition, price, title, description, pickupSpot, extras], i) => {
        const createdAt = new Date(now - i * 7 * 60 * 60 * 1000); // spread over a few days
        return {
            seller: sellers[sellerKey]._id,
            title,
            description,
            category,
            condition,
            price,
            pickupSpot,
            openToExchange: extras.openToExchange ?? false,
            exchangeWants: extras.exchangeWants ?? '',
            images: photos(title, extras.photoCount ?? 1, `item-${i + 1}`),
            status: extras.sold ? 'sold' : 'active',
            soldAt: extras.sold ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) : undefined,
            createdAt,
        };
    });

    await Listing.insertMany(docs);
    return { users: demoUsers.length, listings: docs.length };
}

async function main() {
    await mongoose.connect(env.MONGODB_URI);
    await Promise.all([User.init(), Listing.init()]);

    const cleared = await clearSeed();
    if (process.argv.includes('--clear')) {
        console.log(`Removed demo data: ${cleared.users} users, ${cleared.listings} listings.`);
    } else {
        const created = await createSeed();
        console.log(`Created demo data: ${created.users} users, ${created.listings} listings.`);
    }
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});