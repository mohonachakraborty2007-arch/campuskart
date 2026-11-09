# CampusKart: Decisions Log

## Tool versions (recorded 2026-10-28)
- Node.js: v24.22.1
- pnpm: 12.9.1
- Git: 2.55.0.windows.3

## Decisions

| Date | Decision | Reason | Alternatives rejected |
|---|---|---|---|
| 2026-10-28 | JavaScript, not TypeScript | Faster for a beginner on a short deadline | TypeScript |
| 2026-10-28 | Separate Express API in /server | Clear backend to learn and show on a resume | Next.js API routes only |
| 2026-10-28 | Login with an httpOnly cookie | Safer than storing tokens in the browser | localStorage tokens |
| 2026-10-28 | Cloudinary uploads go through the server | Server checks file type and size first | Direct browser uploads |
| 2026-10-28 | In-app inquiries instead of real-time chat | Much less work for the deadline | Real-time chat |
| 2026-10-28 | No payments | Out of scope for the MVP | Online payments |
## Phase 4: Authentication, email verification, early deploy

- **Login uses an httpOnly cookie** (`campuskart_token`, JWT, 7 days). JavaScript in the browser cannot read it, so a script injected into the page cannot steal it.
- **The browser talks only to the site.** Next.js `rewrites` forward `/api/*` to the Render API, so cookies stay same-origin and still work on phones with strict cookie settings.
- **Only college email domains can register** (`ALLOWED_EMAIL_DOMAINS`).
- **Verification tokens are random, and only their SHA-256 hash is stored.** A leaked database cannot be used to verify accounts. Tokens expire after 24 hours.
- **Resending the verification email has a 60-second cool-down.** It fails silently, so the endpoint does not reveal whether an email exists.
- **Login gives the same generic error** for a wrong email and a wrong password, so attackers cannot discover which emails are registered. An unverified account gets a separate 403 `EMAIL_NOT_VERIFIED`.
- **Rate limit:** 10 requests per 15 minutes on register, verify, resend and login.
- **Email provider (open):** none yet. The verification link is printed in the Render logs (search "fallback"). Before real students sign up I will add Resend, because Render's free tier blocks SMTP. If email is not possible, I will use admin approval. Open registration is never shipped.
- **Local and live share one Atlas database** (`campuskart`). Tests use a separate `campuskart_test` database with guards.

## Phase 5: Listings and image uploads

- **Photos are compressed in the browser** (1600px, JPEG 0.8) and then sent to the API, which uploads them to Cloudinary (`campuskart/listings`).
- **Upload limits:** at most 5 photos of 5 MB each, JPEG, PNG or WebP. The server checks the real file bytes (magic bytes), not just the file extension.
- **Delete is soft:** a removed listing gets `status: removed` and is not erased.
- **Removing a photo on edit** deletes it from Cloudinary, but only after the database save succeeds.
- **Ownership is checked on the server** for edit, delete and mark-sold. Another user gets 403.
- **The server ignores `seller` and `status` sent by the client.**
- **Validation uses zod on the server**, with errors returned as `{ error: { code, message, fields } }`.

## Phase 6: Browse, search, filters, detail, seller profile

- **Filters live in the URL** (`q`, `category`, `condition`, `exchange`, `minPrice`, `maxPrice`, `sort`, `page`), with the same names as the API. Reload and shared links work.
- **The server does all the filtering.** The query is validated with a strict zod schema, and the database filter is built only from validated values. This blocks query injection.
- **Search uses MongoDB `$text`**, so it matches whole words only ("calculator" works, "calc" does not). This is a known limitation, and the browse page says so. Fuzzy search may come later.
- **Page size is clamped to 24** on the server.
- **A removed listing returns 404** to everyone except its owner (and admins).
- **An invalid listing id returns 400 `INVALID_ID`**, not a server error.
- **The public seller profile never exposes email.** It shows only the name, department, year, member-since date and verified badge.
- **The detail page loads in the browser**, so an owner who is logged in can still see their own removed listing.
- **Still demo until Phase 7:** Save, Contact and Report on a listing, and the saved-items page. 