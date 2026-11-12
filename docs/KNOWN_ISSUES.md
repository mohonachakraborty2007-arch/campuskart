# Known issues

Last updated: Phase 10 (v1.0.0). This is an honest list of what is not done yet.

## Release blockers

None. Both earlier blockers are closed:

- Email provider: verification emails are now sent through Brevo. Links are never printed in production logs.
- Demo data: removed from the shared database with `pnpm seed:clear`.

## Known limitations

### Reliability
- **Render free tier sleeps** after 15 minutes without visitors. The first request afterwards can take up to ~50 seconds, and the site may briefly show an error. Fix: a keep-alive ping or a paid plan.
- **Local and live share one database** (Atlas `campuskart`). Running scripts locally changes live data. Tests use a separate `campuskart_test` database.

### Email
- **Verification emails come from a personal Gmail address** through Brevo, so they may land in spam, and Brevo shows DKIM/DMARC warnings. Fix: get a domain and authenticate it.
- **The Brevo API key expires** after 1 year, or after 90 days without use. When it does, create a new key and update `EMAIL_API_KEY` on Render.
- Brevo's free plan allows 300 emails per day.

### Security
- **Login rate limit is per IP only.** There is no per-account limit or lockout.
- **No password reset, no 2FA.**
- **Sessions last 7 days and cannot be revoked early.** A stolen cookie works until it expires.
- **No Content-Security-Policy** on the client yet. Other security headers are set.
- **Atlas network access is 0.0.0.0/0**, because Render's free tier has no fixed outbound IP. Protected by a strong password and a least-privilege database user.
- **Dev dependency advisory:** a `minimatch` advisory exists in dev tooling only. It is not part of the production runtime.

### Product
- **No account deletion or data export.**
- **Search matches whole words only** (no partial or typo matching).
- **Inquiries are one-way messages**, not a chat.
- **Orphaned records:** if a listing is deleted, wishlist entries, inquiries or reports that point to it are not cleaned up automatically.

### Code cleanup
- `ListingStatusProvider.js` is an unused leftover and can be removed.
- `sampleListings.js` is still used on purpose by the decorative hero cards.

## Ideas for later (Phase 11)
- Free domain or custom domain for email and a nicer URL
- Password reset by email
- Per-account login limiter and Content-Security-Policy
- Keep-alive ping for the Render server