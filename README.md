# Ironline Auto — Car Service Portal

A booking portal for a car service shop: customers book appointments and
track status; shop staff manage bookings and services from an admin
dashboard.

**Stack:** Next.js 14 (App Router) + Supabase (Postgres, Auth, RLS) +
Tailwind CSS. Deploys to Vercel.

## 1. Prerequisites

- Node.js 18+ installed
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

## 2. Set up Supabase

1. Go to supabase.com → **New project**. Note the database password you set.
2. Once the project is ready, open **SQL Editor** → **New query**, paste in
   the entire contents of `supabase/schema.sql`, and run it. This creates
   all tables, security policies, and a few starter services.
3. Go to **Settings → API** and copy:
   - **Project URL**
   - **anon public** key

## 3. Configure the app locally

```bash
cd car-service-portal
npm install
cp .env.local.example .env.local
```

Paste your Supabase URL and anon key into `.env.local`.

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 4. Create your admin account

1. In the running app, click **Sign in → Create one** and sign up with your
   own email.
2. Confirm your email (Supabase sends a confirmation link — check your
   inbox, or in local dev check **Authentication → Users** in the Supabase
   dashboard, where you can also manually confirm the user).
3. In Supabase, go to **Authentication → Users**, copy your user's UUID.
4. In **SQL Editor**, run:
   ```sql
   update profiles set is_admin = true where id = 'PASTE_YOUR_UUID_HERE';
   ```
5. Sign in again — you'll now see an **Admin** link in the nav.

## 5. How it's organized

```
app/
  page.tsx                 Home page — service list
  login/, signup/           Auth pages
  book/                     Customer booking form
  my-bookings/               Customer's own bookings + cancel
  admin/
    layout.tsx               Guards access to admins only
    page.tsx                 Dashboard — today's jobs, status counts
    bookings/                All bookings, filter + change status
    services/                Add/deactivate services
components/                 Navbar, BookingForm, BookingCard
lib/supabase/               Browser + server Supabase clients
lib/types.ts                Shared TypeScript types
supabase/schema.sql         Full DB schema, RLS policies, seed data
```

Data access uses Supabase's client SDK directly from components — no custom
API layer needed. Row Level Security policies (defined in `schema.sql`)
enforce that customers only ever see their own bookings/vehicles, and only
admins can see everyone's.

## 6. Deploy

1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Add the two environment variables from `.env.local` in Vercel's project
   settings (**Settings → Environment Variables**).
4. Deploy. Vercel gives you a live URL immediately, and redeploys
   automatically on every push to your main branch.
5. **Custom domain:** in Vercel, **Settings → Domains**, add your domain and
   follow the DNS instructions it gives you (usually one CNAME record).
   HTTPS is issued automatically.

## 7. Natural next steps

- **Email confirmations/reminders** — add [Resend](https://resend.com) and
  call it from a Supabase Edge Function or a Next.js Route Handler when a
  booking is created/confirmed.
- **Payments / deposits** — add [Stripe Checkout](https://stripe.com) on the
  booking form for services that require prepayment.
- **Calendar view** — swap the admin bookings list for a calendar grid
  (e.g. using `react-big-calendar`) once volume grows.
- **SMS reminders** — Twilio, triggered the same way as email.

## Troubleshooting

- **"new row violates row-level security policy"** — you're trying to
  insert/update a row that doesn't belong to the signed-in user. Check
  you're passing the correct `owner_id`/`customer_id` equal to
  `auth.uid()`.
- **Admin link doesn't show up** — confirm the `profiles.is_admin` row is
  actually `true` for your user, and that you're signed in with that
  account.
- **Blank service list on home page** — make sure `schema.sql` ran fully,
  including the seed `insert into services...` block.
