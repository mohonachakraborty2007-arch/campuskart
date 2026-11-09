import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 60,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        // never returned unless we ask for it with .select('+passwordHash')
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ['student', 'professor', 'admin'],
            default: 'student',
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        // we store only a HASH of the verification token, never the token itself
        verifyTokenHash: {
            type: String,
            select: false,
        },
        verifyExpires: {
            type: Date,
            select: false,
        },
        // used for the 60-second resend cool-down
        lastVerifyEmailAt: {
            type: Date,
            select: false,
        },
        whatsapp: { type: String, trim: true, default: '' },
        showWhatsapp: { type: Boolean, default: false },
        department: {
            type: String,
            trim: true,
            maxlength: 80,
        },
        year: {
            type: Number,
            min: 1,
            max: 6,
        },
    },
    { timestamps: true }
);

export const User = mongoose.model('User', userSchema);