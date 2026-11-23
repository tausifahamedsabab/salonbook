# SalonBook — Salon Appointment Booking Platform

SalonBook lets customers browse salon services, request appointments, track their status and pay for
confirmed bookings with Stripe. An administrator manages services, appointments, customers and
payment transactions through a dedicated dashboard.

## Important Features

- **Public**: home page with featured services/categories, service search, category filter and price sorting (`/services`).
- **Customers**: sign up / sign in (email + Google), book appointments on protected service-detail pages,
  view/cancel own requests, pay for confirmed appointments, view payment history, edit own profile.
- **Admin**: manage services (create/update/delete, image upload via ImgBB, activate/deactivate),
  confirm/cancel appointments, block/unblock customers, read-only transaction records, dashboard statistics.
- **Auth & security**: Better Auth sessions, server-side role checks on every protected API, JWT verification
  middleware, blocked-user enforcement, public registration can never create an admin.
- **Payments**: Stripe Checkout; payment status and transaction records are written only after a verified webhook.
- **UX**: toast notifications, loading states, responsive salon-themed UI, footer with contact details.

## Technology Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- Node.js + Express.js REST API
- MongoDB (Mongoose) with Better Auth's own auth collections
- JWT (`jsonwebtoken`), Stripe, ImgBB, Google OAuth
- Better Auth for email/password and social authentication

## Installation Instructions

Requires Node.js ≥ 20 and a MongoDB instance (local or MongoDB Atlas).

```bash
# Client (Next.js)
cd salonbook
npm install

# Server (Express API)
cd ../salonbook-server
npm install
```

Copy the provided `.env.example` files to `.env` in each repository and fill in real values locally.
`.env` files are gitignored and must never be committed.

## How to Run the Project Locally

1. Start MongoDB. `npm run mongo` in the client starts a zero-config in-memory MongoDB on port 27017,
   or use your own instance and set `MONGODB_URI`.
2. Start the API (port 5000): `npm run api` from the client (or `npm start` in `salonbook-server`).
3. Start the frontend (port 3000): `npm run dev` from the client.
4. Open http://localhost:3000. The seeded administrator signs in at `/sign-in` using `ADMIN_EMAIL` /
   `ADMIN_PASSWORD` from the server `.env`. Customers register at `/sign-up`.
5. Optional checks: `npm run lint`, `npm run build`, `node scripts/smoke-test.js` (needs the server running
   and admin credentials present in the server `.env`).

## Required Environment Variables (names only — never commit values)

| Variable | Purpose |
| --- | --- |
| `PORT` | Express API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to verify backend JWTs |
| `BETTER_AUTH_SECRET` | Better Auth encryption/signing secret (required in production) |
| `BETTER_AUTH_URL` | Public base URL of the backend (required in production, no trailing slash; does not fall back to `APP_URL`) |
| `APP_URL` | Public URL of the frontend — used for CORS, trusted origins and Stripe redirects |
| `AUTH_COOKIE_CROSS_SITE` | Set to `true` when client and API are on different sites (SameSite=None; Secure) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seeded admin account (created once at startup) |
| `ALLOW_ADMIN_REGISTRATION` | Must remain `false`; public admin registration is disabled |
| `NEXT_PUBLIC_API_URL` | Backend base URL used by the frontend (required in production) |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe test-mode credentials |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key exposed to the browser |
| `IMGBB_API_KEY` | Image-hosting API key |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URL` | Google OAuth credentials |

## Live Website Link

_Live URL to be added here after deployment._

## Client and Server Repository Links

- Client: https://github.com/tausifahamedsabab/salonbook
- Server: https://github.com/tausifahamedsabab/salonbook-server

## Deployment Guideline

1. **Database**: provision MongoDB Atlas and allow the backend's IP (or `0.0.0.0/0` for serverless).
2. **Backend** (Render/Railway/Fly/etc.): deploy `salonbook-server`, set all server variables above, especially
   `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `APP_URL`, `MONGODB_URI` and the Stripe keys. The service must
   listen on `PORT` and expose `/health`. The seed creates the admin account on first start.
3. **Frontend** (Vercel/etc.): deploy `salonbook` with `NEXT_PUBLIC_API_URL` pointing at the deployed backend
   (no trailing slash). Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for payments.
4. **Origins/cookies**: set `APP_URL` to the deployed frontend URL so CORS, Better Auth trusted origins and
   Stripe success/cancel URLs match. If frontend and backend use different sites, set
   `AUTH_COOKIE_CROSS_SITE=true` and keep all production traffic on HTTPS.
5. **Stripe webhook**: register `https://<backend>/api/webhooks/stripe` for `checkout.session.completed`,
   `checkout.session.async_payment_succeeded` and `payment_intent.payment_failed`; set `STRIPE_WEBHOOK_SECRET`
   to the endpoint signing secret. Never expose it to the client.
6. **Google OAuth**: add `https://<backend>/api/auth/callback/google` as an authorised redirect URI.
7. Verify: health endpoint, sign in as admin, customer booking, Stripe test payment, webhook-driven status update,
   direct refresh of private routes, and logout/login persistence.

## Architecture Notes

- Data lives in four main collections: `user` (Better Auth, with `role` and `isBlocked`), `services`,
  `appointments` and `transactions`. No duplicate payment collection exists.
- `src/proxy.ts` (Next 16's replacement for middleware) guards `/admin/*` and `/customer/*` server-side;
  `src/lib/serverApi.ts` adds role checks for server-rendered pages. The Express middleware
  (`requireAuth`/`requireRole`, JWT verification) enforces the same rules on the API.
- Sessions are Better Auth cookies; `src/lib/session.ts` keeps the navbar in sync after login/logout.
- `src/lib/apiUrl.ts` requires `NEXT_PUBLIC_API_URL` in production so a missing deployment variable fails fast.
