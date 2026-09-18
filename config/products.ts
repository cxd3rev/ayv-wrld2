import { productBrand, type BrandAssets } from "@/config/brands";
import { calculatePricingSummary, formatEuroPrice } from "@/lib/pricing";

/**
 * Central product catalog for every AYV WRLD product.
 *
 * How to add or activate a future product:
 * 1. Add (or update) an entry in `products`.
 * 2. Set `status` to "active" when the product dashboard should open.
 * 3. Add product-specific pages under app/dashboard later — do not mix
 *    product business logic into the shared foundation.
 *
 * Avyro is the first live product: a small lead-conversion workspace.
 * Velto is the second: org-scoped bookings with reminder dates.
 * Rovyn is the third: org-scoped quote follow-up.
 * Other products stay coming_soon until they have their own tools.
 */

export type ProductStatus = "active" | "coming_soon";
export type ProductId =
  | "avyro"
  | "velto"
  | "rovyn"
  | "orvyn"
  | "nexro"
  | "ravelo";

export type ProductNavItem = {
  label: string;
  href: string;
};

export type ProductConfig = {
  id: ProductId;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  highlights: string[];
  status: ProductStatus;
  marketingStatus: "Available" | "Coming soon";
  assets: BrandAssets;
  accent: string;
  route: string;
  pricing: {
    monthly: number | null;
  };
  navigation: ProductNavItem[];
  featureFlags: Record<string, boolean>;
  dashboard: {
    title: string;
    description: string;
  };
};

export const products: ProductConfig[] = [
  {
    id: "avyro",
    name: "Avyro",
    slug: "avyro",
    tagline: "Lead conversion",
    description: "Lead conversion automation",
    longDescription:
      "Avyro helps businesses follow up with new leads quickly so more conversations turn into customers.",
    highlights: [
      "Reply to every new lead in seconds, automatically",
      "Schedule smart follow-ups so nobody slips away",
      "See which leads are hot and where they came from",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("avyro"),
    accent: "#A3A3A3",
    route: "/dashboard/avyro",
    pricing: { monthly: 49 },
    navigation: [{ label: "Leads", href: "/dashboard/avyro" }],
    featureFlags: {
      leadCapture: true,
      followUp: true,
      followUpSequences: false,
    },
    dashboard: {
      title: "Avyro",
      description: "Follow up with new leads quickly so more conversations become customers.",
    },
  },
  {
    id: "velto",
    name: "Velto",
    slug: "velto",
    tagline: "Booking + reminders",
    description: "Booking and reminder automation",
    longDescription:
      "Velto helps businesses take bookings and send reminders so fewer appointments are missed.",
    highlights: [
      "Let customers book you around the clock",
      "Send automatic reminders before every appointment",
      "Cut no-shows without the back-and-forth",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("velto", true),
    accent: "#7C3AED",
    route: "/dashboard/velto",
    pricing: { monthly: 49 },
    navigation: [{ label: "Bookings", href: "/dashboard/velto" }],
    featureFlags: {
      bookings: true,
      reminders: true,
    },
    dashboard: {
      title: "Velto",
      description: "Take bookings and send reminders so fewer appointments are missed.",
    },
  },
  {
    id: "rovyn",
    name: "Rovyn",
    slug: "rovyn",
    tagline: "Quote follow-up",
    description: "Quote follow-up automation",
    longDescription:
      "Rovyn follows up on sent quotes so businesses close more work without chasing every lead by hand.",
    highlights: [
      "Follow up on every quote automatically",
      "Nudge undecided prospects at the right moment",
      "Close more work without chasing by hand",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("rovyn"),
    accent: "#00C853",
    route: "/dashboard/rovyn",
    pricing: { monthly: 89 },
    navigation: [{ label: "Quotes", href: "/dashboard/rovyn" }],
    featureFlags: {
      quotes: true,
      followUp: true,
    },
    dashboard: {
      title: "Rovyn",
      description: "Follow up on sent quotes so more proposals turn into booked work.",
    },
  },
  {
    id: "orvyn",
    name: "Orvyn",
    slug: "orvyn",
    tagline: "Payment + invoice follow-up",
    description: "Payment and invoice follow-up automation",
    longDescription:
      "Orvyn reminds customers about unpaid invoices so money comes in faster and fewer bills are forgotten.",
    highlights: [
      "Send automatic reminders on unpaid invoices",
      "Get paid faster with less awkward chasing",
      "Keep track of what's outstanding at a glance",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("orvyn", true),
    accent: "#E10600",
    route: "/dashboard/orvyn",
    pricing: { monthly: 89 },
    navigation: [{ label: "Invoices", href: "/dashboard/orvyn" }],
    featureFlags: { invoices: true, reminders: true },
    dashboard: {
      title: "Orvyn",
      description: "Track unpaid invoices and schedule reminders so money arrives sooner.",
    },
  },
  {
    id: "nexro",
    name: "Nexro",
    slug: "nexro",
    tagline: "Customer reactivation + referrals",
    description: "Customer reactivation and referral automation",
    longDescription:
      "Nexro helps businesses bring past customers back and turn happy clients into referrals.",
    highlights: [
      "Win back past customers with timed campaigns",
      "Turn happy clients into a steady referral stream",
      "Re-engage your list on autopilot",
    ],
    status: "coming_soon",
    marketingStatus: "Coming soon",
    assets: productBrand("nexro"),
    accent: "#1E40AF",
    route: "/dashboard/product",
    pricing: { monthly: 129 },
    navigation: [],
    featureFlags: {},
    dashboard: {
      title: "Nexro",
      description: "Customer reactivation and referrals are coming soon.",
    },
  },
  {
    id: "ravelo",
    name: "Ravelo",
    slug: "ravelo",
    tagline: "Review automation",
    description: "Review automation",
    longDescription:
      "Ravelo asks happy customers for reviews at the right time so businesses build trust without awkward follow-up.",
    highlights: [
      "Ask for reviews at the perfect moment",
      "Build trust with more 5-star ratings",
      "Grow your reputation without the awkward ask",
    ],
    status: "coming_soon",
    marketingStatus: "Coming soon",
    assets: productBrand("ravelo"),
    accent: "#1D4ED8",
    route: "/dashboard/product",
    pricing: { monthly: 129 },
    navigation: [],
    featureFlags: {},
    dashboard: {
      title: "Ravelo",
      description: "Review automation is coming soon.",
    },
  },
];

export const defaultProductId: ProductId = "avyro";

/** Fraction off the combined price when all products are bought as a bundle. */
export const BUNDLE_DISCOUNT = 0.5;

export const bundlePricing = calculatePricingSummary(
  products.flatMap((product) =>
    product.pricing.monthly === null ? [] : [product.pricing.monthly],
  ),
  BUNDLE_DISCOUNT,
);

export function formatPrice(amount: number, locale: string) {
  return formatEuroPrice(amount, locale);
}

export function getProduct(slugOrId: string) {
  return products.find(
    (product) => product.slug === slugOrId || product.id === slugOrId,
  );
}

export function getActiveProducts() {
  return products.filter((product) => product.status === "active");
}

export const industries = [
  "Home services",
  "Professional services",
  "Health & wellness",
  "Trades",
  "Real estate",
  "Retail",
  "Hospitality",
  "Other",
] as const;
