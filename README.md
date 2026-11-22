# SalonBook — Salon Appointment Booking Platform

SalonBook lets customers browse salon services, view service details and request appointments online,
and lets the salon administrator manage services, appointment requests, payments and customers.
Customers can manage their own appointments and pay for confirmed appointments via Stripe.

It is a beginner-friendly, role-based web application built with:

- **Frontend**: Next.js 16 (App Router, Turbopack, TypeScript) — Home, Services (browse/search/filter),
  Service details + appointment request forms, sign in/up, Customer dashboard/appointments/payments,
  and Admin dashboard/services/appointments/payments/customers.
- **Backend API**: Express.js REST API — [Better Auth](https://www.better-auth.com) authentication
  (email/password + Google sign-in), services (CRUD + category/search + image uploads via ImgBB),
  appointments (create/list/confirm/cancel), payments (Stripe Checkout), customers (admin view),
  and a Stripe webhook.
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
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — create an OAuth client for Google sign-in (optional).

   The backend lives in the separate `C:\projects\salonbook-server` folder; a matching `.env`
   lives there too (`PORT=5000`, `MONGODB_URI=mongodb://127.0.0.1:27017/salonbook`, ...).

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

- `npm run api` — Express REST API (http://127.0.0.1:5000, server code: `C:\projects\salonbook-server`)
- `npm run dev` — Next.js dev server (http://localhost:3000)
- `npm run mongo` — zero-config MongoDB on 27017
- `npm run build` / `npm run start` — production build/start of the Next app
- `node scripts/smoke-test.js` — end-to-end REST API smoke tests
- `npm run lint` — lint the project

## How it works

1. A customer browses `/services`, searches by name, filters by category, or opens a service page.
   Booking is active-only: inactive services return 404 and duplicate active bookings for the same
   service + date + time slot return `409`.
2. On the service page the customer submits the booking form: **Appointment Date**, a predefined
   **Available Time Slot** (`src/lib/slots.ts`), and an optional **Additional Message**. The
   appointment is created with status `pending` and payment status `unpaid` (in the `appointments`
   collection). Customers book via authenticated `POST /api/appointments`.
3. The admin manages the flow on `/admin/appointments`: view all requests, status-filter tabs
   (All / Pending / Confirmed / Cancelled), confirm pending appointments, and cancel pending or
   confirmed appointments. Customer info and message show in the details modal.
4. The customer opens their appointments on `/customer/appointments` and clicks **Pay now** for
   confirmed appointments — this creates a Stripe Checkout session (`POST /api/payments/checkout/:id`).
5. On Stripe, a successful payment triggers the webhook (`POST /api/webhooks/stripe`,
   `checkout.session.completed`): the payment is marked `paid` and a `Transaction` record is saved
   (idempotently via `markPaid`). The verify endpoint (`GET /api/payments/:id/verify`) also marks the
   payment paid from Stripe when the session is complete.
6. Stripe redirects back to **`/customer/payment/success`** — the success page polls
   `/api/payments/:id/verify` and shows confirmation with the saved transaction details and a receipt
   link. Stripe **cancel** returns to **`/customer/payment/cancel`** with a notice.
7. Customers can also update their profile (`/customer/profile`): name, phone, image upload or URL.
   Role/blocked changes are rejected server-side; only the user themselves (or admins) may edit.
8. Admin dashboard stats (`GET /api/admin/stats`): total customers, active services, appointment
   requests, pending/confirmed, and successful payments. Admin `/admin/customers` supports
   **Block User / Unblock User** (blocked users get 403 on protected endpoints). Admin
   `/admin/payments` is read-only — payments cannot be manually edited.

## Architecture notes

- **Auth**: [Better Auth](https://www.better-auth.com) — sessions are stored as cookies
  (`better_auth.session_token`). The frontend uses `createAuthClient` (`src/lib/auth-client.ts`) and
  the shared store in `src/lib/session.ts` (`useSession()` hook — Navbar updates immediately on
  login/logout via `useSyncExternalStore`).
- **Guards**: `src/proxy.ts` (Next 16 renamed `middleware` → `proxy`) guards `/admin/*` and
  `/customer/*` — it asks the backend `GET /api/auth/get-session` (passing through the cookie) and
  redirects unauthenticated or wrongly-roled users. `src/lib/useAuthGuard.ts` provides the same
  checks for client-side navigation; `useAuthGuard('any')` covers service details pages
  (redirects unauthenticated users to `/sign-in`).
- **Hybrid rendering**: admin pages (`/admin/*`) and customer dashboards (`/customer/*`) are
  **Server Components** that fetch data via `src/lib/serverApi.ts` (forwards the session cookie).
  Client Components are used only for interactive features: forms, buttons, modals, and tables —
  with loaders (`src/components/PageLoading.tsx`) on `loading.tsx` files during data fetches.
- **Role verification on the server**: `server/middleware/auth.js` (`requireAuth` /
  `requireRole('admin' | 'customer')`) runs on every protected endpoint — hiding links in the
  frontend is not sufficient. `POST /api/appointments` requires the `customer` role; admins cannot
  book customer requests.
- **Roles**: `admin` (seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD`) and `customer` (public
  registration). Dashboard areas are role-gated: `/admin/*` (admin only) and `/customer/*`
  (customer only); admins get redirected from `/customer/*` and customers from `/admin/*`.
- **Blocked users**: `user.blocked` on the Better Auth `user` collection. `requireAuth` returns 403
  for blocked users, and the Next `proxy` redirects them to `/sign-in`.
- **Toasts**: `src/lib/toast.tsx` + `src/components/Toaster.tsx` (global, in `src/app/layout.tsx`).
  Success/failure toasts via `showToast('success' | 'error' | ...)` — all top forms use them.
- **Service image uploads**: as base64 via `POST /api/services/upload`, stored on ImgBB.
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
  app/                 # Next.js pages: Home, /services, /services/[id], sign-in/up,
                       #   /customer/* (dashboard, appointments, profile, payments,
                       #     payment/success, payment/cancel),
                       #   /admin/* (dashboard, services, appointments, users, transactions)
                       #   not-found.tsx (invalid routes)
  components/          # Navbar, Footer, ServiceCard, StatusBadge, RequireAuthentication,
                       #   PageLoading, Toaster
  lib/                 # api.ts (fetch helper), session.ts (Better Auth session store),
                       #   auth-client.ts, serverApi.ts (server-side fetch + role guards),
                       #   toast.tsx (toast context), useAuthGuard.ts, slots.ts (time slots)
  proxy.ts             # server-side route guards (Next 16)
scripts/
  smoke-test.js        # end-to-end REST API smoke tests

# Backend lives in C:\projects\salonbook-server (server/, models/, controllers/,
# routes/, middleware/, services/, utils/, seed.js, server.js)
models/                # Mongoose: Service, Appointment, Payment, Transaction
                       #   (users managed by Better Auth)
controllers/           # services, appointments, payments, transactions, customers, profile,
                       #   admin stats
routes/                # Express routers (services, appointments, payments,
                       #   transactions, customers, webhooks, users/avatar, profiles)
middleware/auth.js     # requireAuth (rejects blocked users) + requireRole over Better Auth sessions
services/imgbb.js, stripe.js
seed.js                # admin seeding + demo services
server.js              # Express entry point (port 5000)
```
