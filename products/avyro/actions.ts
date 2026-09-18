"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  createLeadSchema,
  firstZodError,
  leadStatusSchema,
  updateLeadFollowUpSchema,
} from "@/lib/validations";
import { linkCreatedRecord } from "@/services/record-links";
import type { Lead } from "@/types/database";

export async function listLeads(): Promise<Lead[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, organization_id, name, email, phone, status, notes, follow_up_on, created_at, updated_at",
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as Lead[] | null) ?? [];
}

export async function createLead(formData: FormData) {
  const { organization } = await requireWorkspace();
  const parsed = createLeadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
    followUpOn: formData.get("followUpOn"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      organization_id: organization.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
      follow_up_on: parsed.data.followUpOn || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not add this lead. Please try again." };
  }

  await linkCreatedRecord(formData, "avyro", data.id);
  revalidatePath("/dashboard/avyro");
  return { ok: true, message: "Lead added." };
}

export async function updateLeadStatus(leadId: string, status: string) {
  const parsed = leadStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false, error: "That status is not valid." };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data })
    .eq("id", leadId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not update this lead." };
  }

  revalidatePath("/dashboard/avyro");
  return { ok: true, message: "Status updated." };
}

export async function updateLeadFollowUp(leadId: string, followUpOn: string) {
  const parsed = updateLeadFollowUpSchema.safeParse({ followUpOn });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ follow_up_on: parsed.data.followUpOn || null })
    .eq("id", leadId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not save the follow-up date." };
  }

  revalidatePath("/dashboard/avyro");
  return { ok: true, message: "Follow-up date saved." };
}
