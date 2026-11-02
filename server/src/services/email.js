import { env } from '../config/env.js';

// used by tests (and handy in dev) to read the last emails "sent"
export const outbox = [];

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

export async function sendVerificationEmail(to, name, token) {
    const link = `${env.CLIENT_ORIGIN}/verify-email?token=${token}`;

    if (!env.EMAIL_API_KEY) {
        if (env.NODE_ENV !== 'production') {
            outbox.push({ to, link, token });
            if (outbox.length > 50) outbox.shift();
            if (env.NODE_ENV === 'development') {
                console.log(`\n[email:dev] Verification link for ${to}:\n${link}\n`);
            }
        }
        return;
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.EMAIL_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: env.EMAIL_FROM,
            to,
            subject: 'Verify your CampusKart email',
            html: `<p>Hi ${escapeHtml(name)},</p>
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