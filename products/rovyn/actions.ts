"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  createQuoteSchema,
  firstZodError,
  quoteStatusSchema,
  updateQuoteFollowUpSchema,
} from "@/lib/validations";
import { linkCreatedRecord } from "@/services/record-links";
import type { Quote } from "@/types/database";

const quoteColumns =
  "id, organization_id, customer_name, email, phone, title, amount, status, follow_up_on, notes, created_at, updated_at";

export async function listQuotes(): Promise<Quote[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(quoteColumns)
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as Quote[] | null) ?? [];
}

export async function createQuote(formData: FormData) {
  const { organization } = await requireWorkspace();
  const parsed = createQuoteSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    title: formData.get("title"),
    amount: formData.get("amount"),
    notes: formData.get("notes"),
    followUpOn: formData.get("followUpOn"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      organization_id: organization.id,
      customer_name: parsed.data.customerName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      title: parsed.data.title,
      amount: parsed.data.amount ? Number(parsed.data.amount) : null,
      notes: parsed.data.notes || null,
      follow_up_on: parsed.data.followUpOn || null,
      status: "sent",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not add this quote. Please try again." };
  }

  await linkCreatedRecord(formData, "rovyn", data.id);
  revalidatePath("/dashboard/product");
  return { ok: true, message: "Quote added." };
}

export async function updateQuoteStatus(quoteId: string, status: string) {
  const parsed = quoteStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false, error: "That status is not valid." };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({ status: parsed.data })
    .eq("id", quoteId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not update this quote." };
  }

  revalidatePath("/dashboard/product");
  return { ok: true, message: "Status updated." };
}

export async function updateQuoteFollowUp(quoteId: string, followUpOn: string) {
  const parsed = updateQuoteFollowUpSchema.safeParse({ followUpOn });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({ follow_up_on: parsed.data.followUpOn || null })
    .eq("id", quoteId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not save the follow-up date." };
  }

  revalidatePath("/dashboard/product");
  return { ok: true, message: "Follow-up date saved." };
}

export async function deleteQuote(quoteId: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", quoteId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not remove this quote." };
  }

  revalidatePath("/dashboard/product");
  return { ok: true, message: "Quote removed." };
}
