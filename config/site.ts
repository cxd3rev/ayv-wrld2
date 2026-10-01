// TODO: final name
export const PRODUCT_NAME = "AYV Onderhoud";
export const PRODUCT_TAGLINE = "Elke ketel op tijd onderhouden. Zonder Excel.";
// TODO: final domain
export const PRODUCT_URL = "https://www.ayvautomation.space";

export const CONTACT_EMAIL = "info@ayvwrld.com";
export const CONTACT_PHONE = "0468 56 33 64";

/** Prices exclude btw. Founder price is a static offer, not a live counter. */
export const PRICING = {
  monthlyEur: 49,
  yearlyEur: 490,
  yearlyLabel: "2 maanden gratis",
  founderMonthlyEur: 29,
  founderAvailability: "Nog beschikbaar voor de eerste 10 installateurs",
  trialDays: 7,
} as const;

export const siteConfig = {
  name: PRODUCT_NAME,
  shortName: "AYV",
  tagline: PRODUCT_TAGLINE,
  description: PRODUCT_TAGLINE,
  url: PRODUCT_URL,
} as const;
