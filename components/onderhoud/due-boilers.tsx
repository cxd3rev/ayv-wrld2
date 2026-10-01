import { fuelLabels } from "@/lib/onderhoud/labels";
import { matchesDueFilter, type BoilerListItem } from "@/lib/onderhoud/data";
import Link from "next/link";

const windows = [
  { id: "30", label: "30 dagen" },
  { id: "60", label: "60 dagen" },
  { id: "90", label: "90 dagen" },
] as const;

function windowLabel(value: string | null) {
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
  window: "30" | "60" | "90";
  municipality: string;
}) {
  const visible = items.filter((item) => {
    if (municipality && item.municipality !== municipality) return false;
    return matchesDueFilter(item, window);
  });

  return (
    <div>
      <p className="kicker">AYV Onderhoud</p>
      <h1 className="display mt-4 text-4xl tracking-tight">Ketels die aandacht nodig hebben</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Achterstallig onderhoud en attesten, en wat binnen de gekozen periode vervalt. De datum wordt berekend, niet ingevuld.
      </p>
      <div className="mt-8 flex flex-wrap items-end gap-3">
        {windows.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard?window=${item.id}${municipality ? `&municipality=${encodeURIComponent(municipality)}` : ""}`}
            className={item.id === window ? "rounded-full bg-foreground px-4 py-2 text-sm text-background" : "rounded-full border border-foreground/15 px-4 py-2 text-sm"}
          >
            {item.label}
          </Link>
        ))}
        <form className="flex items-center gap-2" action="/dashboard">
          <input type="hidden" name="window" value={window} />
          <label htmlFor="municipality" className="text-sm text-muted">Gemeente</label>
          <select id="municipality" name="municipality" defaultValue={municipality} className="h-10 rounded-full border border-foreground/15 bg-transparent px-3 text-sm">
            <option value="">Alle</option>
            {municipalities.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button type="submit" className="rounded-full border border-foreground/15 px-4 py-2 text-sm">Filter</button>
        </form>
      </div>
      <div className="workspace-card mt-6 overflow-x-auto">
        {visible.length === 0 ? (
          <p className="p-6 text-sm text-muted">Geen ketels in deze selectie. Voeg een klant toe onder Klanten.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3">Klant</th>
                <th className="px-4 py-3">Gemeente</th>
                <th className="px-4 py-3">Ketel</th>
                <th className="px-4 py-3">Onderhoud</th>
                <th className="px-4 py-3">Audit</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-t border-foreground/10">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/ketels/${item.id}`} className="font-medium">{item.customerName}</Link>
                    <p className="text-muted">{item.street}</p>
                  </td>
                  <td className="px-4 py-3">{item.municipality}</td>
                  <td className="px-4 py-3">{fuelLabels[item.fuel]} · {item.powerKw} kW</td>
                  <td className="px-4 py-3">{item.nextMaintenance ?? "Geen verplichting"}<p className="text-xs text-muted">{item.nextMaintenance ? windowLabel(item.maintenanceWindow) : ""}</p></td>
                  <td className="px-4 py-3">{item.nextAudit ?? "Niet van toepassing"}<p className="text-xs text-muted">{item.nextAudit ? windowLabel(item.auditWindow) : ""}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
