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
import { linkCreatedRecord } from "@/services/record-links";
import type { Reactivation } from "@/types/database";

const reactivationColumns =
  "id, organization_id, customer_name, email, phone, kind, status, message, incentive, last_seen_on, next_touch_on, notes, created_at, updated_at";

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
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: "Outreach added." };
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
