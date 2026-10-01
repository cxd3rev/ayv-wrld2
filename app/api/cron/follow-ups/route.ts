import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail, sendOutreachEmail } from "@/lib/outreach-mail";
import { followUpEmail, sendEmail } from "@/services/email";

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

function formatInvoiceAmount(amount: unknown, currency: unknown) {
  const value = Number(amount);
  const code = typeof currency === "string" && currency.trim() ? currency.trim() : "EUR";
  if (!Number.isFinite(value)) return code;
  try {
    return new Intl.NumberFormat("nl-BE", { style: "currency", currency: code }).format(value);
  } catch {
    return `${value} ${code}`;
  }
}

function formatInvoiceDay(value: unknown) {
  if (typeof value !== "string") return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(year, month - 1, day),
  );
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

  const { data: leads } = await admin
    .from("leads")
    .select("id, organization_id, name, email, status")
    .eq("follow_up_on", today)
    .in("status", ["new", "contacted"]);
  for (const lead of leads ?? []) {
    const organizationName = names.get(lead.organization_id) ?? "AYV Automation";
    const person = lead.name || "there";
    await deliver(
      lead,
      "leads",
      `Follow-up from ${organizationName}`,
      `Hi ${person}, this is a follow-up from ${organizationName}.`,
      async () => {
        if (lead.status !== "new") return;
        await admin.from("leads").update({ status: "contacted" }).eq("id", lead.id);
      },
    );
  }

  const { data: bookings } = await admin
    .from("bookings")
    .select("id, organization_id, customer_name, email, status")
    .eq("reminder_on", today)
    .in("status", ["scheduled", "confirmed"]);
  for (const booking of bookings ?? []) {
    const organizationName = names.get(booking.organization_id) ?? "AYV Automation";
    const person = booking.customer_name || "there";
    await deliver(
      booking,
      "bookings",
      `Reminder from ${organizationName}`,
      `Hi ${person}, this is a reminder from ${organizationName} about your booking.`,
    );
  }

  const { data: quotes } = await admin
    .from("quotes")
    .select("id, organization_id, customer_name, email, status")
    .eq("follow_up_on", today)
    .in("status", ["sent", "followed_up"]);
  for (const quote of quotes ?? []) {
    const organizationName = names.get(quote.organization_id) ?? "AYV Automation";
    const person = quote.customer_name || "there";
    await deliver(
      quote,
      "quotes",
      `Quote follow-up from ${organizationName}`,
      `Hi ${person}, this is a follow-up from ${organizationName} about your quote.`,
      async () => {
        await admin.from("quotes").update({ status: "followed_up" }).eq("id", quote.id);
      },
    );
  }

  const { data: invoices } = await admin
    .from("invoices")
    .select("id, organization_id, customer_name, email, status, invoice_number, description, amount, currency, due_on")
    .eq("next_reminder_on", today)
    .in("status", ["sent", "overdue"]);
  for (const invoice of invoices ?? []) {
    const organizationName = names.get(invoice.organization_id) ?? "AYV Automation";
    const person = invoice.customer_name || "there";
    const number = String(invoice.invoice_number ?? "").trim();
    await deliver(
      invoice,
      "invoices",
      number ? `Reminder for invoice ${number}` : `Invoice reminder from ${organizationName}`,
      `Hi ${person}, this is a payment reminder for the invoice below. It is a reminder only, not a new invoice.`,
      undefined,
      [
        { label: "Invoice", value: number },
        { label: "Amount", value: formatInvoiceAmount(invoice.amount, invoice.currency) },
        { label: "Due", value: formatInvoiceDay(invoice.due_on) },
        { label: "For", value: String(invoice.description ?? "").trim() },
      ],
    );
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
