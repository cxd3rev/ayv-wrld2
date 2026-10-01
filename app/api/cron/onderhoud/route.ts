import { legacyModulesEnabled } from "@/config/features";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuppressed } from "@/lib/outreach-mail";
import { signUnsubscribeToken } from "@/lib/unsubscribe-token";
import { addDays, maintenanceIsLegallyRequired, nextAuditDue, nextMaintenanceDue, type FuelType } from "@/lib/maintenance-rules";
import { getAppUrl } from "@/lib/utils";
import { maintenanceReminderHtml, sendEmail } from "@/services/email";

export const runtime = "nodejs";

function brusselsToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date());
}

async function alreadySent(template: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("email_events").select("id").eq("template", template).eq("status", "sent").limit(1);
  return Boolean(data && data.length > 0);
}

type AddressJoin = {
  street: string;
  postal_code: string;
  municipality: string;
  onderhoud_customers: { name: string; email: string | null } | { name: string; email: string | null }[] | null;
};

type BoilerJoin = {
  id: string;
  organization_id: string;
  fuel_type: FuelType;
  power_kw: number | string;
  installed_on: string;
  last_maintenance_on: string | null;
  last_audit_on: string | null;
  optional_interval_months: number | null;
  organizations: { name: string; slug: string; phone: string | null } | { name: string; slug: string; phone: string | null }[] | null;
  onderhoud_addresses: AddressJoin | AddressJoin[] | null;
};

function one<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function GET(request: Request) {
  if (legacyModulesEnabled) {
    return NextResponse.json({ ok: true, skipped: "legacy-modules-on" });
  }
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron is not configured." }, { status: 501 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = brusselsToday();
  const { data: settings } = await admin.from("onderhoud_settings").select("organization_id, reminder_lead_days");
  const leadDays = new Map((settings ?? []).map((row) => [row.organization_id as string, row.reminder_lead_days as number]));
  const { data: boilers } = await admin.from("onderhoud_boilers").select(
    "id, organization_id, fuel_type, power_kw, installed_on, last_maintenance_on, last_audit_on, optional_interval_months, organizations(name, slug, phone), onderhoud_addresses(street, postal_code, municipality, onderhoud_customers(name, email))",
  );

  let sent = 0;
  let skipped = 0;
  for (const row of (boilers ?? []) as BoilerJoin[]) {
    const organization = one(row.organizations);
    const address = one(row.onderhoud_addresses);
    const customer = one(address?.onderhoud_customers ?? null);
    const email = customer?.email?.trim();
    if (!organization || !address || !customer || !email) {
      skipped += 1;
      continue;
    }
    const schedule = {
      fuel: row.fuel_type,
      powerKw: Number(row.power_kw),
      installedOn: row.installed_on,
      lastMaintenanceOn: row.last_maintenance_on,
      lastAuditOn: row.last_audit_on,
      optionalIntervalMonths: row.optional_interval_months,
    };
    const lead = leadDays.get(row.organization_id) ?? 30;
    const target = addDays(today, lead);
    const dues = [
      { kind: "onderhoud", due: nextMaintenanceDue(schedule) },
      { kind: "audit", due: nextAuditDue(schedule) },
    ];
    for (const item of dues) {
      if (item.due !== target) continue;
      const template = `onderhoud:${item.kind}:${row.id}:${item.due}`;
      if (await alreadySent(template)) {
        skipped += 1;
        continue;
      }
      const suppressed = await isSuppressed(row.organization_id, email);
      if (!suppressed.ok || suppressed.suppressed) {
        skipped += 1;
        continue;
      }
      const token = signUnsubscribeToken({ organizationId: row.organization_id, email, locale: "nl" });
      if (!token) {
        skipped += 1;
        continue;
      }
      const fuelWord: Record<FuelType, string> = {
        gas: "gas",
        oil: "stookolie",
        solid_fuel: "vaste brandstof",
        heat_pump: "warmtepomp",
      };
      const appliance = row.fuel_type === "heat_pump" ? "warmtepomp" : `${fuelWord[row.fuel_type]}ketel`;
      const dueLabel = new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(`${item.due}T00:00:00Z`),
      );
      const result = await sendEmail({
        to: email,
        subject: "Tijd voor het onderhoud van je ketel",
        html: maintenanceReminderHtml({
          customerName: customer.name,
          appliance: item.kind === "audit" ? `${appliance} (verwarmingsaudit)` : appliance,
          address: `${address.street}, ${address.postal_code} ${address.municipality}`,
          dueLabel,
          bookingUrl: `${getAppUrl()}/boek/${organization.slug}`,
          installerName: organization.name,
          installerPhone: organization.phone ?? "",
          unsubscribeUrl: `${getAppUrl()}/unsubscribe?token=${token}`,
          legallyRequired: item.kind === "audit" || maintenanceIsLegallyRequired(row.fuel_type, Number(row.power_kw)),
        }),
        headers: { "List-Unsubscribe": `<${getAppUrl()}/unsubscribe?token=${token}>` },
        template,
        organizationId: row.organization_id,
      });
      if (result.ok) sent += 1;
      else skipped += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
