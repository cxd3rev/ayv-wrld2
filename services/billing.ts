import "server-only";

import Stripe from "stripe";
import { getAppUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { isUsableSecret } from "@/lib/billing-status";
import type { Organization, Subscription } from "@/types/database";

export { mapStripeStatus, isUsableSecret } from "@/lib/billing-status";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!isUsableSecret(key, ["sk_test_", "sk_live_", "rk_test_", "rk_live_"])) return null;
  return new Stripe(key as string);
}

export function isStripeConfigured() {
  return (
    isUsableSecret(process.env.STRIPE_SECRET_KEY, ["sk_test_", "sk_live_", "rk_test_", "rk_live_"]) &&
    isUsableSecret(process.env.STRIPE_PRICE_ID, ["price_"])
  );
}

export async function getOrganizationSubscription(organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as Subscription | null) ?? null;
}

/**
 * Create a Stripe Checkout session for the current organization.
 * The secret key stays on the server.
 */
export async function createCheckoutSession(organization: Organization, priceId?: string) {
  const stripe = getStripe();
  const resolvedPrice = priceId || process.env.STRIPE_PRICE_ID;

  if (!stripe || !resolvedPrice) {
    return { ok: false as const, error: "Billing is not configured yet." };
  }

  try {
    const customerId = await getOrCreateStripeCustomer(stripe, organization);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: resolvedPrice, quantity: 1 }],
      success_url: `${getAppUrl()}/dashboard/billing?checkout=success`,
      cancel_url: `${getAppUrl()}/dashboard/billing?checkout=cancelled`,
      metadata: {
        organization_id: organization.id,
      },
      subscription_data: {
        metadata: {
          organization_id: organization.id,
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
