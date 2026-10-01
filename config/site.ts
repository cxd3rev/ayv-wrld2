/**
 * Site-wide branding for the AYV WRLD parent platform.
 * Product-specific names and colors live in config/products.ts.
 */
export const siteConfig = {
  name: "AYV Automation Stack",
  shortName: "AYV",
  tagline: "Keep the clients you already have.",
  description:
    "Six modules that check in after a service, catch renewal lapses, spot quiet clients, reward loyal ones, win them back, and ask happy clients for reviews.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ayvautomation.space",
} as const;
