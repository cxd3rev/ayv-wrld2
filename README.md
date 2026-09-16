# AYV WRLD Foundation

This project is the shared software foundation for **AYV WRLD**.

AYV WRLD is the parent brand. Later you will build focused products on top of this app:

- **Avyro** — lead conversion
- **Velto** — booking + reminders
- **Rovyn** — quote follow-up
- **Orvyn** — payment + invoice follow-up
- **Nexro** — customer reactivation + referrals
- **Ravelo** — review automation

This foundation does **not** build those products yet. It gives every future product the same starting point: design, login, organizations, settings, billing, and email.

Think of it like a shared house. Avyro will be the first room you furnish.

## 1. What you get today

- A dark AYV WRLD marketing site
- Email + password authentication (social login can be added later)
- Signup → onboarding → organization creation
- A protected dashboard shell with a product switcher
- Settings for the business, team, billing, and account
- Stripe Checkout + Customer Portal architecture
- A Resend email service
- Supabase tables and Row Level Security (RLS)

## 2. Tech stack

| Tool | Why it is here |
| --- | --- |
| Next.js | Website + app in one project, ready for Vercel |
| TypeScript | Catches mistakes while you type |
| Tailwind CSS | Shared visual style without extra CSS files |
| Supabase | Database, login, and security rules |
| PostgreSQL | The actual database behind Supabase |
| Stripe | Subscriptions later, architecture now |
| Resend | Transactional email later, service now |

## 3. Project structure

```text
app/            Pages and API routes (the screens users visit)
components/     Reusable UI (buttons, cards, dashboard shell)
config/         Product catalog and site settings
hooks/          Small React helpers
lib/            Auth, Supabase clients, validation
services/       Billing, email, organizations, notifications
types/          Shared TypeScript types
supabase/       Database migration + RLS
public/         Static files
```

Important files:

- `config/products.ts` — names, colors, status, and flags for every product
- `lib/supabase/` — browser client, server client, and service-role client
- `services/email.ts` — the only place products should send email from
- `services/billing.ts` — Stripe Checkout and Customer Portal
- `supabase/migrations/0001_init.sql` — tables, indexes, and RLS

## 4. Install dependencies

You need Node.js 20.9 or newer.

```bash
npm install
```

## 5. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → API**.
3. Copy the project URL and anon key into `.env.local`.
4. Copy the **service role** key into `.env.local` as well. Keep it secret.
5. Open the SQL editor and run `supabase/migrations/0001_init.sql`.
6. In **Authentication → URL configuration**, add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

The SQL file:

- Creates a profile when someone signs up
- Creates an organization during onboarding
- Makes that user the owner
- Stops users from reading another organization's data

Authentication uses email + password. Social login is prepared in `lib/auth/oauth.ts`. Enable a provider in the Supabase dashboard, then add a button that calls `signInWithOAuth`.

## 6. Configure Stripe

1. Create an account at [stripe.com](https://stripe.com).
2. Copy the test secret key and publishable key into `.env.local`.
3. Create a Product and Price in Stripe, then put the price id in `STRIPE_PRICE_ID`.
4. For local webhooks, install the Stripe CLI and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

5. Put the webhook signing secret in `STRIPE_WEBHOOK_SECRET`.

Checkout and the Customer Portal will stay disabled in the UI until these keys exist. That is intentional.

## 7. Configure Resend

1. Create an account at [resend.com](https://resend.com).
2. Create an API key.
3. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.local`.
4. Verify your sending domain before going live.

Team invites already use this service. Future products should call `sendEmail()` in `services/email.ts` instead of talking to Resend directly.

## 8. Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Then fill in the values. Never put service-role, Stripe secret, or Resend keys in client components. Files that need secrets use `import "server-only"` so they cannot be imported into the browser.

## 9. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

What should work after Supabase is configured:

1. Sign up
2. Complete onboarding (this creates the organization and makes you owner)
3. Land on the dashboard
4. Open Settings and save business details
5. Use the product switcher (Avyro is ready as a placeholder, the others say Coming soon)
6. Log out and log back in

## 10. Deploy to Vercel

1. Push this project to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add the same environment variables in the Vercel project settings.
4. Set `NEXT_PUBLIC_APP_URL` to your live domain, for example `https://ayvwrld.com`.
5. In Supabase, add that domain to Site URL and Redirect URLs.
6. In Stripe, add a live webhook pointing at `https://your-domain/api/stripe/webhook`.

## 11. How future products should connect

Do not copy this whole app for Avyro. Build Avyro **inside** this foundation.

Suggested pattern:

1. Keep shared screens in `/dashboard`, `/dashboard/settings`, and `/dashboard/billing`.
2. Put Avyro-only pages under something like `/dashboard/avyro/...` later.
3. Add Avyro navigation in `config/products.ts` (`navigation` and `featureFlags`).
4. Store Avyro data in new tables that include `organization_id`.
5. Copy the RLS pattern from `0001_init.sql` so those tables are organization-safe.
6. Send mail through `services/email.ts`.
7. Reuse components in `components/ui`. Do not invent a second design system.

When a product is ready to open:

```ts
status: "active"
```

Until then, keep it `coming_soon` so the switcher stays honest.

Avyro is the first product that should be built on this foundation.
