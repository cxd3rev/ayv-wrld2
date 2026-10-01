import { legacyModulesEnabled } from "@/config/features";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail, sendOutreachEmail } from "@/lib/outreach-mail";
import { followUpEmail, sendEmail } from "@/services/email";
import { checkInLink, flagChurn, getModuleSettings, isQuiet } from "@/services/journey";

export const runtime = "nodejs";

type DueRow = {
  id: string;
  organization_id: string;
  email: string | null;
  status: string;
};

function amsterdamToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

async function alreadySent(template: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("email_events")
    .select("id")
    .eq("template", template)
    .eq("status", "sent")
    .limit(1);
  return Boolean(data && data.length > 0);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Cron is not configured." }, { status: 501 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!legacyModulesEnabled) {
    return NextResponse.json({ ok: true, skipped: "legacy-modules-off" });
  }

  const admin = createAdminClient();
  const today = amsterdamToday();
  const { data: organizations } = await admin.from("organizations").select("id, name, email, phone, website");
  const orgs = new Map(
    (organizations ?? []).map((org) => [
      String(org.id),
      {
        name: typeof org.name === "string" && org.name ? org.name : "AYV Automation",
        email: typeof org.email === "string" ? org.email : null,
        phone: typeof org.phone === "string" ? org.phone : null,
        website: typeof org.website === "string" ? org.website : null,
      },
    ]),
  );
  const names = new Map([...orgs.entries()].map(([id, org]) => [id, org.name]));

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  async function deliver(
    row: DueRow,
    table: string,
    subject: string,
    message: string,
    after?: () => Promise<void>,
    lines?: { label: string; value: string }[],
  ) {
    const email = row.email?.trim();
    if (!email) {
      skipped += 1;
      return;
    }
    const template = `follow-up:${table}:${row.id}:${today}`;
    if (await alreadySent(template)) {
      skipped += 1;
      return;
    }
    const organizationName = names.get(row.organization_id) ?? "AYV Automation";
    const result = await sendEmail({
      to: email,
      subject,
      html: followUpEmail({ organizationName, message, lines }),
      template,
      organizationId: row.organization_id,
    });
    if (!result.ok) {
      failed += 1;
      return;
    }
    sent += 1;
    if (after) await after();
  }

  const { data: checkIns } = await admin
    .from("check_ins")
    .select("id, organization_id, reply_token, status, clients(name, email)")
    .lte("check_in_on", today)
    .eq("status", "scheduled");
  for (const row of checkIns ?? []) {
    const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    const organizationName = names.get(row.organization_id) ?? "AYV Automation";
    const person = client?.name || "there";
    await deliver(
      { id: row.id, organization_id: row.organization_id, email: client?.email ?? null, status: row.status },
      "check-ins",
      `How did it go? — ${organizationName}`,
      `Hi ${person}, how did your visit go? Tell us here: ${checkInLink(row.reply_token)}`,
      async () => {
        await admin.from("check_ins").update({ status: "sent" }).eq("id", row.id);
      },
    );
  }

  const { data: dueReminders } = await admin
    .from("renewals")
    .select("id, organization_id, plan_name, status, clients(name, email)")
    .lte("reminder_on", today)
    .eq("status", "scheduled");
  for (const row of dueReminders ?? []) {
    const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    const organizationName = names.get(row.organization_id) ?? "AYV Automation";
    const person = client?.name || "there";
    await deliver(
      { id: row.id, organization_id: row.organization_id, email: client?.email ?? null, status: row.status },
      "renewals",
      `Renewal reminder from ${organizationName}`,
      `Hi ${person}, your ${row.plan_name} renewal is coming up.`,
      async () => {
        await admin.from("renewals").update({ status: "reminded" }).eq("id", row.id);
      },
    );
  }

  const { data: lapsed } = await admin
    .from("renewals")
    .select("id, organization_id, client_id, renews_on, clients(name, email, phone)")
    .lt("renews_on", today)
    .in("status", ["scheduled", "reminded"]);
  for (const row of lapsed ?? []) {
    const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    await admin.from("renewals").update({ status: "lapsed" }).eq("id", row.id);
    await flagChurn(admin, {
      organizationId: row.organization_id,
      clientId: row.client_id,
      name: client?.name || "Client",
      email: client?.email ?? null,
      phone: client?.phone ?? null,
      lastActivityOn: row.renews_on,
      frequencyDays: 30,
      origin: "velto",
    });
  }

  const { data: watches } = await admin
    .from("churn_watches")
    .select("id, organization_id, client_id, frequency_days, last_activity_on, status, clients(name, email, phone)")
    .eq("status", "watching");
  for (const row of watches ?? []) {
    const settings = await getModuleSettings(admin, row.organization_id, "rovyn");
    if (!isQuiet(row.last_activity_on, row.frequency_days, settings.churn_margin_days, today)) continue;
    const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    await flagChurn(admin, {
      organizationId: row.organization_id,
      clientId: row.client_id,
      name: client?.name || "Client",
      email: client?.email ?? null,
      phone: client?.phone ?? null,
      lastActivityOn: row.last_activity_on,
      frequencyDays: row.frequency_days,
      origin: "manual",
    });
  }

  async function deliverOutreach(
    row: DueRow,
    subject: string,
    message: string,
    templateName: string,
    after?: () => Promise<void>,
    requireRelationship = false,
  ) {
    const email = row.email?.trim();
    if (!email) {
      skipped += 1;
      return;
    }
    const template = `follow-up:${templateName}:${row.id}:${today}`;
    if (await alreadySent(template)) {
      skipped += 1;
      return;
    }
    if (requireRelationship) {
      const { data: contact } = await admin
        .from("contacts")
        .select("relationship")
        .eq("organization_id", row.organization_id)
        .eq("email", normalizeEmail(email))
        .maybeSingle();
      if (!contact?.relationship) {
        skipped += 1;
        return;
      }
    }
    const org = orgs.get(row.organization_id) ?? {
      name: "AYV Automation",
      email: null,
      phone: null,
      website: null,
    };
    const result = await sendOutreachEmail({
      to: email,
      subject,
      message,
      template,
      organizationId: row.organization_id,
      organizationName: org.name,
      contactEmail: org.email,
      contactPhone: org.phone,
      website: org.website,
      locale: "en",
    });
    if (!result.ok) {
      if (result.error === "This address is unsubscribed.") skipped += 1;
      else failed += 1;
      return;
    }
    sent += 1;
    if (after) await after();
  }

  const { data: scheduledReviews } = await admin
    .from("reviews")
    .select("id, organization_id, customer_name, email, status")
    .eq("requested_on", today)
    .eq("status", "scheduled");
  for (const review of scheduledReviews ?? []) {
    const organizationName = names.get(review.organization_id) ?? "AYV Automation";
    const person = review.customer_name || "there";
    await deliverOutreach(
      review,
      `Review request from ${organizationName}`,
      `Hi ${person}, ${organizationName} would like to hear how the work went.`,
      "reviews",
      async () => {
        await admin.from("reviews").update({ status: "requested" }).eq("id", review.id);
      },
    );
  }

  const { data: reviewFollowUps } = await admin
    .from("reviews")
    .select("id, organization_id, customer_name, email, status")
    .eq("next_follow_up_on", today)
    .eq("status", "requested");
  for (const review of reviewFollowUps ?? []) {
    const organizationName = names.get(review.organization_id) ?? "AYV Automation";
    const person = review.customer_name || "there";
    await deliverOutreach(
      review,
      `Review follow-up from ${organizationName}`,
      `Hi ${person}, a short follow-up from ${organizationName} about your review.`,
      "reviews-follow-up",
    );
  }

  const { data: reactivations } = await admin
    .from("reactivations")
    .select("id, organization_id, customer_name, email, status, message")
    .eq("next_touch_on", today)
    .in("status", ["scheduled", "sent"]);
  for (const reactivation of reactivations ?? []) {
    const organizationName = names.get(reactivation.organization_id) ?? "AYV Automation";
    const person = reactivation.customer_name || "there";
    const message = reactivation.message?.trim() || `Hi ${person}, a note from ${organizationName}.`;
    await deliverOutreach(
      reactivation,
      `A note from ${organizationName}`,
      message,
      "reactivations",
      async () => {
        if (reactivation.status !== "scheduled") return;
        await admin.from("reactivations").update({ status: "sent" }).eq("id", reactivation.id);
      },
      true,
    );
  }

  return NextResponse.json({ ok: true, sent, failed, skipped });
}
