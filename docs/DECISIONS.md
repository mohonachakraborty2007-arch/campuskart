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
## Phase 4: auth and deploy
- Login uses an httpOnly cookie (JWT, 7 days, sameSite lax), never localStorage.
- The browser only talks to the Vercel site; Next.js rewrites /api/* to the Render API. This keeps cookies same-origin, so there is no CORS or third-party cookie trouble on phones.
- Email: no provider yet. Verification links are printed in the Render logs (temporary fallback). Plan: add Resend (HTTP API; SMTP is blocked on Render free) before real students sign up.
- Atlas network access is 0.0.0.0/0 because Render free has no fixed IP. The database password protects it.