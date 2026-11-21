# SalonBook — Salon Appointment Booking Platform

SalonBook lets customers browse salon services, view service details and request appointments online,
and lets the salon administrator manage services, appointment requests, payments and customers.
Customers can manage their own appointments and pay for confirmed appointments via Stripe.

It is a beginner-friendly, role-based web application built with:

- **Frontend**: Next.js 16 (App Router, Turbopack, TypeScript) — Home, Services (browse/search/filter),
  Service details + appointment request forms, sign in/up, Customer dashboard/appointments/payments,
  and Admin dashboard/services/appointments/payments/customers.
- **Backend API**: Express.js REST API — JWT authentication (jsonwebtoken + bcryptjs), services
  (CRUD + category/search + image uploads via ImgBB), appointments (create/list/confirm/cancel),
  payments (Stripe Checkout), customers (admin view), and a Stripe webhook.
- **Database**: MongoDB with Mongoose.

## Requirements

- Node.js ≥ 20
- A running MongoDB instance (default `mongodb://127.0.0.1:27017/salonbook`)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start MongoDB. Two options:

   - No install needed: `npm run mongo` starts a zero-config in-memory MongoDB on `mongodb://127.0.0.1:27017/`.
   - Use your own instance: point `MONGODB_URI` at it (see `.env`).

3. Copy `.env.example` to `.env` if needed (a `.env` is already present for local development).
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` seed an admin account when the server starts.
   - `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` — create test keys at the Stripe dashboard.
   - `IMGBB_API_KEY` — get an API key at [imgbb.com](https://imgbb.com) to upload service images.
   - `JWT_SECRET` — set a random secret for real deployments.

4. Start the backend REST API (port 5000):

   ```bash
   npm run api
   ```

5. Start the frontend (port 3000):

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000. The seeded admin (`admin@example.com` / `adminsaloonbook1` by default)
   can sign in to `/admin`. Customers sign up at `/sign-up`.

## Development

- `npm run api` — Express REST API (http://127.0.0.1:5000)
- `npm run dev` — Next.js dev server (http://localhost:3000)
- `npm run mongo` — zero-config MongoDB on 27017
- `npm run build` / `npm run start` — production build/start of the Next app
- `npm run smoke-test` — hmm, no. `node scripts/smoke-test.js` — end-to-end REST API smoke tests
- `npm run lint` — lint the project

## How it works

1. A customer browses `/services`, searches by name, filters by category, or opens a service page.
2. On the service page they submit an appointment request — an appointment is created with status
   `pending`, and a `Payment` record (status `pending`) is created for it.
3. The admin confirms appointments on `/admin/appointments` (`confirmed`).
4. The customer opens their appointments on `/customer/appointments` and clicks **Pay now** for
   confirmed appointments — this creates a Stripe Checkout session.
5. On the Stripe side, a successful payment marks the payment as `paid` via the Stripe webhook
   (`POST /api/webhooks/stripe`).

## Architecture notes

- **Auth**: JWTs issued by `server/utils/jwt.js`, stored in localStorage plus a mirror cookie
  (`salonbook_user`) so Next.js can guard routes server-side.
- **Guards**: `src/proxy.ts` (Next 16 renamed `middleware` → `proxy`) guards `/admin/*` and
  `/customer/*`; `src/lib/useAuthGuard.ts` provides the same checks for client-side navigation.
- **Roles**: `admin` and `customer`. Public registration is customer-only unless
  `ALLOW_ADMIN_REGISTRATION=true`. An admin is seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- **Service images**: uploaded as base64 through `POST /api/services/upload` and stored on ImgBB.
- **Data flow**: all frontend fetches use `src/lib/api.ts` against the Express API at
  `http://localhost:5000` (`NEXT_PUBLIC_API_URL`).

## Ports

| Service | Port |
| ------- | ---- |
| Next.js app (frontend) | 3000 |
| Express API (backend) | 5000 |
| MongoDB | 27017 |

## Project layout

```
src/
  app/                 # Next.js pages (Home, /services, /services/[id], sign-in/up,
                       #   customer/*, admin/*)
  components/          # Navbar, Footer, ServiceCard, StatusBadge
  lib/                 # api.ts (fetch helper), auth.ts, types.ts, useAuthGuard.ts
  proxy.ts             # server-side route guards (Next 16)
server/
  models/              # Mongoose: User, Service, Appointment, Payment
  controllers/         # auth, services, appointments, payments, customers
  routes/              # Express routers (auth, services, appointments, payments,
                       #   customers, webhooks)
  middleware/auth.js   # JWT verification + role checks
  services/imgbb.js, stripe.js
  seed.js              # admin seeding + demo services
scripts/
  smoke-test.js        # end-to-end REST API smoke tests
```
