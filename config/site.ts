/**
 * Site-wide branding for the AYV WRLD parent platform.
 * Product-specific names and colors live in config/products.ts.
 */
export const siteConfig = {
  name: "AYV WRLD",
  shortName: "AYV",
  tagline: "Software that turns everyday business tasks into automated revenue.",
  description:
    "AYV WRLD creates focused software tools that help businesses capture leads, book customers, close quotes, collect payments, and bring customers back.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
