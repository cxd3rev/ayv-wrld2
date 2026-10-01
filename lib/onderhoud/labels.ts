import type { FuelType } from "@/lib/maintenance-rules";

export const fuelLabels: Record<FuelType, string> = {
  gas: "Gas",
  oil: "Stookolie",
  solid_fuel: "Vaste brandstof",
  heat_pump: "Warmtepomp",
};
