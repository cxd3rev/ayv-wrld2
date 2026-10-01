import "server-only";

import { addCalendarDays } from "@/lib/calendar";
import { getAppUrl } from "@/lib/utils";
import { followUpEmail, sendEmail } from "@/services/email";
import type { ModuleSettings } from "@/types/database";

type Db = {
  from: (table: string) => any;
};

const settingDefaults = {
  check_in_delay_days: 1,
  renewal_lead_days: 7,
  churn_margin_days: 7,
  loyalty_threshold: 3,
  send_thank_you: true,
};

export async function getModuleSettings(db: Db, organizationId: string, product: ModuleSettings["product"]) {
  const { data } = await db
    .from("module_settings")
    .select("organization_id, product, check_in_delay_days, renewal_lead_days, churn_margin_days, loyalty_threshold, send_thank_you")
    .eq("organization_id", organizationId)
    .eq("product", product)
    .maybeSingle();
  if (data) return data as ModuleSettings;
  const { data: created } = await db
    .from("module_settings")
    .insert({ organization_id: organizationId, product, ...settingDefaults })
    .select("organization_id, product, check_in_delay_days, renewal_lead_days, churn_margin_days, loyalty_threshold, send_thank_you")
    .single();
  return (created as ModuleSettings | null) ?? { organization_id: organizationId, product, ...settingDefaults };
}

