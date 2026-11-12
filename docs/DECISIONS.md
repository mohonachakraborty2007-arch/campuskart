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
## Phase 7: Wishlist, contact seller, sold, report, admin

- **Wishlist** is stored on the server (unique per user and listing). The heart updates instantly and rolls back with a message if the server fails. Saving is safe to repeat.
- **Inquiries are one-way messages, not chat.** Max 500 characters, 10 per hour per user, none to yourself or to a sold or removed listing. The recipient always comes from the database, never from the request. There is no in-app reply yet, so the message box asks buyers to say how to reach them.
- **WhatsApp is opt-in** (default off). The seller's number is shown to a buyer only after that buyer sends a message, and it never appears on listings or profiles.
- **Reports:** one per person per listing (duplicate gives 409). Admin can remove a listing, which settles all its open reports, or dismiss one report.
- **Admin:** created by `pnpm admin:create` from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, never from code. `requireAdmin` re-checks the role in the database on every request. The admin page has no menu link; the server check is the real lock.
- **Known limitations:** no email or push notifications, no real-time chat, no user banning (all deferred by the blueprint).
## Phase 8: Polish, motion, accessibility, states

- **Motion is CSS only**, with no animation library. A global `prefers-reduced-motion` rule switches it off. New in this phase: heart pop, hero cards tilting toward the mouse (desktop mouse only).
- **Hero cards are decoration**, so they are `inert` (no links, no focus). They still use sample data on purpose.
- **Card images** are resized by Cloudinary (`f_auto,q_auto,w_600`) and lazy-loaded.
- **Category tiles** show short descriptions instead of counts, because real counts would need a new server endpoint. Revisit later.
- **The home ticker** shows real listings and hides itself with fewer than 3.
- **Share previews:** Next.js generates the social image (`opengraph-image.js`). `SITE_URL` is set in Vercel.
- **Lighthouse:** 100 on the home page, `/listings` and a listing detail.
# Known issues and limits

Checks done so far catch common mistakes. They do not prove the app is secure, and there has been no independent security review.

## Must fix before real students (release blockers)
- Email provider (Resend) not added yet. Until then, verification links are printed in server logs.
- Seed/demo data still in the shared database. Run `pnpm seed:clear`.
- Rate-limit behind Vercel proxy: result of live test pending.

## Later
- Registering with an existing email reveals that it is registered (common trade-off).
- No password reset, account lockout or 2FA.
- Login sessions last 7 days and cannot be revoked from the server.
- No Content-Security-Policy yet (basic security headers are set).
- `minimatch` (dev tool via eslint-config-next) has a moderate advisory. Not shipped to users.
- No account deletion or data export.
- Local development and the live site share one Atlas database.
- Search matches whole words only.
- The free Render instance sleeps after 15 minutes of inactivity; the first request afterwards can fail or take ~50 seconds. Consider a keep-alive ping or a paid instance.
## Must fix before real students (release blockers)
- Email provider (Resend) not added yet. Until then, verification links are printed in server logs.
- Seed/demo data still in the shared database. Run `pnpm seed:clear`.

## Later
- Login rate limit is per internet address only (10 tries per 15 minutes, verified live). No per-account limit, so a distributed guessing attack is not blocked.
- The free Render instance sleeps after 15 minutes of inactivity; the first request afterwards can fail or take ~50 seconds. Consider a keep-alive ping or a paid instance.

## Phase 9: Testing and security hardening

- **Tests:** 75 server tests pass. They cover permissions on every write route (logged-out requests get 401, non-admins get 403, non-owners get 403), query-injection and mass-assignment attempts, upload type/size/count checks, duplicate reports and the cookie flags.
- **Manual checks done on the live site:** cookie flags (HttpOnly, Secure, SameSite=Lax), security headers on both Vercel and the API, and the login rate limit behind the Vercel to Render proxy (each internet address gets its own counter).
- **Secrets:** search of the repo and Git history found none. Demo logins file (`authDemo.js`) deleted. `JWT_SECRET` differs between local and Render.
- **Database access:** the app uses a dedicated user (`campuskart_app`) limited to the `campuskart` and `campuskart_test` databases. The old `readWriteAnyDatabase` user was deleted.
- **Hardening applied:** JWT algorithm pinned to HS256; security headers added to the Vercel site (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`); powered-by header removed.
- **Dependencies:** server audit clean. Client audit has one moderate advisory (`minimatch`, via a dev-only tool, not shipped to users); left alone on purpose, since forcing updates the night before launch is riskier.
- **Not done / known limits** (see `docs/KNOWN_ISSUES.md`): no Resend email provider yet, demo data still in the shared database, per-address login limit only, Render free instance sleeps, no password reset or 2FA, no Content-Security-Policy on the client.
- **These checks catch common mistakes. They do not prove the app is secure, and there has been no independent security review.**

## Phase 10 — Production deployment and verification (done)

**Live site:** https://campuskart-vert.vercel.app
**Release:** v1.0.0

### Production setup
| Part | Service | Notes |
|---|---|---|
| Site | Vercel | Env: `API_ORIGIN`, `SITE_URL` |
| API | Render (free) | https://campuskart-api-ejoi.onrender.com, `NODE_ENV=production` |
| Database | MongoDB Atlas (free) | DB `campuskart`; least-privilege user `campuskart_app` |
| Images | Cloudinary | Keys set on Render |
| Email | Brevo (free, HTTP API) | `EMAIL_API_KEY`, `EMAIL_FROM` set on Render |

The browser talks only to the Vercel site. Next.js rewrites `/api/*` to the Render API, so the login cookie is same-origin.

### Verified in production
- Register with a college email: verification email arrived in the inbox, link works
- Login cookie: HttpOnly, Secure, SameSite=Lax
- Admin account works live, including on mobile data
- Demo data removed with `pnpm seed:clear`
- 75 automated tests pass; dependency audit clean at release
- Verification links are never printed in production logs

### What changed in this phase
- `server/src/services/email.js`: sends through Brevo; in production a missing key throws instead of logging a link
- `server/src/config/env.js`: neutral `EMAIL_FROM` default
- README rewritten: live link, architecture diagram, security notes, limits
- `docs/DECISIONS.md` and `docs/KNOWN_ISSUES.md` updated

### Still open (see docs/KNOWN_ISSUES.md)
- Render free tier sleeps when idle
- Emails sent from a personal address may land in spam
- No password reset, lockout or 2FA; no Content-Security-Policy

### Next
Phase 11 — post-launch: real users, feedback, fixes, optional domain.