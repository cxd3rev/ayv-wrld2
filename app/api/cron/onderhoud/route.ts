import { legacyModulesEnabled } from "@/config/features";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDays, nextAuditDue, nextMaintenanceDue, type FuelType } from "@/lib/maintenance-rules";
import { getAppUrl } from "@/lib/utils";
import { followUpEmail, sendEmail } from "@/services/email";

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
  organizations: { name: string; slug: string } | { name: string; slug: string }[] | null;
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
    "id, organization_id, fuel_type, power_kw, installed_on, last_maintenance_on, last_audit_on, optional_interval_months, organizations(name, slug), onderhoud_addresses(street, postal_code, municipality, onderhoud_customers(name, email))",
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
      const link = `${getAppUrl()}/boek/${organization.slug}`;
      const what = item.kind === "audit" ? "verwarmingsaudit" : "onderhoud";
      const result = await sendEmail({
        to: email,
        subject: `Herinnering ${what} — ${organization.name}`,
        html: followUpEmail({
          organizationName: organization.name,
          message: `Dag ${customer.name}, het ${what} van de ketel in ${address.street}, ${address.municipality} staat gepland op ${item.due}. Kies een moment: ${link}`,
        }),
        template,
        organizationId: row.organization_id,
      });
      if (result.ok) sent += 1;
      else skipped += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