export async function ensureClient(
  db: Db,
  organizationId: string,
  input: { name: string; email?: string | null; phone?: string | null },
) {
  const email = input.email?.trim().toLowerCase() || null;
  const name = input.name.trim();
  const phone = input.phone?.trim() || null;
  if (email) {
    const { data: existing } = await db
      .from("clients")
      .select("id, phone")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .maybeSingle();
    if (existing?.id) {
      await db.from("clients").update({ name, phone: phone ?? existing.phone }).eq("id", existing.id);
      return existing.id as string;
    }
  }
  const { data, error } = await db
    .from("clients")
    .insert({ organization_id: organizationId, name, email, phone })
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

async function ensureContact(db: Db, organizationId: string, name: string, email: string | null, phone: string | null) {
  if (!email) return;
  const { data } = await db.from("contacts").select("id").eq("organization_id", organizationId).eq("email", email).maybeSingle();
  if (data?.id) return;
  await db.from("contacts").insert({
    organization_id: organizationId,
    name,
    email,
    phone,
    relationship: "existing_customer",
  });
}

export async function openWinBack(
  db: Db,
  input: { organizationId: string; clientId: string; name: string; email: string | null; phone: string | null; origin: "rovyn" },
) {
  const { data: existing } = await db
    .from("reactivations")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("client_id", input.clientId)
    .eq("kind", "winback")
    .in("status", ["scheduled", "sent"])
    .limit(1);
  if (existing && existing.length > 0) return existing[0].id as string;
  await ensureContact(db, input.organizationId, input.name, input.email, input.phone);
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await db
    .from("reactivations")
    .insert({
      organization_id: input.organizationId,
      client_id: input.clientId,
      customer_name: input.name,
      email: input.email,
      phone: input.phone,
      kind: "winback",
      origin: input.origin,
      status: "scheduled",
      message: `Hi ${input.name}, we noticed it has been a while. We would like to see you again.`,
      next_touch_on: today,
    })
    .select("id")
    .single();
  return (data?.id as string | undefined) ?? null;
}

export async function openReferral(
  db: Db,
  input: { organizationId: string; clientId: string; name: string; email: string | null; phone: string | null },
) {
  const { data: existing } = await db
    .from("reactivations")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("client_id", input.clientId)
    .eq("kind", "referral")
    .in("status", ["scheduled", "sent"])
    .limit(1);
  if (existing && existing.length > 0) return existing[0].id as string;
  await ensureContact(db, input.organizationId, input.name, input.email, input.phone);
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await db
    .from("reactivations")
    .insert({
      organization_id: input.organizationId,
      client_id: input.clientId,
      customer_name: input.name,
      email: input.email,
      phone: input.phone,
      kind: "referral",
      origin: "orvyn",
      status: "scheduled",
      message: `Hi ${input.name}, thank you for coming back. If you know someone who would like the same, a referral means a lot.`,
      next_touch_on: today,
    })
    .select("id")
    .single();
  return (data?.id as string | undefined) ?? null;
}

export async function openReviewFromCheckIn(
  db: Db,
  input: { organizationId: string; clientId: string; name: string; email: string | null; phone: string | null },
) {
  const { data: existing } = await db
    .from("reviews")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("client_id", input.clientId)
    .eq("origin", "avyro")
    .in("status", ["scheduled", "requested"])
    .limit(1);
  if (existing && existing.length > 0) return existing[0].id as string;
  await ensureContact(db, input.organizationId, input.name, input.email, input.phone);
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await db
    .from("reviews")
    .insert({
      organization_id: input.organizationId,
      client_id: input.clientId,
      customer_name: input.name,
      email: input.email,
      phone: input.phone,
      origin: "avyro",
      status: "scheduled",
      channel: "google",
      requested_on: today,
    })
    .select("id")
    .single();
  return (data?.id as string | undefined) ?? null;
}

export async function flagChurn(
  db: Db,
  input: {
    organizationId: string;
    clientId: string;
    name: string;
    email: string | null;
    phone: string | null;
    lastActivityOn: string;
    frequencyDays: number;
    origin: "manual" | "velto";
  },
) {
  const { data: existing } = await db
    .from("churn_watches")
    .select("id, origin")
    .eq("organization_id", input.organizationId)
    .eq("client_id", input.clientId)
    .maybeSingle();
  if (existing?.id) {
    await db
      .from("churn_watches")
      .update({
        status: "at_risk",
        last_activity_on: input.lastActivityOn,
        frequency_days: input.frequencyDays,
        origin: existing.origin === "manual" && input.origin === "velto" ? "velto" : existing.origin,
      })
      .eq("id", existing.id);
  } else {
    await db.from("churn_watches").insert({
      organization_id: input.organizationId,
      client_id: input.clientId,
      frequency_days: input.frequencyDays,
      last_activity_on: input.lastActivityOn,
      status: "at_risk",
      origin: input.origin,
    });
  }
  await db.from("clients").update({ churn_status: "at_risk" }).eq("id", input.clientId);
  await openWinBack(db, {
    organizationId: input.organizationId,
    clientId: input.clientId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    origin: "rovyn",
  });
}

export async function applyLoyalty(
  db: Db,
  input: {
    organizationId: string;
    clientId: string;
    name: string;
    email: string | null;
    phone: string | null;
    visitCount: number;
    threshold: number;
    sendThankYou: boolean;
    organizationName: string;
    origin: "manual" | "avyro";
  },
) {
  const loyal = input.visitCount >= input.threshold;
  await db
    .from("clients")
    .update({ visit_count: input.visitCount, loyalty_status: loyal ? "loyal" : "none" })
    .eq("id", input.clientId);
  const { data: existing } = await db
    .from("loyalty_records")
    .select("id, thank_you_on, origin")
    .eq("organization_id", input.organizationId)
    .eq("client_id", input.clientId)
    .maybeSingle();
  const status = loyal ? "loyal" : "tracking";
  let recordId = existing?.id as string | undefined;
  if (recordId) {
    await db.from("loyalty_records").update({ visit_count: input.visitCount, status }).eq("id", recordId);
  } else {
    const { data } = await db
      .from("loyalty_records")
      .insert({
        organization_id: input.organizationId,
        client_id: input.clientId,
        visit_count: input.visitCount,
        status,
        origin: input.origin,
      })
      .select("id")
      .single();
    recordId = data?.id;
  }
  if (loyal) {
    await openReferral(db, {
      organizationId: input.organizationId,
      clientId: input.clientId,
      name: input.name,
      email: input.email,
      phone: input.phone,
    });
    if (input.sendThankYou && input.email && recordId && !existing?.thank_you_on) {
      const result = await sendEmail({
        to: input.email,
        subject: `Thank you from ${input.organizationName}`,
        html: followUpEmail({
          organizationName: input.organizationName,
          message: `Hi ${input.name}, thank you for coming back. It means a lot.`,
        }),
        template: `loyalty-thanks:${recordId}`,
        organizationId: input.organizationId,
      });
      if (result.ok) {
        await db.from("loyalty_records").update({ thank_you_on: new Date().toISOString().slice(0, 10) }).eq("id", recordId);
      }
    }
  }
  return loyal;
}

export async function noteActivity(db: Db, clientId: string, activityOn: string, extraVisits = 0) {
  const { data } = await db.from("clients").select("visit_count, last_activity_on").eq("id", clientId).maybeSingle();
  if (!data) return { visitCount: extraVisits, lastActivityOn: activityOn };
  const last = data.last_activity_on && data.last_activity_on > activityOn ? data.last_activity_on : activityOn;
  const visitCount = Number(data.visit_count ?? 0) + extraVisits;
  await db.from("clients").update({ last_activity_on: last, visit_count: visitCount }).eq("id", clientId);
  return { visitCount, lastActivityOn: last as string };
}

export function checkInLink(token: string) {
  return `${getAppUrl()}/check-in/${token}`;
}

export async function notifyCheckInFlag(db: Db, organizationId: string, clientName: string, reply: "neutral" | "negative") {
  const { data: members } = await db.from("organization_members").select("user_id").eq("organization_id", organizationId);
  const title = "Check-in needs you";
  const message =
    reply === "negative"
      ? `${clientName} said the visit did not go well. Follow up privately. No review request was sent.`
      : `${clientName} was unsure about the visit. Follow up privately. No review request was sent.`;
  for (const member of members ?? []) {
    await db.from("notifications").insert({
      organization_id: organizationId,
      user_id: member.user_id,
      title,
      message,
      type: "warning",
    });
  }
}

export async function recordCheckInReply(db: Db, token: string, reply: "positive" | "neutral" | "negative") {
  const { data: row } = await db
    .from("check_ins")
    .select("id, organization_id, client_id, status, clients(name, email, phone)")
    .eq("reply_token", token)
    .maybeSingle();
  if (!row) return { ok: false as const, error: "missing" as const };
  if (row.status === "positive" || row.status === "neutral" || row.status === "negative") {
    return { ok: true as const, already: true as const, reply: row.status as string };
  }
  await db.from("check_ins").update({ status: reply }).eq("id", row.id);
  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
  const name = client?.name || "there";
  const email = client?.email ?? null;
  const phone = client?.phone ?? null;
  if (reply === "positive") {
    await openReviewFromCheckIn(db, {
      organizationId: row.organization_id,
      clientId: row.client_id,
      name,
      email,
      phone,
    });
  } else {
    await notifyCheckInFlag(db, row.organization_id, name, reply);
  }
  return { ok: true as const, already: false as const, reply };
}

export function reminderDate(renewsOn: string, leadDays: number) {
  return addCalendarDays(renewsOn, -leadDays);
}

export function isQuiet(lastActivityOn: string, frequencyDays: number, marginDays: number, today: string) {
  const due = addCalendarDays(lastActivityOn, frequencyDays + marginDays);
  return today > due;
}
