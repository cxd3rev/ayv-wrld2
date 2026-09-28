import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapStripeStatus, isUsableSecret } from "@/lib/billing-status";
import {
  type BillableProductId,
  BILLABLE_PRODUCTS,
  isBillableProductId,
  productFromStripeMetadata,
  productFromStripePriceId,
} from "@/lib/stripe-catalog";

export const runtime = "nodejs";

const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

function periodFromSubscription(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  const start =
    item && "current_period_start" in item
      ? Number(item.current_period_start)
      : "current_period_start" in subscription
        ? Number((subscription as Stripe.Subscription & { current_period_start?: number }).current_period_start)
        : null;
  const end =
    item && "current_period_end" in item
      ? Number(item.current_period_end)
      : "current_period_end" in subscription
        ? Number((subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end)
        : null;

  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
  };
}

function stripePriceIdFromSubscription(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

function modulesFromSubscription(subscription: Stripe.Subscription, slug: string | null) {
  if (slug === "full_stack") return [...BILLABLE_PRODUCTS];
  const fromMetadata = (subscription.metadata?.modules ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is BillableProductId => isBillableProductId(item));
  if (slug === "growth") return fromMetadata.slice(0, 3);
  if (slug && isBillableProductId(slug)) return [slug];
  return fromMetadata;
}

function productSlugFromSubscription(subscription: Stripe.Subscription, priceId: string | null) {
  return (
    productFromStripePriceId(priceId) ||
    productFromStripeMetadata(subscription.metadata?.product_slug) ||
    productFromStripeMetadata(subscription.metadata?.ayv_product)
  );
}

async function catalogIds(slug: string | null, stripePriceId: string | null) {
  if (!slug) return { productId: null as string | null, priceId: null as string | null };
  const admin = createAdminClient();
  const { data: product } = await admin.from("products").select("id").eq("slug", slug).maybeSingle();
  let priceId: string | null = null;
  if (stripePriceId) {
    const { data: price } = await admin
      .from("prices")
      .select("id")
      .eq("stripe_price_id", stripePriceId)
      .maybeSingle();
    priceId = price?.id ?? null;
  }
  return { productId: product?.id ?? null, priceId };
}

async function syncEntitlement(
  organizationId: string,
  productId: string | null,
  status: string,
) {
  if (!productId) return;
  const admin = createAdminClient();
  await admin.from("organization_products").upsert(
    {
      organization_id: organizationId,
      product_id: productId,
      enabled: PAID_STATUSES.has(status),
    },
    { onConflict: "organization_id,product_id" },
  );
}

async function upsertSubscription(subscription: Stripe.Subscription, organizationId: string) {
  const admin = createAdminClient();
  const period = periodFromSubscription(subscription);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const stripePriceId = stripePriceIdFromSubscription(subscription);
  const productSlug = productSlugFromSubscription(subscription, stripePriceId);
  const catalog = await catalogIds(productSlug, stripePriceId);
  const status = mapStripeStatus(subscription.status);

  const { data: customer } = await admin
    .from("billing_customers")
    .select("id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  await admin.from("subscriptions").upsert(
    {
      organization_id: organizationId,
      billing_customer_id: customer?.id ?? null,
      product_id: catalog.productId,
      price_id: catalog.priceId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      stripe_price_id: stripePriceId,
      status,
      current_period_start: period.start,
      current_period_end: period.end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" },
  );

  await syncEntitlement(organizationId, catalog.productId, status);

  if (productSlug === "growth" || productSlug === "full_stack") {
    const selected = new Set(modulesFromSubscription(subscription, productSlug));
    const { data: ownSubscriptions } = await admin
      .from("subscriptions")
      .select("status, products(slug)")
      .eq("organization_id", organizationId);
    const individuallyPaid = new Set<string>();
    for (const row of ownSubscriptions ?? []) {
      if (!PAID_STATUSES.has(row.status)) continue;
      const related = Array.isArray(row.products) ? row.products[0] : row.products;
      const slug = related && typeof related === "object" && "slug" in related ? String(related.slug) : "";
      if (isBillableProductId(slug)) individuallyPaid.add(slug);
    }

    for (const moduleSlug of BILLABLE_PRODUCTS) {
      if (!selected.has(moduleSlug) && individuallyPaid.has(moduleSlug)) continue;
      const moduleCatalog = await catalogIds(moduleSlug, null);
      await syncEntitlement(
        organizationId,
        moduleCatalog.productId,
        selected.has(moduleSlug) ? status : "cancelled",
      );
    }
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!isUsableSecret(secret, ["whsec_"])) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }
  if (!isUsableSecret(stripeKey, ["sk_test_", "sk_live_", "rk_test_", "rk_live_"])) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.metadata?.organization_id;
      if (organizationId && session.subscription && session.customer) {
        const admin = createAdminClient();
        await admin.from("billing_customers").upsert(
          {
            organization_id: organizationId,
            stripe_customer_id: String(session.customer),
          },
          { onConflict: "organization_id" },
        );
        const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
        if (session.metadata?.product_slug && !subscription.metadata?.product_slug) {
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              ...subscription.metadata,
              organization_id: organizationId,
              product_slug: session.metadata.product_slug,
              modules: session.metadata.modules ?? subscription.metadata?.modules ?? "",
            },
          });
          subscription.metadata = {
            ...subscription.metadata,
            organization_id: organizationId,
            product_slug: session.metadata.product_slug,
            modules: session.metadata.modules ?? subscription.metadata?.modules ?? "",
          };
        }
        await upsertSubscription(subscription, organizationId);
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const organizationId = subscription.metadata?.organization_id;
      if (organizationId) {
        await upsertSubscription(subscription, organizationId);
      }
    }
  } catch {
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
