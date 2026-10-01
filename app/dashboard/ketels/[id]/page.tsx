import { VisitForm } from "@/components/onderhoud/visit-form";
import { formatIsoDate, fuelLabels } from "@/lib/onderhoud/labels";
import { requireWorkspace } from "@/lib/auth/session";
import { nextAuditDue, nextMaintenanceDue, type FuelType } from "@/lib/maintenance-rules";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return { alternates: { canonical: `/dashboard/ketels/${id}` } };
}

export default async function BoilerPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("onderhoud_boilers")
    .select("id, fuel_type, power_kw, brand, model, installed_on, last_maintenance_on, last_audit_on, optional_interval_months, notes, onderhoud_addresses(street, municipality, onderhoud_customers(name))")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .maybeSingle();
  if (!data) notFound();

  const address = Array.isArray(data.onderhoud_addresses) ? data.onderhoud_addresses[0] : data.onderhoud_addresses;
  const customer = address ? (Array.isArray(address.onderhoud_customers) ? address.onderhoud_customers[0] : address.onderhoud_customers) : null;
  const schedule = {
    fuel: data.fuel_type as FuelType,
    powerKw: Number(data.power_kw),
    installedOn: data.installed_on,
    lastMaintenanceOn: data.last_maintenance_on,
    lastAuditOn: data.last_audit_on,
    optionalIntervalMonths: data.optional_interval_months,
  };
  const { data: visits } = await supabase
    .from("onderhoud_visits")
    .select("id, visited_on, notes, certificate_path")
    .eq("boiler_id", id)
    .eq("organization_id", organization.id)
    .order("visited_on", { ascending: false });

  const signed = await Promise.all(
    (visits ?? []).map(async (visit) => {
      if (!visit.certificate_path) return { ...visit, url: null as string | null };
      const file = await supabase.storage.from("certificates").createSignedUrl(visit.certificate_path, 60 * 10);
      return { ...visit, url: file.data?.signedUrl ?? null };
    }),
  );

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">Terug naar onderhoud</Link>
      <p className="mt-4 text-sm text-muted">{customer?.name} · {address?.street}, {address?.municipality}</p>
      <h1 className="display mt-2 text-4xl">
        {fuelLabels[schedule.fuel]} · {schedule.powerKw} kW
      </h1>
      <p className="mt-2 text-muted">{[data.brand, data.model].filter(Boolean).join(" ") || "Merk en model niet ingevuld"}</p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="workspace-card p-4"><dt className="text-xs uppercase tracking-[0.14em] text-muted">Volgend onderhoud</dt><dd className="mt-2 text-lg">{formatIsoDate(nextMaintenanceDue(schedule)) || "Geen verplichting"}</dd></div>
        <div className="workspace-card p-4"><dt className="text-xs uppercase tracking-[0.14em] text-muted">Volgende audit</dt><dd className="mt-2 text-lg">{formatIsoDate(nextAuditDue(schedule)) || "Niet van toepassing"}</dd></div>
      </dl>
      {data.notes ? <p className="mt-4 text-sm">{data.notes}</p> : null}
      <div className="mt-8 max-w-xl">
        <h2 className="text-lg font-medium">Bezoek bewaren</h2>
        <p className="mt-1 mb-4 text-sm text-muted">De datum van dit bezoek wordt het laatste onderhoud. Vink de audit aan als die mee is uitgevoerd.</p>
        <VisitForm boilerId={id} />
      </div>
      <h2 className="mt-10 text-lg font-medium">Vorige bezoeken</h2>
      <ul className="mt-4 space-y-3">
        {signed.length === 0 ? <li className="text-sm text-muted">Nog geen bezoek bewaard.</li> : null}
        {signed.map((visit) => (
          <li key={visit.id} className="workspace-card p-4 text-sm">
            <p>{formatIsoDate(visit.visited_on)}</p>
            {visit.notes ? <p className="text-muted">{visit.notes}</p> : null}
            {visit.url ? <a href={visit.url} className="underline">Attest openen</a> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
