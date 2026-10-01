# AYV Onderhoud

SaaS for heating installers in Flanders. One organization keeps customers, addresses, and boilers. Maintenance dates and heating audits are calculated, not typed.

The working name, tagline, and domain live in `config/site.ts` as `PRODUCT_NAME`, `PRODUCT_TAGLINE`, and `PRODUCT_URL`. TODO: final name and domain.

This repository is not the AYV WRLD portfolio. The site footer links to https://www.ayvwrld.com with the text "Gemaakt door AYV WRLD".

## Foundation

Supabase auth, organizations, row level security, Stripe, Resend, and settings stay. The six older modules (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo) are still in the repo and stay off unless `NEXT_PUBLIC_LEGACY_MODULES=true`. See `docs/onderhoud-plan.md` for what to remove later.

## Run locally

Node.js 20.9 or newer.

```bash
npm install
Copy-Item .env.example .env.local
```

Fill in Supabase, Stripe, and Resend values in `.env.local`. Do not commit that file.

Apply `supabase/migrations/20261002001200_onderhoud.sql` to the database you use locally. Then:

```bash
npm run dev
```

Open http://localhost:3000. Sign up, add a customer with an address and a boiler, open a time slot, and book it on `/boek/{slug}`.

```bash
npm run test:rules
npm run test:pricing
npm run build
```

## Deploy

Deploy the Next.js app on Vercel. Set `NEXT_PUBLIC_APP_URL` to the public site URL. Leave `NEXT_PUBLIC_LEGACY_MODULES` unset.
