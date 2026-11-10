# CampusKart: Project Context

## Project summary
CampusKart is a student-only marketplace where verified college students and faculty
buy, sell and trade used books, electronics, notes and cycles. No payments. Built solo
as a learning and portfolio project.

## Tech stack
- Frontend: Next.js (App Router), JavaScript, Tailwind CSS, in /client
- Backend: Node.js + Express (ES modules), in /server
- Database: MongoDB Atlas with Mongoose
- Images: Cloudinary, uploaded through the server
- Validation: Zod
- Package manager: pnpm

## Features in the MVP
- Register and log in with a college email, with email verification
- Create, edit and delete listings with categories and image uploads
- Search and filters
- Listing detail page and seller profile
- Wishlist
- Contact seller (in-app inquiries)
- Mark as sold
- Report a listing

## Features NOT to build yet
- Payments
- Real-time chat
- Native mobile apps
- Ratings and reviews
- Digital file (PDF) uploads
- Multi-college support

## Folder structure
- client/  Next.js app (pages, components, lib)
- server/  Express API (src/config, models, middleware, routes, controllers, services)
- docs/    PROJECT_CONTEXT.md and DECISIONS.md

## API conventions
- Success: { "data": ... }
- Error: { "error": { "code": "...", "message": "...", "fields": {} } }
- All routes live under /api

## Security rules
- Login uses an httpOnly cookie, never localStorage
- The server re-checks permissions on every write
- No secrets in Git; use environment variables
- Validate all input on the server

## Current status
- [x] Phase 0
- [x] Phase 1: Environment, Git and GitHub
- [x] Phase 2: Project initialisation
- [x] Phase 3: UI (all pages on sample data)
- [x] Phase 4: Auth and Deploy
- [x] Phase 5: listings and images
- [x] Phase 6: search, filters, pagination, detail, seller profile
- [x] Phase 7: mvp-complete
- [x] Phase 8: style: polish, motion, accessibility, states
- [ ] Phase 9
- [ ] Phase 10

## Working rules for AI assistants
- Read this file and inspect the files you will touch first. Do not guess.
- Do small tasks. No unrelated refactors and no new dependencies without asking.
- Follow the existing structure and naming. No secrets in code.
- Add validation, error handling and tests only where the task asks.
- Explain key decisions in plain English. I am a beginner.
- Finish with: files changed, exact commands to verify, and anything you assumed.