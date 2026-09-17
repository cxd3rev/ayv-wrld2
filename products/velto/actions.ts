"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  bookingStatusSchema,
  createBookingSchema,
  firstZodError,
  updateBookingReminderSchema,
} from "@/lib/validations";
import type { Booking } from "@/types/database";

const bookingColumns =
  "id, organization_id, customer_name, email, phone, service, starts_on, start_time, status, reminder_on, notes, created_at, updated_at";

export async function listBookings(): Promise<Booking[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(bookingColumns)
    .eq("organization_id", organization.id)
    .order("starts_on", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return [];
  }

  return (data as Booking[] | null) ?? [];
}

export async function createBooking(formData: FormData) {
  const { organization } = await requireWorkspace();
  const parsed = createBookingSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    service: formData.get("service"),
    startsOn: formData.get("startsOn"),
    startTime: formData.get("startTime"),
    reminderOn: formData.get("reminderOn"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert({
    organization_id: organization.id,
    customer_name: parsed.data.customerName,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    service: parsed.data.service,
    starts_on: parsed.data.startsOn,
    start_time: parsed.data.startTime,
    reminder_on: parsed.data.reminderOn || null,
    notes: parsed.data.notes || null,
    status: "scheduled",
  });

  if (error) {
    return { ok: false, error: "Could not add this booking. Please try again." };
  }

  revalidatePath("/dashboard/product");
  return { ok: true, message: "Booking added." };
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const parsed = bookingStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false, error: "That status is not valid." };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data })
    .eq("id", bookingId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not update this booking." };
  }

  revalidatePath("/dashboard/product");
  return { ok: true, message: "Status updated." };
}

export async function updateBookingReminder(bookingId: string, reminderOn: string) {
  const parsed = updateBookingReminderSchema.safeParse({ reminderOn });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ reminder_on: parsed.data.reminderOn || null })
    .eq("id", bookingId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not save the reminder date." };
  }

  revalidatePath("/dashboard/product");
  return { ok: true, message: "Reminder date saved." };
}

export async function deleteBooking(bookingId: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not remove this booking." };
  }

  revalidatePath("/dashboard/product");
  return { ok: true, message: "Booking removed." };
}
