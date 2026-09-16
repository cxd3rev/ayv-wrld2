import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapStripeStatus } from "@/lib/billing-status";

export const runtime = "nodejs";

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

async function upsertSubscription(subscription: Stripe.Subscription, organizationId: string) {
  const admin = createAdminClient();
  const period = periodFromSubscription(subscription);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const { data: customer } = await admin
    .from("billing_customers")
    .select("id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  await admin.from("subscriptions").upsert(
    {
      organization_id: organizationId,
      billing_customer_id: customer?.id ?? null,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: mapStripeStatus(subscription.status),
      current_period_start: period.start,
      current_period_end: period.end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" },
  );
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeKey) {
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
