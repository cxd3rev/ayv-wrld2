# AYV Onderhoud v1

Working name: **AYV Onderhoud**. One product for heating installers in Flanders. The shared foundation stays: Supabase auth, organizations, RLS, Stripe, Resend, and settings.

## Steps

1. This plan.
2. Feature flag `NEXT_PUBLIC_LEGACY_MODULES` (default off). Hide Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo from navigation and routing. Do not delete their code.
3. Migration: customers, addresses, boilers, installer settings, visit slots, bookings, visits. RLS on every table, scoped with `is_org_member`. Private Storage bucket for certificates.
4. `lib/maintenance-rules.ts` plus unit tests. Due dates are computed, never typed.
5. Dashboard: boilers due in 30/60/90 days and overdue, filterable by municipality. Customer, address, and boiler forms.
6. Reminder job: email the customer X days before the due date (X per installer, default 30) via Resend, in Dutch, with the installer name and a booking link.
7. Public booking page per installer slug. The customer picks an open slot. The booking shows on the dashboard.
8. Certificate upload on a visit (PDF or photo). Saving the visit updates the last maintenance date.
9. One plan in config. Monthly price is a TODO constant. Keep the existing 7-day trial.
10. Dutch homepage for heating installers. Module pages leave the marketing navigation.

## Maintenance rules

Flemish Region, and they must be verified before launch. Implemented only in `lib/maintenance-rules.ts`.

- Oil, 20 kW or more: every year.
- Gas, 20 kW or more: every 2 years.
- Solid fuel: every year, any power.
- Heat pump, or under 20 kW: no legal maintenance obligation. Optional reminder interval set by the installer on that boiler.
- Heating audit: every 5 years for boilers of 20 kW or more. The first audit is due on the first maintenance date on or after the boiler turns 5 (install date plus 5 years). Later audits are 5 years after the last recorded audit.

TODO: the rules above do not say whether a heat pump of 20 kW or more counts as a boiler for the heating audit. v1 does not schedule an audit for heat pumps.

TODO: solid fuel under 20 kW is still yearly, because the solid-fuel rule says any power. The "under 20 kW" optional case does not override that.

## Data

- Customer belongs to one organization.
- Address belongs to one customer and stores the municipality used by the dashboard filter. Municipality is free text. TODO: no official Flemish municipality list in v1.
- Boiler belongs to one address.
- A visit belongs to one boiler and may store a certificate path.
- Slots are opened by the installer. A booking takes one slot.

Public booking and the reminder job write through the service role after checking the organization slug or cron secret. Installer screens use the logged-in client and RLS.

## Pricing

`config/onderhoud.ts` holds one plan. `ONDERHOUD_MONTHLY_PRICE_EUR` stays `null` until a real price exists. Checkout still uses `trial_period_days: 7` for the first subscription. Stripe price id is `STRIPE_ONDERHOUD_PRICE_ID` when billing is turned on. TODO: create that Stripe price. Do not invent an amount.

## To remove later

Kept in the repo, behind the feature flag, not linked when the flag is off:

- Avyro — post-service check-in (`app/dashboard/avyro`, `products/avyro`)
- Velto — renewal reminders (`app/dashboard/velto`, `products/velto`)
- Rovyn — churn-risk (`app/dashboard/rovyn`, `products/rovyn`)
- Orvyn — loyalty (`app/dashboard/orvyn`, `products/orvyn`)
- Nexro — reactivation and referrals (`app/dashboard/nexro`, `products/nexro`)
- Ravelo — reviews (`app/dashboard/ravelo`, `products/ravelo`)
- Marketing routes `/automation/*` and `/products/[slug]`
- Shared module calendar, command-center funnel, and the old follow-up cron

## Branding

`config/site.ts` holds `PRODUCT_NAME`, `PRODUCT_TAGLINE`, and `PRODUCT_URL`. TODO: final name and domain. Working name is AYV Onderhoud. Pages, emails, and metadata read those constants.

This repo is only the installer product. Portfolio pages (`/projects`, `/about`, `/one-man-army`) and the names Kleuro, Rated, and One Man Army stay in the code behind the same feature flag, and 404 when it is off. The only public mention of AYV WRLD is the footer link "Gemaakt door AYV WRLD" to https://www.ayvwrld.com.

## Not in v1

- French copy. TODO: Flanders is not only Dutch-speaking.
- Official legal citation text. The rules file is the whole legal surface, and it is marked unverified.
- Deleting the six modules.
