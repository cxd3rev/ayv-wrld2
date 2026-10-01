import type { DueWindow } from "@/lib/maintenance-rules";

export function matchesDueFilter(
  item: { maintenanceWindow: DueWindow | null; auditWindow: DueWindow | null },
  window: "overdue" | "30" | "60" | "90",
) {
  const allowed = new Set<DueWindow>(
    window === "overdue" ? ["overdue"] : window === "30" ? ["overdue", "30"] : window === "60" ? ["overdue", "30", "60"] : ["overdue", "30", "60", "90"],
  );
  return (item.maintenanceWindow !== null && allowed.has(item.maintenanceWindow)) || (item.auditWindow !== null && allowed.has(item.auditWindow));
}
