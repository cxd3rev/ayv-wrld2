import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  dueWindow,
  nextAuditDue,
  nextMaintenanceDue,
  type BoilerScheduleInput,
  type DueWindow,
  type FuelType,
} from "@/lib/maintenance-rules";

export type BoilerListItem = {
  id: string;
  customerName: string;
  email: string | null;
  municipality: string;
  street: string;
  fuel: FuelType;
  powerKw: number;
  brand: string | null;
  model: string | null;
  installedOn: string;
  lastMaintenanceOn: string | null;
  lastAuditOn: string | null;
  optionalIntervalMonths: number | null;
  notes: string | null;
  nextMaintenance: string | null;
  nextAudit: string | null;
  maintenanceWindow: DueWindow | null;
  auditWindow: DueWindow | null;
};

type AddressRow = {
  street: string;
  postal_code: string;
  municipality: string;
  onderhoud_customers: { name: string; email: string | null } | { name: string; email: string | null }[] | null;
};

type BoilerRow = {
  id: string;
  fuel_type: FuelType;
  power_kw: number | string;
  brand: string | null;
  model: string | null;
  installed_on: string;
  last_maintenance_on: string | null;
  last_audit_on: string | null;
  optional_interval_months: number | null;
  notes: string | null;
  onderhoud_addresses: AddressRow | AddressRow[] | null;
};

function one<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function scheduleOf(row: BoilerRow): BoilerScheduleInput {
  return {
    fuel: row.fuel_type,
    powerKw: Number(row.power_kw),
    installedOn: row.installed_on,
    lastMaintenanceOn: row.last_maintenance_on,
    lastAuditOn: row.last_audit_on,
    optionalIntervalMonths: row.optional_interval_months,
  };
}

export function toBoilerListItem(row: BoilerRow, today: string): BoilerListItem | null {
  const address = one(row.onderhoud_addresses);
  const customer = one(address?.onderhoud_customers);
  if (!address || !customer) return null;
  const schedule = scheduleOf(row);
  const nextMaintenance = nextMaintenanceDue(schedule);
  const nextAudit = nextAuditDue(schedule);
  return {
    id: row.id,
    customerName: customer.name,
    email: customer.email,
    municipality: address.municipality,
    street: address.street,
    fuel: row.fuel_type,
    powerKw: Number(row.power_kw),
    brand: row.brand,
    model: row.model,
    installedOn: row.installed_on,
    lastMaintenanceOn: row.last_maintenance_on,
    lastAuditOn: row.last_audit_on,
    optionalIntervalMonths: row.optional_interval_months,
    notes: row.notes,
    nextMaintenance,
    nextAudit,
    maintenanceWindow: dueWindow(nextMaintenance, today),
    auditWindow: dueWindow(nextAudit, today),
  };
}

const boilerSelect =
  "id, fuel_type, power_kw, brand, model, installed_on, last_maintenance_on, last_audit_on, optional_interval_months, notes, onderhoud_addresses(street, postal_code, municipality, onderhoud_customers(name, email))";

export async function listBoilers(organizationId: string, today: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("onderhoud_boilers")
    .select(boilerSelect)
    .eq("organization_id", organizationId)
    .order("installed_on", { ascending: true });
  return ((data as BoilerRow[] | null) ?? [])
    .map((row) => toBoilerListItem(row, today))
    .filter((row): row is BoilerListItem => Boolean(row));
}

export async function listCustomers(organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("onderhoud_customers")
    .select("id, name, email, phone, onderhoud_addresses(id, street, postal_code, municipality, onderhoud_boilers(id, fuel_type, power_kw, brand, model))")
    .eq("organization_id", organizationId)
    .order("name");
  return data ?? [];
}

export async function getReminderLeadDays(organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("onderhoud_settings")
    .select("reminder_lead_days")
    .eq("organization_id", organizationId)
    .maybeSingle();
  return data?.reminder_lead_days ?? 30;
}
