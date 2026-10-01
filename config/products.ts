import { productBrand, type BrandAssets } from "@/config/brands";
import { formatEuroPrice } from "@/lib/pricing";

/**
 * Central product catalog for every AYV WRLD product.
 *
 * How to add or activate a future product:
 * 1. Add (or update) an entry in `products`.
 * 2. Set `status` to "active" when the product dashboard should open.
 * 3. Add product-specific pages under app/dashboard later — do not mix
 *    product business logic into the shared foundation.
 *
 * Public copy: Avyro checks in, Velto watches renewals, Rovyn flags quiet clients,
 * Orvyn recognises loyal clients, Nexro wins them back, Ravelo asks for reviews.
 * The workspace still stores the older lead, booking, quote, and invoice records.
 * Ravelo asks for reviews after the work is done.
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
  category: "Acquire" | "Schedule" | "Convert" | "Collect" | "Retain" | "Reputation";
  productType: "automation";
  marketingRoute: `/automation/${ProductId}`;
  cta: {
    active: string;
    comingSoon: string;
  };
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
    tagline: "Post-service check-in",
    description: "Post-service check-in",
    longDescription:
      "Shortly after a client's appointment or purchase, Avyro sends a short check-in. A positive reply triggers a Ravelo review request. A negative or neutral reply notifies the owner.",
    highlights: [
      "A short check-in after the appointment or purchase",
      "A positive reply starts a Ravelo review request",
      "A negative or neutral reply comes to you first",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("avyro"),
    accent: "#A3A3A3",
    category: "Acquire",
    productType: "automation",
    marketingRoute: "/automation/avyro",
    cta: { active: "Open Avyro", comingSoon: "Coming soon" },
    route: "/dashboard/avyro",
    pricing: { monthly: 39 },
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
    tagline: "Renewal and subscription reminders",
    description: "Renewal and subscription reminders",
    longDescription:
      "Velto reminds a client before a renewal date so a membership or contract does not lapse by accident. If they still do not renew, Velto flags Rovyn.",
    highlights: [
      "A reminder before the renewal date",
      "Built for memberships, contracts, and recurring services",
      "A missed renewal is flagged to Rovyn",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("velto"),
    accent: "#7C3AED",
    category: "Schedule",
    productType: "automation",
    marketingRoute: "/automation/velto",
    cta: { active: "Open Velto", comingSoon: "Coming soon" },
    route: "/dashboard/velto",
    pricing: { monthly: 39 },
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
    tagline: "Churn-risk detection",
    description: "Churn-risk detection",
    longDescription:
      "Rovyn compares each client with their own visit or purchase pattern and flags anyone who has gone quiet. A flag starts a Nexro win-back.",
    highlights: [
      "Each client is compared with their own usual rhythm",
      "Quiet clients are flagged before they are gone",
      "A flag starts a Nexro win-back",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("rovyn"),
    accent: "#00C853",
    category: "Convert",
    productType: "automation",
    marketingRoute: "/automation/rovyn",
    cta: { active: "Open Rovyn", comingSoon: "Coming soon" },
    route: "/dashboard/rovyn",
    pricing: { monthly: 39 },
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
    tagline: "Loyalty and repeat-client recognition",
    description: "Loyalty and repeat-client recognition",
    longDescription:
      "Orvyn finds repeat clients and can send a small thank-you or reward. That loyal group is passed to Nexro for referral requests.",
    highlights: [
      "Repeat clients are recognised automatically",
      "A thank-you or a small reward",
      "Loyal clients are passed to Nexro for referrals",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("orvyn"),
    accent: "#E10600",
    category: "Collect",
    productType: "automation",
    marketingRoute: "/automation/orvyn",
    cta: { active: "Open Orvyn", comingSoon: "Coming soon" },
    route: "/dashboard/orvyn",
    pricing: { monthly: 39 },
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
      "Nexro sends win-backs to clients Rovyn has flagged and referral requests to loyal clients from Orvyn, plus messages the owner sends by hand.",
    highlights: [
      "Win-backs for clients Rovyn has flagged",
      "Referral requests for loyal clients from Orvyn",
      "Messages you send yourself still go out",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("nexro"),
    accent: "#1E40AF",
    category: "Retain",
    productType: "automation",
    marketingRoute: "/automation/nexro",
    cta: { active: "Open Nexro", comingSoon: "In development" },
    route: "/dashboard/nexro",
    pricing: { monthly: 39 },
    navigation: [{ label: "Reactivation", href: "/dashboard/nexro" }],
    featureFlags: { winback: true, referrals: true },
    dashboard: {
      title: "Nexro",
      description: "Bring past customers back and ask happy clients for a referral.",
    },
  },
  {
    id: "ravelo",
    name: "Ravelo",
    slug: "ravelo",
    tagline: "Review automation",
    description: "Review automation",
    longDescription:
      "Ravelo sends a review request when Avyro's check-in is positive, and when the owner sends a request by hand.",
    highlights: [
      "A review request after a positive Avyro check-in",
      "Requests you send yourself",
      "Unhappy check-ins stay with you",
    ],
    status: "active",
    marketingStatus: "Available",
    assets: productBrand("ravelo"),
    accent: "#1D4ED8",
    category: "Reputation",
    productType: "automation",
    marketingRoute: "/automation/ravelo",
    cta: { active: "Open Ravelo", comingSoon: "In development" },
    route: "/dashboard/ravelo",
    pricing: { monthly: 39 },
    navigation: [{ label: "Reviews", href: "/dashboard/ravelo" }],
    featureFlags: { reviews: true, privateFeedback: true },
    dashboard: {
      title: "Ravelo",
      description: "Ask for a review after the job and keep unhappy feedback private first.",
    },
  },
];

export const defaultProductId: ProductId = "avyro";

/** One module, Growth (any three), and the full stack. These match the Stripe prices. */
export const planPricing = {
  module: 39,
  growth: 79,
  fullStack: 149,
} as const;

const catalogMonthly = products.reduce((sum, product) => sum + (product.pricing.monthly ?? 0), 0);

/** Shown where the old 50% bundle card still renders. The charged full-stack price is €149. */
export const BUNDLE_DISCOUNT = catalogMonthly === 0 ? 0 : (catalogMonthly - planPricing.fullStack) / catalogMonthly;

export const bundlePricing = {
  fullMonthly: catalogMonthly,
  discountedMonthly: planPricing.fullStack,
  savingsMonthly: catalogMonthly - planPricing.fullStack,
};

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
