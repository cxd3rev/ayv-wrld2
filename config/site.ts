// TODO: final name and domain
export const PRODUCT_NAME = "AYV Onderhoud";
export const PRODUCT_TAGLINE = "Wettelijke onderhoudsdatums voor verwarmingsinstallateurs in Vlaanderen.";
export const PRODUCT_URL = "https://www.ayvautomation.space";

/** Existing imports keep working. A rename is the three constants above. */
export const siteConfig = {
  name: PRODUCT_NAME,
  shortName: "AYV",
  tagline: PRODUCT_TAGLINE,
  description: PRODUCT_TAGLINE,
  url: PRODUCT_URL,
} as const;
