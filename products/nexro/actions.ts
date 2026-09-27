"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  createReactivationSchema,
  firstZodError,
  reactivationStatusSchema,
  updateReactivationTouchSchema,
} from "@/lib/validations";
import { nexroOutreachCopy } from "@/lib/nexro-customers";
import { isRecordProduct } from "@/lib/record-entities";
import { nexroOutreachEmail, sendEmail } from "@/services/email";
import { createRecordLink, linkCreatedRecord } from "@/services/record-links";
import type { Reactivation, ReactivationKind } from "@/types/database";

const reactivationColumns =
  "id, organization_id, customer_name, email, phone, kind, status, message, incentive, last_seen_on, next_touch_on, notes, created_at, updated_at";

function plusDays(days: number) {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + days);
  return now.toISOString().slice(0, 10);
}

async function emailOutreach(opts: {
  to: string;
  kind: ReactivationKind;
  message: string;
  organizationId: string;
  organizationName: string;
}) {
  const subject =
    opts.kind === "winback"
      ? `${opts.organizationName} — we would like you back`
      : `${opts.organizationName} — a quick favor`;
  return sendEmail({
    to: opts.to,
    subject,
    html: nexroOutreachEmail({ organizationName: opts.organizationName, message: opts.message }),
    template: opts.kind === "winback" ? "nexro-winback" : "nexro-referral",
    organizationId: opts.organizationId,
  });
}

export async function listReactivations(): Promise<Reactivation[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reactivations")
    .select(reactivationColumns)
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Reactivation[] | null) ?? [];
}

export async function createReactivation(formData: FormData) {
  const { organization } = await requireWorkspace();
  const parsed = createReactivationSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    kind: formData.get("kind"),
    message: formData.get("message"),
    incentive: formData.get("incentive"),
    lastSeenOn: formData.get("lastSeenOn"),
    nextTouchOn: formData.get("nextTouchOn"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { ok: false as const, error: firstZodError(parsed.error) };

  const send = formData.get("intent") === "send";
  if (send && !parsed.data.email) {
    return { ok: false as const, error: "Add an email address to send this." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reactivations")
    .insert({
      organization_id: organization.id,
      customer_name: parsed.data.customerName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      kind: parsed.data.kind,
      message: parsed.data.message,
      incentive: parsed.data.incentive || null,
      last_seen_on: parsed.data.lastSeenOn || null,
      next_touch_on: parsed.data.nextTouchOn || null,
      notes: parsed.data.notes || null,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false as const, error: "Could not add this outreach. Please try again." };
  }

  await linkCreatedRecord(formData, "nexro", data.id);

  if (send && parsed.data.email) {
    const delivered = await emailOutreach({
      to: parsed.data.email,
      kind: parsed.data.kind,
      message: parsed.data.message,
      organizationId: organization.id,
      organizationName: organization.name,
    });
    if (!delivered.ok) {
      revalidatePath("/dashboard/nexro");
      return { ok: false as const, error: "Saved, but the email could not be sent." };
    }
    await supabase
      .from("reactivations")
      .update({
        status: "sent",
        next_touch_on: parsed.data.nextTouchOn || plusDays(7),
      })
      .eq("id", data.id)
      .eq("organization_id", organization.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/nexro");
  return {
    ok: true as const,
    sent: send,
    message: send ? "Email sent." : "Outreach added.",
  };
}

export async function startNexroOutreach(input: {
  customerName: string;
  email: string;
  phone: string;
  kind: ReactivationKind;
  offer: string;
  incentive: string;
  lastSeenOn: string;
  linkProduct: string;
  linkId: string;
}) {
  const parsed = createReactivationSchema.safeParse({
    customerName: input.customerName,
    email: input.email,
    phone: input.phone,
    kind: input.kind,
    message: "placeholder",
    incentive: input.incentive,
    lastSeenOn: input.lastSeenOn,
    nextTouchOn: "",
    notes: "",
  });
  if (!parsed.success) return { ok: false as const, error: firstZodError(parsed.error) };
  if (!parsed.data.email) {
    return { ok: false as const, error: "Add an email address on this customer before sending." };
  }

  const { organization } = await requireWorkspace();
  const message = nexroOutreachCopy({
    kind: parsed.data.kind,
    name: parsed.data.customerName,
    organizationName: organization.name,
    offer: input.offer,
    incentive: parsed.data.incentive,
  });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reactivations")
    .insert({
      organization_id: organization.id,
      customer_name: parsed.data.customerName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      kind: parsed.data.kind,
      message,
      incentive: parsed.data.incentive || null,
      last_seen_on: parsed.data.lastSeenOn || null,
      next_touch_on: plusDays(7),
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false as const, error: "Could not start this outreach." };
  }

  if (isRecordProduct(input.linkProduct) && input.linkId) {
    await createRecordLink("nexro", data.id, input.linkProduct, input.linkId);
  }

  const delivered = await emailOutreach({
    to: parsed.data.email,
    kind: parsed.data.kind,
    message,
    organizationId: organization.id,
    organizationName: organization.name,
  });
  if (!delivered.ok) {
    revalidatePath("/dashboard/nexro");
    return { ok: false as const, error: "Saved, but the email could not be sent." };
  }

  await supabase
    .from("reactivations")
    .update({ status: "sent" })
    .eq("id", data.id)
    .eq("organization_id", organization.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, sent: true, message: "Email sent." };
}

export async function sendSavedReactivation(reactivationId: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reactivations")
    .select(reactivationColumns)
    .eq("id", reactivationId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  const row = data as Reactivation | null;
  if (error || !row) return { ok: false as const, error: "Could not find this outreach." };
  if (!row.email) return { ok: false as const, error: "Add an email address before sending." };
  if (row.status === "won" || row.status === "passed") {
    return { ok: false as const, error: "This outreach is already finished." };
  }

  const delivered = await emailOutreach({
    to: row.email,
    kind: row.kind,
    message: row.message,
    organizationId: organization.id,
    organizationName: organization.name,
  });
  if (!delivered.ok) return { ok: false as const, error: delivered.error ?? "Could not send email." };

  await supabase
    .from("reactivations")
    .update({
      status: "sent",
      next_touch_on: row.next_touch_on || plusDays(7),
    })
    .eq("id", row.id)
    .eq("organization_id", organization.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, sent: true, message: "Email sent." };
}

export async function updateReactivationStatus(reactivationId: string, status: string) {
  const parsed = reactivationStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: "That status is not valid." };

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reactivations")
    .update({
      status: parsed.data,
      next_touch_on: parsed.data === "won" || parsed.data === "passed" ? null : undefined,
    })
    .eq("id", reactivationId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not update this outreach." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: "Status updated." };
}

export async function updateReactivationTouch(reactivationId: string, nextTouchOn: string) {
  const parsed = updateReactivationTouchSchema.safeParse({ nextTouchOn });
  if (!parsed.success) return { ok: false as const, error: firstZodError(parsed.error) };

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reactivations")
    .update({ next_touch_on: parsed.data.nextTouchOn || null })
    .eq("id", reactivationId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not save the next touch date." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: "Next touch saved." };
}

export async function deleteReactivation(reactivationId: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reactivations")
    .delete()
    .eq("id", reactivationId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not remove this outreach." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: "Outreach removed." };
}
