import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env. Nothing was created.');
    process.exit(1);
}
if (password.length < 10) {
    console.error('ADMIN_PASSWORD must be at least 10 characters. Nothing was created.');
    process.exit(1);
}

await mongoose.connect(env.MONGODB_URI);

const passwordHash = await bcrypt.hash(password, 12);
await User.findOneAndUpdate(
    { email },
    {
        $set: { role: 'admin', emailVerified: true, passwordHash },
        $setOnInsert: { name: 'Admin', email },
    },
    { upsert: true }
);

console.log(`Admin account is ready for ${email}`);
await mongoose.disconnect();