"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  addressSchema,
  boilerSchema,
  customerSchema,
  installationSchema,
  reminderSettingsSchema,
  slotSchema,
  visitSchema,
  zodError,
} from "@/lib/onderhoud/schemas";
import { z } from "zod";

function formObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createInstallation(formData: FormData) {
  const parsed = installationSchema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data: customer, error: customerError } = await supabase
    .from("onderhoud_customers")
    .insert({
      organization_id: organization.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    })
    .select("id")
    .single();
  if (customerError || !customer) return { ok: false as const, error: "De klant kon niet worden bewaard." };

  const { data: address, error: addressError } = await supabase
    .from("onderhoud_addresses")
    .insert({
      organization_id: organization.id,
      customer_id: customer.id,
      street: parsed.data.street,
      postal_code: parsed.data.postalCode,
      municipality: parsed.data.municipality,
    })
    .select("id")
    .single();
  if (addressError || !address) {
    await supabase.from("onderhoud_customers").delete().eq("id", customer.id).eq("organization_id", organization.id);
    return { ok: false as const, error: "Het adres kon niet worden bewaard." };
  }

  const { error: boilerError } = await supabase.from("onderhoud_boilers").insert({
    organization_id: organization.id,
    address_id: address.id,
    fuel_type: parsed.data.fuel,
    power_kw: parsed.data.powerKw,
    brand: parsed.data.brand,
    model: parsed.data.model,
    installed_on: parsed.data.installedOn,
    last_maintenance_on: parsed.data.lastMaintenanceOn,
    last_audit_on: parsed.data.lastAuditOn,
    optional_interval_months: parsed.data.optionalIntervalMonths,
    notes: parsed.data.notes,
  });
  if (boilerError) {
    await supabase.from("onderhoud_customers").delete().eq("id", customer.id).eq("organization_id", organization.id);
    return { ok: false as const, error: "De ketel kon niet worden bewaard." };
  }

  revalidatePath("/dashboard/klanten");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function createCustomer(formData: FormData) {
  const parsed = customerSchema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("onderhoud_customers").insert({
    organization_id: organization.id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
  });
  if (error) return { ok: false as const, error: "De klant kon niet worden bewaard." };
  revalidatePath("/dashboard/klanten");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function createAddress(formData: FormData) {
  const parsed = addressSchema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("onderhoud_addresses").insert({
    organization_id: organization.id,
    customer_id: parsed.data.customerId,
    street: parsed.data.street,
    postal_code: parsed.data.postalCode,
    municipality: parsed.data.municipality,
  });
  if (error) return { ok: false as const, error: "Het adres kon niet worden bewaard." };
  revalidatePath("/dashboard/klanten");
  return { ok: true as const };
}

export async function createBoiler(formData: FormData) {
  const parsed = boilerSchema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("onderhoud_boilers").insert({
    organization_id: organization.id,
    address_id: parsed.data.addressId,
    fuel_type: parsed.data.fuel,
    power_kw: parsed.data.powerKw,
    brand: parsed.data.brand,
    model: parsed.data.model,
    installed_on: parsed.data.installedOn,
    last_maintenance_on: parsed.data.lastMaintenanceOn,
    last_audit_on: parsed.data.lastAuditOn,
    optional_interval_months: parsed.data.optionalIntervalMonths,
    notes: parsed.data.notes,
  });
  if (error) return { ok: false as const, error: "De ketel kon niet worden bewaard." };
  revalidatePath("/dashboard/klanten");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function saveReminderSettings(formData: FormData) {
  const parsed = reminderSettingsSchema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("onderhoud_settings").upsert({
    organization_id: organization.id,
    reminder_lead_days: parsed.data.reminderLeadDays,
  });
  if (error) return { ok: false as const, error: "De instelling kon niet worden bewaard." };
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}

export async function createSlot(formData: FormData) {
  const parsed = slotSchema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const starts = new Date(parsed.data.startsAt);
  const ends = new Date(parsed.data.endsAt);
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
    return { ok: false as const, error: "Vul een geldig uur in." };
  }
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("onderhoud_slots").insert({
    organization_id: organization.id,
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
  });
  if (error) return { ok: false as const, error: "Het tijdslot kon niet worden bewaard." };
  revalidatePath("/dashboard/afspraken");
  return { ok: true as const };
}

const certificateTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export async function recordVisit(formData: FormData) {
  const parsed = visitSchema.safeParse({
    boilerId: formData.get("boilerId"),
    visitedOn: formData.get("visitedOn"),
    notes: formData.get("notes") ?? "",
    includesAudit: formData.get("includesAudit") === "on",
  });
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const file = formData.get("certificate");
  const upload = file instanceof File && file.size > 0 ? file : null;
  if (upload && (!certificateTypes.has(upload.type) || upload.size > 10 * 1024 * 1024)) {
    return { ok: false as const, error: "Gebruik een PDF of foto van hoogstens 10 MB." };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data: boiler } = await supabase
    .from("onderhoud_boilers")
    .select("id, last_maintenance_on, last_audit_on")
    .eq("id", parsed.data.boilerId)
    .eq("organization_id", organization.id)
    .maybeSingle();
  if (!boiler) return { ok: false as const, error: "Deze ketel hoort niet bij dit bedrijf." };

  const visitId = crypto.randomUUID();
  let certificatePath: string | null = null;
  if (upload) {
    const safeName = upload.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "attest";
    certificatePath = `${organization.id}/${visitId}/${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(certificatePath, Buffer.from(await upload.arrayBuffer()), {
        contentType: upload.type,
        upsert: false,
      });
    if (uploadError) return { ok: false as const, error: "Het attest kon niet worden opgeladen." };
  }

  const { error } = await supabase.from("onderhoud_visits").insert({
    id: visitId,
    organization_id: organization.id,
    boiler_id: parsed.data.boilerId,
    visited_on: parsed.data.visitedOn,
    notes: parsed.data.notes,
    certificate_path: certificatePath,
  });
  if (error) return { ok: false as const, error: "Het bezoek kon niet worden bewaard." };

  const lastMaintenance =
    !boiler.last_maintenance_on || parsed.data.visitedOn > boiler.last_maintenance_on
      ? parsed.data.visitedOn
      : boiler.last_maintenance_on;
  const lastAudit =
    parsed.data.includesAudit && (!boiler.last_audit_on || parsed.data.visitedOn > boiler.last_audit_on)
      ? parsed.data.visitedOn
      : boiler.last_audit_on;
  await supabase
    .from("onderhoud_boilers")
    .update({ last_maintenance_on: lastMaintenance, last_audit_on: lastAudit })
    .eq("id", boiler.id)
    .eq("organization_id", organization.id);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/ketels/${boiler.id}`);
  return { ok: true as const };
}

export async function deleteSlot(id: string) {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false as const, error: "Onbekend tijdslot." };
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("onderhoud_slots").delete().eq("id", parsed.data).eq("organization_id", organization.id);
  if (error) return { ok: false as const, error: "Het tijdslot kon niet worden verwijderd. Er staat misschien al een afspraak op." };
  revalidatePath("/dashboard/afspraken");
  return { ok: true as const };
}
