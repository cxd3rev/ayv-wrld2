"use client";

import { formatIsoDate, fuelLabels } from "@/lib/onderhoud/labels";
import type { BoilerListItem } from "@/lib/onderhoud/data";
import { matchesDueFilter } from "@/lib/onderhoud/due-filter";
import Link from "next/link";

const windows = [
  { id: "overdue", label: "Achterstallig" },
  { id: "30", label: "30 dagen" },
  { id: "60", label: "60 dagen" },
  { id: "90", label: "90 dagen" },
] as const;

function statusLabel(value: string | null) {
  if (value === "overdue") return "Achterstallig";
  if (value === "30" || value === "60" || value === "90") return `Binnen ${value} dagen`;
  return "Later";
}

export function DueBoilers({
  items,
  municipalities,
  window,
  municipality,
}: {
  items: BoilerListItem[];
  municipalities: string[];
  window: "overdue" | "30" | "60" | "90";
  municipality: string;
}) {
  const inTown = items.filter((item) => !municipality || item.municipality === municipality);
  const visible = inTown.filter((item) => matchesDueFilter(item, window));
  const query = municipality ? `&municipality=${encodeURIComponent(municipality)}` : "";

  return (
    <div>
      <p className="kicker">Vandaag</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-4xl tracking-tight">Onderhoud</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Ketels die achterstallig zijn of binnenkort aan onderhoud of een audit toe zijn.
          </p>
        </div>
        <Link href="/dashboard/klanten" className="button-primary h-10 min-h-10 px-4">
          Klant toevoegen
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {windows.map((item) => {
          const count = inTown.filter((row) => matchesDueFilter(row, item.id)).length;
          const active = item.id === window;
          return (
            <Link
              key={item.id}
              href={`/dashboard?window=${item.id}${query}`}
              className={active ? "rounded-2xl border border-foreground bg-foreground p-4 text-background" : "workspace-card p-4"}
            >
              <p className={active ? "text-xs uppercase tracking-[0.14em] text-background/70" : "text-xs uppercase tracking-[0.14em] text-muted"}>
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-medium">{count}</p>
            </Link>
          );
        })}
      </div>

      <form action="/dashboard" className="mt-6 flex flex-wrap items-center gap-3">
        <input type="hidden" name="window" value={window} />
        <label htmlFor="municipality" className="text-sm text-muted">Gemeente</label>
        <select
          id="municipality"
          name="municipality"
          defaultValue={municipality}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-10 rounded-full border border-foreground/15 bg-transparent px-4 text-sm"
        >
          <option value="">Alle gemeenten</option>
          {municipalities.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </form>

      <div className="workspace-card mt-4 overflow-x-auto">
        {items.length === 0 ? (
          <div className="p-8">
            <p className="text-sm text-muted">Nog geen ketels. Voeg een klant toe met adres en ketel.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="p-8">
            <p className="text-sm text-muted">Niets in deze selectie.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Klant</th>
                <th className="px-4 py-3 font-medium">Ketel</th>
                <th className="px-4 py-3 font-medium">Onderhoud</th>
                <th className="px-4 py-3 font-medium">Audit</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-t border-foreground/10">
                  <td className="px-4 py-4">
                    <Link href={`/dashboard/ketels/${item.id}`} className="font-medium hover:underline">{item.customerName}</Link>
                    <p className="text-muted">{item.street}, {item.municipality}</p>
                  </td>
                  <td className="px-4 py-4">
                    {fuelLabels[item.fuel]} · {item.powerKw} kW
                    <p className="text-muted">{[item.brand, item.model].filter(Boolean).join(" ")}</p>
                  </td>
                  <td className="px-4 py-4">
                    {item.nextMaintenance ? formatIsoDate(item.nextMaintenance) : "Geen verplichting"}
                    {item.nextMaintenance ? <p className="text-xs text-muted">{statusLabel(item.maintenanceWindow)}</p> : null}
                  </td>
                  <td className="px-4 py-4">
                    {item.nextAudit ? formatIsoDate(item.nextAudit) : "Niet van toepassing"}
                    {item.nextAudit ? <p className="text-xs text-muted">{statusLabel(item.auditWindow)}</p> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
