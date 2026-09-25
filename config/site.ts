/**
 * Site-wide branding for the AYV WRLD parent platform.
 * Product-specific names and colors live in config/products.ts.
 */
export const siteConfig = {
  name: "AYV Automation Stack",
  shortName: "AYV",
  tagline: "Automate how you win and keep clients.",
  description:
    "Six automation modules for leads, bookings, quotes, invoices, reactivation, and reviews. Buy one, or run the full stack.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ayv-wrld2.vercel.app",
} as const;
