"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  createInvoiceSchema,
  firstZodError,
  invoiceStatusSchema,
  updateInvoiceReminderSchema,
} from "@/lib/validations";
import { linkCreatedRecord } from "@/services/record-links";
import type { Invoice } from "@/types/database";

const invoiceColumns =
  "id, organization_id, customer_name, email, phone, invoice_number, description, amount, currency, status, issued_on, due_on, next_reminder_on, notes, created_at, updated_at";

export async function listInvoices(): Promise<Invoice[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(invoiceColumns)
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Invoice[] | null) ?? [];
}

export async function createInvoice(formData: FormData) {
  const { organization } = await requireWorkspace();
  const parsed = createInvoiceSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    invoiceNumber: formData.get("invoiceNumber"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    issuedOn: formData.get("issuedOn"),
    dueOn: formData.get("dueOn"),
    nextReminderOn: formData.get("nextReminderOn"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { ok: false as const, error: firstZodError(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      organization_id: organization.id,
      customer_name: parsed.data.customerName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      invoice_number: parsed.data.invoiceNumber,
      description: parsed.data.description,
      amount: Number(parsed.data.amount),
      currency: parsed.data.currency,
      issued_on: parsed.data.issuedOn,
      due_on: parsed.data.dueOn,
      next_reminder_on: parsed.data.nextReminderOn || null,
      notes: parsed.data.notes || null,
      status: "sent",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false as const, error: "Could not add this invoice. Please try again." };
  }

  await linkCreatedRecord(formData, "orvyn", data.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/product");
  return { ok: true as const, message: "Invoice added." };
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const parsed = invoiceStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: "That status is not valid." };

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({
      status: parsed.data,
      next_reminder_on: parsed.data === "paid" || parsed.data === "void" ? null : undefined,
    })
    .eq("id", invoiceId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not update this invoice." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/product");
  return { ok: true as const, message: "Status updated." };
}

export async function updateInvoiceReminder(invoiceId: string, nextReminderOn: string) {
  const parsed = updateInvoiceReminderSchema.safeParse({ nextReminderOn });
  if (!parsed.success) return { ok: false as const, error: firstZodError(parsed.error) };

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ next_reminder_on: parsed.data.nextReminderOn || null })
    .eq("id", invoiceId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not save the reminder date." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/product");
  return { ok: true as const, message: "Reminder saved." };
}

export async function deleteInvoice(invoiceId: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not remove this invoice." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/product");
  return { ok: true as const, message: "Invoice removed." };
}
