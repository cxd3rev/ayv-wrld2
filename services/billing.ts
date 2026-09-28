import "server-only";

import Stripe from "stripe";
import { getAppUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { isPaidStatus, isUsableSecret } from "@/lib/billing-status";
import {
  type BillablePlanId,
  type BillableProductId,
  type CheckoutProductId,
  BILLABLE_PRODUCTS,
  billableProductName,
  getStripePriceId,
  isBillableProductId,
  isCheckoutProductId,
  isProductCheckoutReady,
  isStripeSecretConfigured,
  productFromStripePriceId,
} from "@/lib/stripe-catalog";
import { getProduct, planPricing } from "@/config/products";
import type { Organization, Subscription } from "@/types/database";

export { mapStripeStatus, isUsableSecret, isPaidStatus } from "@/lib/billing-status";
export { isStripeConfigured, isProductCheckoutReady } from "@/lib/stripe-catalog";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!isUsableSecret(key, ["sk_test_", "sk_live_", "rk_test_", "rk_live_"])) return null;
  return new Stripe(key as string);
}

type SubscriptionRow = Subscription & {
  products?: { slug: string | null } | { slug: string | null }[] | null;
};

function withProductSlug(row: SubscriptionRow): Subscription {
  const related = Array.isArray(row.products) ? row.products[0] : row.products;
  const slug = related?.slug && isCheckoutProductId(related.slug) ? related.slug : null;
  const { products: _products, ...subscription } = row;
  void _products;
  return {
    ...subscription,
    product_slug: slug ?? productFromStripePriceId(subscription.stripe_price_id ?? null),
  };
}

export async function getOrganizationSubscriptions(organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*, products(slug)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  return ((data as SubscriptionRow[] | null) ?? []).map(withProductSlug);
}

export async function getOrganizationSubscription(organizationId: string) {
  const subscriptions = await getOrganizationSubscriptions(organizationId);
  return subscriptions[0] ?? null;
}

export function subscriptionForProduct(subscriptions: Subscription[], product: CheckoutProductId) {
  return (
    subscriptions.find((item) => item.product_slug === product && isPaidStatus(item.status)) ??
    subscriptions.find((item) => item.product_slug === product) ??
    null
  );
}

export function paidProductSlugs(subscriptions: Subscription[]) {
  const paid = new Set<CheckoutProductId>();
  for (const item of subscriptions) {
    if (item.product_slug && isPaidStatus(item.status)) {
      paid.add(item.product_slug);
    }
  }
  return [...paid];
}

/**
 * Create a Stripe Checkout session for one module or for Growth / Full stack.
 * Price ids stay on the server. Growth must name exactly three modules.
 */
export async function createCheckoutSession(
  organization: Organization,
  product: CheckoutProductId,
  modules: BillableProductId[] = [],
) {
  const stripe = getStripe();
  const resolvedPrice = getStripePriceId(product);

  if (!isStripeSecretConfigured() || !stripe || !resolvedPrice) {
    return { ok: false as const, error: "Billing is not configured yet." };
  }

  const uniqueModules = [...new Set(modules)];
  const coveredModules: BillableProductId[] =
    product === "full_stack"
      ? [...BILLABLE_PRODUCTS]
      : product === "growth"
        ? uniqueModules
        : [product];

  if (product === "growth" && coveredModules.length !== 3) {
    return { ok: false as const, error: "Choose exactly three modules for Growth." };
  }
  if (coveredModules.some((item) => !isBillableProductId(item))) {
    return { ok: false as const, error: "Unknown product." };
  }

  const current = await getOrganizationSubscriptions(organization.id);
  const paid = current.filter((item) => item.product_slug && isPaidStatus(item.status));
  if (product !== "full_stack" && paid.some((item) => item.product_slug === "full_stack")) {
    return { ok: false as const, error: "The full stack already covers every module." };
  }

  const existing = subscriptionForProduct(current, product);
  if (existing && isPaidStatus(existing.status)) {
    return {
      ok: false as const,
      error: `This workspace already has an active ${billableProductName(product)} subscription.`,
    };
  }

  try {
    const customerId = await getOrCreateStripeCustomer(stripe, organization);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: resolvedPrice, quantity: 1 }],
      success_url: `${getAppUrl()}/dashboard/billing?checkout=success&product=${product}`,
      cancel_url: `${getAppUrl()}/dashboard/billing?checkout=cancelled&product=${product}`,
      metadata: {
        organization_id: organization.id,
        product_slug: product,
        modules: coveredModules.join(","),
      },
      subscription_data: {
        metadata: {
          organization_id: organization.id,
          product_slug: product,
          modules: coveredModules.join(","),
        },
      },
    });

    if (!session.url) {
      return { ok: false as const, error: "Could not start checkout." };
    }

    return { ok: true as const, url: session.url };
  } catch (error) {
    const message = error instanceof Stripe.errors.StripeError ? error.message : "Could not start checkout.";
    console.error("Stripe checkout failed:", message);
    return { ok: false as const, error: message };
  }
}

export async function createBillingPortalSession(organization: Organization) {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false as const, error: "Billing is not configured yet." };
  }

  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!customer?.stripe_customer_id) {
    return { ok: false as const, error: "No billing customer exists yet. Start a subscription first." };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${getAppUrl()}/dashboard/billing`,
    });

    return { ok: true as const, url: session.url };
  } catch (error) {
    const message = error instanceof Stripe.errors.StripeError ? error.message : "Could not open billing portal.";
    console.error("Stripe billing portal failed:", message);
    return { ok: false as const, error: message };
  }
}

async function getOrCreateStripeCustomer(stripe: Stripe, organization: Organization) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    name: organization.name,
    email: organization.email ?? undefined,
    metadata: { organization_id: organization.id },
  });

  await supabase.from("billing_customers").insert({
    organization_id: organization.id,
    stripe_customer_id: customer.id,
  });

  return customer.id;
}

export function getPlanCatalog() {
  return [
    {
      id: "growth" as const,
      name: "Growth",
      monthlyPrice: planPricing.growth,
      configured: isProductCheckoutReady("growth"),
    },
    {
      id: "full_stack" as const,
      name: "Full stack",
      monthlyPrice: planPricing.fullStack,
      configured: isProductCheckoutReady("full_stack"),
    },
  ];
}

export function getBillableCatalog() {
  return BILLABLE_PRODUCTS.map((id) => {
    const product = getProduct(id);
    return {
      id,
      name: product?.name ?? id,
      monthlyPrice: product?.pricing.monthly ?? null,
      configured: isProductCheckoutReady(id),
    };
  });
}
