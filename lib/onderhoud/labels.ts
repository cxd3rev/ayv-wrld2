import type { FuelType } from "@/lib/maintenance-rules";

export function formatIsoDate(value: string | null) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${Number(day)}/${Number(month)}/${year}`;
}

export const fuelLabels: Record<FuelType, string> = {
  gas: "Gas",
  oil: "Stookolie",
  solid_fuel: "Vaste brandstof",
  heat_pump: "Warmtepomp",
};
