import { env } from '../config/env.js';

// used by tests (and handy in dev) to read the last emails "sent"
export const outbox = [];

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

// "CampusKart <me@gmail.com>"  ->  { name: "CampusKart", email: "me@gmail.com" }
function parseSender(from) {
    const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
    if (match) return { name: match[1] || 'CampusKart', email: match[2] };
    return { name: 'CampusKart', email: from.trim() };
}

export async function sendVerificationEmail(to, name, token) {
    const link = `${env.CLIENT_ORIGIN}/verify-email?token=${token}`;

    // No provider key: local development and tests only.
    if (!env.EMAIL_API_KEY) {
        if (env.NODE_ENV === 'production') {
            // Never print verification links in production logs.
            throw new Error('EMAIL_API_KEY is not set; cannot send verification email');
        }
        outbox.push({ to, link, token });
        if (outbox.length > 50) outbox.shift();
        if (env.NODE_ENV !== 'test') {
            console.log(`\n[email:dev] Verification link for ${to}:\n${link}\n`);
        }
        return;
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': env.EMAIL_API_KEY,
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            sender: parseSender(env.EMAIL_FROM),
            to: [{ email: to, name }],
            subject: 'Verify your CampusKart email',
            htmlContent: `<p>Hi ${escapeHtml(name)},</p>
<p>Confirm your college email to start using CampusKart:</p>
<p><a href="${link}">Verify my email</a></p>
<p>This link works for 24 hours. If you did not sign up, ignore this email.</p>`,
        }),
    });

    if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Email provider error ${res.status}: ${detail}`);
    }
}