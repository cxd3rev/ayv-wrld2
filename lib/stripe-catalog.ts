import { getProduct, type ProductId } from "@/config/products";
import { isUsableSecret } from "@/lib/billing-status";

/** Products that can be purchased as their own Stripe subscription. */
export const BILLABLE_PRODUCTS = ["avyro", "velto", "rovyn"] as const;
export type BillableProductId = (typeof BILLABLE_PRODUCTS)[number];

const PRICE_ENV: Record<BillableProductId, string> = {
  avyro: "STRIPE_PRICE_ID",
  velto: "STRIPE_VELTO_PRICE_ID",
  rovyn: "STRIPE_ROVYN_PRICE_ID",
};

export function isBillableProductId(value: string): value is BillableProductId {
  return (BILLABLE_PRODUCTS as readonly string[]).includes(value);
}

export function getStripePriceId(product: BillableProductId) {
  const value = process.env[PRICE_ENV[product]];
  return isUsableSecret(value, ["price_"]) ? value : null;
}

export function productFromStripePriceId(priceId: string | null | undefined): BillableProductId | null {
  if (!priceId) return null;
  for (const product of BILLABLE_PRODUCTS) {
    if (getStripePriceId(product) === priceId) return product;
  }
  return null;
}

export function productFromStripeMetadata(value: string | null | undefined): BillableProductId | null {
  if (!value) return null;
  return isBillableProductId(value) ? value : null;
}

export function isStripeSecretConfigured() {
  return isUsableSecret(process.env.STRIPE_SECRET_KEY, ["sk_test_", "sk_live_", "rk_test_", "rk_live_"]);
}

export function isStripeConfigured() {
  return isStripeSecretConfigured() && BILLABLE_PRODUCTS.some((product) => Boolean(getStripePriceId(product)));
}

export function isProductCheckoutReady(product: BillableProductId) {
  return isStripeSecretConfigured() && Boolean(getStripePriceId(product));
}

export function toProductId(product: BillableProductId): ProductId {
  return product;
}

export function billableProductName(product: BillableProductId) {
  return getProduct(product)?.name ?? product;
}
