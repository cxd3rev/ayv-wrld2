import { getProduct, type ProductId } from "@/config/products";
import { PRODUCT_NAME } from "@/config/site";
import { isUsableSecret } from "@/lib/billing-status";

/** Products that can be purchased as their own Stripe subscription. */
export const BILLABLE_PRODUCTS = ["avyro", "velto", "rovyn", "orvyn", "nexro", "ravelo"] as const;
export type BillableProductId = (typeof BILLABLE_PRODUCTS)[number];

/** Plans that cover more than one module. */
export const BILLABLE_PLANS = ["growth", "full_stack"] as const;
export type BillablePlanId = (typeof BILLABLE_PLANS)[number];
export type CheckoutProductId = BillableProductId | BillablePlanId | "onderhoud";

const PRICE_ENV: Record<CheckoutProductId, string> = {
  avyro: "STRIPE_PRICE_ID",
  velto: "STRIPE_VELTO_PRICE_ID",
  rovyn: "STRIPE_ROVYN_PRICE_ID",
  orvyn: "STRIPE_ORVYN_PRICE_ID",
  nexro: "STRIPE_NEXRO_PRICE_ID",
  ravelo: "STRIPE_RAVELO_PRICE_ID",
  growth: "STRIPE_GROWTH_PRICE_ID",
  full_stack: "STRIPE_FULL_STACK_PRICE_ID",
  onderhoud: "STRIPE_ONDERHOUD_PRICE_ID",
};

const LEGACY_PRICE_IDS: Record<CheckoutProductId, readonly string[]> = {
  avyro: [
    "price_1UKTxqV05bHNwI4WjQFWlErq",
    "price_1UHBw8V05bHNwI4W6itaFohv",
    "price_1UGfwEV05bHNwI4Wgwd8IUTt",
    "price_1UGoAcV05bHNwI4WhutfWSOT",
  ],
  velto: [
    "price_1UHBw8V05bHNwI4WUFbHzh4r",
    "price_1UGiKnV05bHNwI4WUPKCUXiG",
    "price_1UGoAdV05bHNwI4Wzx1Dr7pi",
  ],
  rovyn: [
    "price_1UHBw9V05bHNwI4WHzBNom5O",
    "price_1UGlkJV05bHNwI4WyHW2P9WH",
    "price_1UGoBTV05bHNwI4WffhSPoXs",
  ],
  orvyn: [
    "price_1UHBwMV05bHNwI4W7yJ3dlav",
    "price_1UGnkrV05bHNwI4W2UBrFrKc",
    "price_1UGoAcV05bHNwI4W7qgb9GzE",
  ],
  nexro: ["price_1UKMOWV05bHNwI4WpBB2w9mc"],
  ravelo: ["price_1UKMOXV05bHNwI4Wwwxs33wT"],
  growth: ["price_1UKUL5V05bHNwI4WIRPbmhSa"],
  full_stack: ["price_1UKUL6V05bHNwI4WOgsgdJEX"],
  onderhoud: [],
};

export function isBillableProductId(value: string): value is BillableProductId {
  return (BILLABLE_PRODUCTS as readonly string[]).includes(value);
}

export function isBillablePlanId(value: string): value is BillablePlanId {
  return (BILLABLE_PLANS as readonly string[]).includes(value);
}

export function isCheckoutProductId(value: string): value is CheckoutProductId {
  return value === "onderhoud" || isBillableProductId(value) || isBillablePlanId(value);
}

export function getStripePriceId(product: CheckoutProductId) {
  const value = process.env[PRICE_ENV[product]];
  return isUsableSecret(value, ["price_"]) ? value : null;
}

export function productFromStripePriceId(priceId: string | null | undefined): CheckoutProductId | null {
  if (!priceId) return null;
  const products = [...BILLABLE_PRODUCTS, ...BILLABLE_PLANS];
  for (const product of products) {
    if (
      getStripePriceId(product) === priceId ||
      LEGACY_PRICE_IDS[product].includes(priceId)
    ) {
      return product;
    }
  }
  return null;
}

export function productFromStripeMetadata(value: string | null | undefined): CheckoutProductId | null {
  if (!value) return null;
  return isCheckoutProductId(value) ? value : null;
}

export function isStripeSecretConfigured() {
  return isUsableSecret(process.env.STRIPE_SECRET_KEY, ["sk_test_", "sk_live_", "rk_test_", "rk_live_"]);
}

export function isStripeConfigured() {
  return isStripeSecretConfigured() && BILLABLE_PRODUCTS.some((product) => Boolean(getStripePriceId(product)));
}

export function isProductCheckoutReady(product: CheckoutProductId) {
  return isStripeSecretConfigured() && Boolean(getStripePriceId(product));
}

export function toProductId(product: BillableProductId): ProductId {
  return product;
}

export function billableProductName(product: CheckoutProductId) {
  if (product === "growth") return "Growth";
  if (product === "full_stack") return "Full stack";
  if (product === "onderhoud") return PRODUCT_NAME;
  return getProduct(product)?.name ?? product;
}
