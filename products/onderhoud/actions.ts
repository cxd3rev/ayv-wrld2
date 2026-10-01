"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { FuelType } from "@/lib/maintenance-rules";
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

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === "," || char === ";") {
      row.push(cell.trim());
      cell = "";
    } else if (char === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((item) => item.some(Boolean));
}

function csvDate(value: string) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return value;
  const local = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value);
  if (!local) return "";
  return `${local[3]}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
}

const fuelWords: Record<string, FuelType> = {
  gas: "gas",
  stookolie: "oil",
  olie: "oil",
  oil: "oil",
  "vaste brandstof": "solid_fuel",
  hout: "solid_fuel",
  pellets: "solid_fuel",
  solid_fuel: "solid_fuel",
  warmtepomp: "heat_pump",
  heat_pump: "heat_pump",
};

export async function importCustomers(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: "Kies een CSV-bestand." };
  if (file.size > 1_000_000) return { ok: false as const, error: "Het bestand is te groot." };
  const text = await file.text();
  if (text.startsWith("PK")) {
    return { ok: false as const, error: "Sla het Excel-bestand op als CSV en probeer opnieuw." };
  }
  const rows = parseCsv(text);
  const header = rows[0]?.map((value) => value.toLowerCase()) ?? [];
  const index = (names: string[]) => header.findIndex((value) => names.includes(value));
  const columns = {
    name: index(["naam", "name"]),
    email: index(["email", "e-mail"]),
    phone: index(["telefoon", "phone"]),
    street: index(["straat", "street"]),
    postal: index(["postcode", "postal_code"]),
    municipality: index(["gemeente", "municipality"]),
    fuel: index(["brandstof", "fuel"]),
    power: index(["vermogen_kw", "vermogen", "power_kw"]),
    installed: index(["geplaatst_op", "geplaatst", "installed_on"]),
    last: index(["laatste_onderhoud", "last_maintenance_on"]),
  };
  if (columns.name < 0 || columns.street < 0 || columns.postal < 0 || columns.municipality < 0 || columns.fuel < 0 || columns.power < 0 || columns.installed < 0) {
    return { ok: false as const, error: "De CSV heeft kolommen nodig: naam, straat, postcode, gemeente, brandstof, vermogen_kw, geplaatst_op." };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  let imported = 0;
  const errors: string[] = [];
  for (const [rowNumber, row] of rows.slice(1, 201).entries()) {
    const fuel = fuelWords[(row[columns.fuel] ?? "").toLowerCase()];
    const installedOn = csvDate(row[columns.installed] ?? "");
    const parsed = installationSchema.safeParse({
      name: row[columns.name] ?? "",
      email: columns.email >= 0 ? row[columns.email] ?? "" : "",
      phone: columns.phone >= 0 ? row[columns.phone] ?? "" : "",
      street: row[columns.street] ?? "",
      postalCode: columns.postal >= 0 ? row[columns.postal] ?? "" : "",
      municipality: row[columns.municipality] ?? "",
      fuel,
      powerKw: row[columns.power] ?? "",
      brand: "",
      model: "",
      installedOn,
      lastMaintenanceOn: columns.last >= 0 ? csvDate(row[columns.last] ?? "") : "",
      lastAuditOn: "",
      optionalIntervalMonths: "",
      notes: "",
    });
    if (!parsed.success) {
      errors.push(`Rij ${rowNumber + 2}: ${zodError(parsed.error)}`);
      continue;
    }
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
    if (customerError || !customer) {
      errors.push(`Rij ${rowNumber + 2}: de klant kon niet worden bewaard.`);
      continue;
    }
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
      errors.push(`Rij ${rowNumber + 2}: het adres kon niet worden bewaard.`);
      continue;
    }
    const { error: boilerError } = await supabase.from("onderhoud_boilers").insert({
      organization_id: organization.id,
      address_id: address.id,
      fuel_type: parsed.data.fuel,
      power_kw: parsed.data.powerKw,
      installed_on: parsed.data.installedOn,
      last_maintenance_on: parsed.data.lastMaintenanceOn,
    });
    if (boilerError) {
      await supabase.from("onderhoud_customers").delete().eq("id", customer.id).eq("organization_id", organization.id);
      errors.push(`Rij ${rowNumber + 2}: de ketel kon niet worden bewaard.`);
      continue;
    }
    imported += 1;
  }
  revalidatePath("/dashboard/klanten");
  revalidatePath("/dashboard");
  if (imported === 0) return { ok: false as const, error: errors[0] ?? "Er stond niets om te importeren." };
  return { ok: true as const, imported, errors: errors.slice(0, 5) };
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
