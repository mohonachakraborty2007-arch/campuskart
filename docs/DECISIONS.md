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