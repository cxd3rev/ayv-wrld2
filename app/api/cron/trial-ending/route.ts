import { legacyModulesEnabled } from "@/config/features";
import { PRODUCT_NAME } from "@/config/site";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDays } from "@/lib/maintenance-rules";
import { onderhoudCharge } from "@/lib/stripe-catalog";
import { isUsableSecret } from "@/lib/billing-status";
import { getAppUrl } from "@/lib/utils";
import { sendEmail, trialEndingEmailHtml } from "@/services/email";

export const runtime = "nodejs";

function brusselsToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date());
}

function brusselsDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date(iso));
}

function dutchDate(isoDay: string) {
  return new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${isoDay}T00:00:00Z`),
  );
}

function one<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function GET(request: Request) {
  if (legacyModulesEnabled) {
    return NextResponse.json({ ok: true, skipped: "legacy-modules-on" });
  }
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron is not configured." }, { status: 501 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!isUsableSecret(key, ["sk_test_", "sk_live_", "rk_test_", "rk_live_"])) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }

  const stripe = new Stripe(key as string);
  const admin = createAdminClient();
  const target = addDays(brusselsToday(), 2);
  const { data: subscriptions } = await admin
    .from("subscriptions")
    .select("id, organization_id, status, current_period_end, stripe_price_id")
    .eq("status", "trialing");

  let sent = 0;
  let skipped = 0;
  for (const subscription of subscriptions ?? []) {
    if (!subscription.current_period_end || brusselsDate(subscription.current_period_end) !== target) {
      skipped += 1;
      continue;
    }
    const charge = onderhoudCharge(subscription.stripe_price_id);
    if (!charge) {
      skipped += 1;
      continue;
    }
    const template = `trial-ending:${subscription.id}:${target}`;
    const { data: existing } = await admin.from("email_events").select("id").eq("template", template).eq("status", "sent").limit(1);
    if (existing && existing.length > 0) {
      skipped += 1;
      continue;
    }

    const { data: owners } = await admin
      .from("organization_members")
      .select("profiles(full_name, email)")
      .eq("organization_id", subscription.organization_id)
      .eq("role", "owner")
      .limit(1);
    const profile = one(owners?.[0]?.profiles ?? null);
    const { data: organization } = await admin
      .from("organizations")
      .select("email")
      .eq("id", subscription.organization_id)
      .maybeSingle();
    const to = profile?.email?.trim() || organization?.email?.trim();
    if (!to) {
      skipped += 1;
      continue;
    }

    const { data: customer } = await admin
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("organization_id", subscription.organization_id)
      .maybeSingle();
    if (!customer?.stripe_customer_id) {
      skipped += 1;
      continue;
    }

    let portalUrl = "";
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.stripe_customer_id,
        return_url: `${getAppUrl()}/dashboard/settings/billing`,
      });
      portalUrl = session.url;
    } catch {
      skipped += 1;
      continue;
    }

    const endsOn = dutchDate(target);
    const result = await sendEmail({
      to,
      subject: "Je proefperiode loopt bijna af",
      html: trialEndingEmailHtml({
        name: profile?.full_name?.trim() || PRODUCT_NAME,
        endsOn,
        amountEur: charge.amountEur,
        period: charge.period,
        portalUrl,
      }),
      template,
      organizationId: subscription.organization_id,
    });
    if (result.ok) sent += 1;
    else skipped += 1;
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
