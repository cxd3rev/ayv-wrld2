/**
 * Central product catalog for every AYV WRLD product.
 *
 * How to add or activate a future product:
 * 1. Add (or update) an entry in `products`.
 * 2. Set `status` to "active" when the product dashboard should open.
 * 3. Add product-specific pages under app/dashboard later — do not mix
 *    product business logic into the shared foundation.
 *
 * Avyro is marked active so the dashboard product slot is ready.
 * Its real features are not built yet, so marketing copy says
 * "In development" instead of "Available".
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
  icon: "zap" | "calendar" | "file-text" | "credit-card" | "refresh" | "star";
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
    icon: "zap",
    accent: "#F0A202",
    route: "/dashboard/product",
    pricing: { monthly: null, label: "Pricing coming soon" },
    navigation: [{ label: "Overview", href: "/dashboard/product" }],
    featureFlags: {
      leadCapture: false,
      followUpSequences: false,
    },
    dashboard: {
      title: "Avyro",
      description: "Lead conversion workspace. Product features will be added here next.",
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
    icon: "calendar",
    accent: "#F97316",
    route: "/dashboard/product",
    pricing: { monthly: null, label: "Pricing coming soon" },
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
    icon: "file-text",
    accent: "#E8A317",
    route: "/dashboard/product",
    pricing: { monthly: null, label: "Pricing coming soon" },
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
    icon: "credit-card",
    accent: "#FB923C",
    route: "/dashboard/product",
    pricing: { monthly: null, label: "Pricing coming soon" },
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
    icon: "refresh",
    accent: "#F59E0B",
    route: "/dashboard/product",
    pricing: { monthly: null, label: "Pricing coming soon" },
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
    icon: "star",
    accent: "#FBBF24",
    route: "/dashboard/product",
    pricing: { monthly: null, label: "Pricing coming soon" },
    navigation: [],
    featureFlags: {},
    dashboard: {
      title: "Ravelo",
      description: "Review automation is coming soon.",
    },
  },
];

export const defaultProductId: ProductId = "avyro";

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
