/**
 * Site-wide branding for the AYV WRLD parent platform.
 * Product-specific names and colors live in config/products.ts.
 */
export const siteConfig = {
  name: "AYV WRLD",
  shortName: "AYV",
  tagline: "Build systems. Automate work. Create what’s next.",
  description:
    "AYV WRLD builds practical software, business automation systems, and independent digital products.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ayv-wrld2.vercel.app",
} as const;
