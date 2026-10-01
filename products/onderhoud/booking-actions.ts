"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { bookingSchema, zodError } from "@/lib/onderhoud/schemas";
import { revalidatePath } from "next/cache";

export async function bookSlot(slug: string, formData: FormData) {
  const parsed = bookingSchema.safeParse({
    slotId: formData.get("slotId"),
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };

  const admin = createAdminClient();
  const { data: organization } = await admin.from("organizations").select("id").eq("slug", slug).maybeSingle();
  if (!organization) return { ok: false as const, error: "Dit bedrijf werd niet gevonden." };

  const { data: slot } = await admin
    .from("onderhoud_slots")
    .select("id, starts_at")
    .eq("id", parsed.data.slotId)
    .eq("organization_id", organization.id)
    .maybeSingle();
  if (!slot || new Date(slot.starts_at).getTime() <= Date.now()) {
    return { ok: false as const, error: "Dit tijdslot is niet meer open." };
  }

  const { data: taken } = await admin.from("onderhoud_bookings").select("id").eq("slot_id", slot.id).maybeSingle();
  if (taken) return { ok: false as const, error: "Dit tijdslot is al gekozen." };

  const { error } = await admin.from("onderhoud_bookings").insert({
    organization_id: organization.id,
    slot_id: slot.id,
    customer_name: parsed.data.customerName,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone,
  });
  if (error) return { ok: false as const, error: "De afspraak kon niet worden bewaard." };
  revalidatePath("/dashboard/afspraken");
  return { ok: true as const };
}
