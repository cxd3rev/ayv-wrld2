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
import { normalizeEmail, sendOutreachEmail } from "@/lib/outreach-mail";
import { assertCanCreate } from "@/lib/plan-access";
import { isRecordProduct } from "@/lib/record-entities";
import { createRecordLink, linkCreatedRecord } from "@/services/record-links";
import type { Contact, ContactRelationship, Organization, Reactivation, ReactivationKind } from "@/types/database";
import { getLocale } from "next-intl/server";

const reactivationColumns =
  "id, organization_id, customer_name, email, phone, kind, status, message, incentive, last_seen_on, next_touch_on, notes, created_at, updated_at";

const contactColumns =
  "id, organization_id, name, email, phone, relationship, consent_source, consent_date, created_at, updated_at";

function plusDays(days: number) {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + days);
  return now.toISOString().slice(0, 10);
}

async function emailOutreach(opts: {
  to: string;
  kind: ReactivationKind;
  message: string;
  organization: Organization;
  locale: string;
}) {
  const subject =
    opts.kind === "winback"
      ? `${opts.organization.name} — we would like you back`
      : `${opts.organization.name} — a quick favor`;
  return sendOutreachEmail({
    to: opts.to,
    subject,
    message: opts.message,
    template: opts.kind === "winback" ? "nexro-winback" : "nexro-referral",
    organizationId: opts.organization.id,
    organizationName: opts.organization.name,
    contactEmail: opts.organization.email,
    contactPhone: opts.organization.phone,
    website: opts.organization.website,
    locale: opts.locale,
  });
}

async function loadContactByEmail(organizationId: string, email: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select(contactColumns)
    .eq("organization_id", organizationId)
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  return (data as Contact | null) ?? null;
}

async function loadContactById(organizationId: string, id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select(contactColumns)
    .eq("organization_id", organizationId)
    .eq("id", id)
    .maybeSingle();
  return (data as Contact | null) ?? null;
}

async function saveContact(opts: {
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  relationship: ContactRelationship;
  consentSource: string;
  consentDate: string;
}) {
  if (opts.relationship === "consent" && (!opts.consentSource || !opts.consentDate)) {
    return { ok: false as const, error: "Consent needs a source and a date." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .upsert(
      {
        organization_id: opts.organizationId,
        name: opts.name,
        email: normalizeEmail(opts.email),
        phone: opts.phone || null,
        relationship: opts.relationship,
        consent_source: opts.relationship === "consent" ? opts.consentSource : null,
        consent_date: opts.relationship === "consent" ? opts.consentDate : null,
      },
      { onConflict: "organization_id,email" },
    )
    .select(contactColumns)
    .single();
  if (error || !data) return { ok: false as const, error: "Could not save this contact." };
  return { ok: true as const, contact: data as Contact };
}

async function contactReadyToMail(organizationId: string, email: string, kind: ReactivationKind) {
  const contact = await loadContactByEmail(organizationId, email);
  if (!contact?.relationship) {
    return {
      ok: false as const,
      error:
        kind === "referral"
          ? "Referral emails can only go to an existing contact with a relationship."
          : "Choose existing customer or consent before sending a Nexro email.",
    };
  }
  return { ok: true as const, contact };
}

export async function saveContactRelationship(input: {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  consentSource: string;
  consentDate: string;
}) {
  if (input.relationship !== "existing_customer" && input.relationship !== "consent") {
    return { ok: false as const, error: "Choose existing customer or consent." };
  }
  if (!input.email.trim()) return { ok: false as const, error: "Add an email address on this customer first." };
  const { organization } = await requireWorkspace();
  const saved = await saveContact({
    organizationId: organization.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    relationship: input.relationship,
    consentSource: input.consentSource,
    consentDate: input.consentDate,
  });
  if (!saved.ok) return saved;
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: "Contact saved." };
}

export async function listContacts(): Promise<Contact[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select(contactColumns)
    .eq("organization_id", organization.id)
    .order("name", { ascending: true });
  if (error) return [];
  return (data as Contact[] | null) ?? [];
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
    customerName: String(formData.get("customerName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    kind: formData.get("kind"),
    message: formData.get("message"),
    incentive: formData.get("incentive"),
    lastSeenOn: formData.get("lastSeenOn"),
    nextTouchOn: formData.get("nextTouchOn"),
    notes: formData.get("notes"),
    contactId: String(formData.get("contactId") ?? ""),
    relationship: String(formData.get("relationship") ?? ""),
    consentSource: String(formData.get("consentSource") ?? ""),
    consentDate: String(formData.get("consentDate") ?? ""),
  });

  if (!parsed.success) return { ok: false as const, error: firstZodError(parsed.error) };

  const send = formData.get("intent") === "send";
  const locale = await getLocale();
  let customerName = parsed.data.customerName;
  let email = parsed.data.email;
  let phone = parsed.data.phone;

  if (parsed.data.kind === "referral") {
    if (!parsed.data.contactId) {
      return { ok: false as const, error: "Choose an existing contact for a referral. Do not enter a new address." };
    }
    const contact = await loadContactById(organization.id, parsed.data.contactId);
    if (!contact?.relationship) {
      return { ok: false as const, error: "Referral emails can only go to an existing contact with a relationship." };
    }
    customerName = contact.name;
    email = contact.email;
    phone = contact.phone ?? "";
  } else if (send) {
    if (!email) return { ok: false as const, error: "Add an email address to send this." };
    if (parsed.data.relationship !== "existing_customer" && parsed.data.relationship !== "consent") {
      return { ok: false as const, error: "Choose existing customer or consent before sending a Nexro email." };
    }
    const saved = await saveContact({
      organizationId: organization.id,
      name: customerName,
      email,
      phone,
      relationship: parsed.data.relationship,
      consentSource: parsed.data.consentSource,
      consentDate: parsed.data.consentDate,
    });
    if (!saved.ok) return saved;
  }

  const gate = await assertCanCreate(organization, "nexro");
  if (!gate.ok) return gate;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reactivations")
    .insert({
      organization_id: organization.id,
      customer_name: customerName,
      email: email || null,
      phone: phone || null,
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

  if (send && email) {
    const ready = await contactReadyToMail(organization.id, email, parsed.data.kind);
    if (!ready.ok) return ready;
    const delivered = await emailOutreach({
      to: email,
      kind: parsed.data.kind,
      message: parsed.data.message,
      organization,
      locale,
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
  relationship: string;
  consentSource: string;
  consentDate: string;
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
  const locale = await getLocale();
  if (parsed.data.kind === "referral") {
    const ready = await contactReadyToMail(organization.id, parsed.data.email, "referral");
    if (!ready.ok) return ready;
  } else {
    if (input.relationship !== "existing_customer" && input.relationship !== "consent") {
      return { ok: false as const, error: "Choose existing customer or consent before sending a Nexro email." };
    }
    const saved = await saveContact({
      organizationId: organization.id,
      name: parsed.data.customerName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      relationship: input.relationship,
      consentSource: input.consentSource,
      consentDate: input.consentDate,
    });
    if (!saved.ok) return saved;
  }
  const gate = await assertCanCreate(organization, "nexro");
  if (!gate.ok) return gate;
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
    organization,
    locale,
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
  const ready = await contactReadyToMail(organization.id, row.email, row.kind);
  if (!ready.ok) return ready;
  const locale = await getLocale();

  const delivered = await emailOutreach({
    to: row.email,
    kind: row.kind,
    message: row.message,
    organization,
    locale,
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
