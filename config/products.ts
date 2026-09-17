import { productBrand, type BrandAssets } from "@/config/brands";

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
  status: ProductStatus;
  marketingStatus: "In development" | "Coming soon";
  assets: BrandAssets;
  accent: string;
  route: string;
  pricing: {
    monthly: number | null;
    label: string;
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
    status: "active",
    marketingStatus: "In development",
    assets: productBrand("avyro"),
    accent: "#A3A3A3",
    route: "/dashboard/product",
    pricing: { monthly: 49.99, label: "€49,99 / month" },
    navigation: [{ label: "Leads", href: "/dashboard/product" }],
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
    status: "coming_soon",
    marketingStatus: "Coming soon",
    assets: productBrand("velto", true),
    accent: "#7C3AED",
    route: "/dashboard/product",
    pricing: { monthly: 49.99, label: "€49,99 / month" },
    navigation: [],
    featureFlags: {},
    dashboard: {
      title: "Velto",
      description: "Booking and reminder automation is coming soon.",
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
    status: "coming_soon",
    marketingStatus: "Coming soon",
    assets: productBrand("rovyn"),
    accent: "#00C853",
    route: "/dashboard/product",
    pricing: { monthly: 89.99, label: "€89,99 / month" },
    navigation: [],
    featureFlags: {},
    dashboard: {
      title: "Rovyn",
      description: "Quote follow-up automation is coming soon.",
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
    status: "coming_soon",
    marketingStatus: "Coming soon",
    assets: productBrand("orvyn", true),
    accent: "#E10600",
    route: "/dashboard/product",
    pricing: { monthly: 89.99, label: "€89,99 / month" },
    navigation: [],
    featureFlags: {},
    dashboard: {
      title: "Orvyn",
      description: "Payment and invoice follow-up is coming soon.",
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
    status: "coming_soon",
    marketingStatus: "Coming soon",
    assets: productBrand("nexro"),
    accent: "#1E40AF",
    route: "/dashboard/product",
    pricing: { monthly: 129.99, label: "€129,99 / month" },
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
    status: "coming_soon",
    marketingStatus: "Coming soon",
    assets: productBrand("ravelo"),
    accent: "#1D4ED8",
    route: "/dashboard/product",
    pricing: { monthly: 129.99, label: "€129,99 / month" },
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

/** Combined monthly price of every product at its individual price. */
export const bundleFullMonthly = Number(
  products
    .reduce((total, product) => total + (product.pricing.monthly ?? 0), 0)
    .toFixed(2),
);

/** Discounted monthly price when the full bundle is purchased. */
export const bundleMonthly = Number(
  (bundleFullMonthly * (1 - BUNDLE_DISCOUNT)).toFixed(2),
);

/** Format a numeric amount as a euro price string (e.g. 49.99 -> "€49,99"). */
export function formatPrice(amount: number) {
  return `€${amount.toFixed(2).replace(".", ",")}`;
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
