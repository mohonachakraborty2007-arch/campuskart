import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { toPublicUser } from '../utils/publicUser.js';
import {
    COOKIE_NAME,
    clearCookieOptions,
    cookieOptions,
    createVerifyToken,
    hashToken,
    signSession,
} from '../utils/tokens.js';
import { sendVerificationEmail } from '../services/email.js';

const BCRYPT_ROUNDS = 12;
const RESEND_COOLDOWN_MS = 60 * 1000;

// used so a wrong email takes the same time as a wrong password
let dummyHashPromise;
function getDummyHash() {
    dummyHashPromise ??= bcrypt.hash('not-a-real-password', BCRYPT_ROUNDS);
    return dummyHashPromise;
}

export async function register(req, res) {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verify = createVerifyToken();

    let user;
    try {
        user = await User.create({
            name,
            email,
            passwordHash,
            verifyTokenHash: verify.hash,
            verifyExpires: verify.expires,
            lastVerifyEmailAt: new Date(),
        });
    } catch (err) {
        // two people registering the same email at the same moment
        if (err.code === 11000) {
            throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
        }
        throw err;
    }

    let emailSent = true;
    try {
        await sendVerificationEmail(user.email, user.name, verify.token);
    } catch (err) {
        emailSent = false;
        console.error('Could not send verification email:', err.message);
    }

    res.status(201).json({
        data: {
            email: user.email,
            emailSent,
            message: emailSent
                ? 'Account created. Check your college inbox for the verification link.'
                : 'Account created, but we could not send the email. Use "Resend" in a minute.',
        },
    });
}

export async function verifyEmail(req, res) {
    const { token } = req.body;

    const user = await User.findOne({
        verifyTokenHash: hashToken(token),
        verifyExpires: { $gt: new Date() },
    }).select('+verifyTokenHash +verifyExpires');

    if (!user) {
        throw new AppError(400, 'INVALID_TOKEN', 'This link is invalid or has expired');
    }

    user.emailVerified = true;
    user.verifyTokenHash = undefined;
    user.verifyExpires = undefined;
    await user.save();

    res.json({ data: { message: 'Email verified. You can log in now.' } });
}

export async function resendVerification(req, res) {
    const { email } = req.body;
    const genericReply = {
        data: { message: 'If this account needs verification, a new link has been sent.' },
    };

    const user = await User.findOne({ email }).select('+lastVerifyEmailAt');
    if (!user || user.emailVerified) return res.json(genericReply);

    // quietly skip if asked again within 60 seconds
    const last = user.lastVerifyEmailAt?.getTime() ?? 0;
    if (Date.now() - last < RESEND_COOLDOWN_MS) return res.json(genericReply);

    const verify = createVerifyToken();
    user.verifyTokenHash = verify.hash;
    user.verifyExpires = verify.expires;
    user.lastVerifyEmailAt = new Date();
    await user.save();

    try {
        await sendVerificationEmail(user.email, user.name, verify.token);
    } catch (err) {
        console.error('Could not send verification email:', err.message);
    }

    res.json(genericReply);
}

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    const passwordOk = await bcrypt.compare(
        password,
        user?.passwordHash ?? (await getDummyHash())
    );

    // same message for "no such user" and "wrong password"
    if (!user || !passwordOk) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Wrong email or password');
    }

    if (!user.emailVerified) {
        throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Verify your college email before logging in');
    }

    res.cookie(COOKIE_NAME, signSession(user._id), cookieOptions());
    res.json({ data: { user: toPublicUser(user) } });
}

export function logout(req, res) {
    res.clearCookie(COOKIE_NAME, clearCookieOptions());
    res.json({ data: { message: 'Logged out' } });
}

export function me(req, res) {
    res.json({ data: { user: toPublicUser(req.user) } });
}