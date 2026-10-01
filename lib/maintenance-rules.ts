/**
 * Maintenance intervals for the Flemish Region.
 * TODO: verify these rules against the current Flemish regulation before launch.
 * This file is the only place those intervals are decided.
 */

export type FuelType = "gas" | "oil" | "solid_fuel" | "heat_pump";

export type BoilerScheduleInput = {
  fuel: FuelType;
  powerKw: number;
  installedOn: string;
  lastMaintenanceOn: string | null;
  lastAuditOn: string | null;
  optionalIntervalMonths: number | null;
};

const LEGAL_KW = 20;

function parseDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Invalid date: ${iso}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function formatDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addMonths(iso: string, months: number) {
  const { year, month, day } = parseDate(iso);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return formatDate(target.getUTCFullYear(), target.getUTCMonth() + 1, Math.min(day, lastDay));
}

export function addYears(iso: string, years: number) {
  return addMonths(iso, years * 12);
}

export function addDays(iso: string, days: number) {
  const { year, month, day } = parseDate(iso);
  return formatDate(year, month, day + days);
}

/**
 * Legal interval in months.
 * Solid fuel is yearly at any power. Under 20 kW is optional, except solid fuel.
 * A heat pump has no legal interval at any power.
 */
export function maintenanceIsLegallyRequired(fuel: FuelType, powerKw: number) {
  return legalMaintenanceIntervalMonths(fuel, powerKw) !== null;
}

export function legalMaintenanceIntervalMonths(fuel: FuelType, powerKw: number) {
  if (fuel === "solid_fuel") return 12;
  if (fuel === "heat_pump") return null;
  if (powerKw < LEGAL_KW) return null;
  if (fuel === "oil") return 12;
  if (fuel === "gas") return 24;
  return null;
}

export function maintenanceIntervalMonths(input: BoilerScheduleInput) {
  const legal = legalMaintenanceIntervalMonths(input.fuel, input.powerKw);
  if (legal) return legal;
  if (input.optionalIntervalMonths && input.optionalIntervalMonths > 0) return input.optionalIntervalMonths;
  return null;
}

/** Next maintenance is the interval after the last visit, or after installation when none is recorded. */
export function nextMaintenanceDue(input: BoilerScheduleInput) {
  const months = maintenanceIntervalMonths(input);
  if (!months) return null;
  return addMonths(input.lastMaintenanceOn ?? input.installedOn, months);
}

/**
 * Heating audit every 5 years for boilers of 20 kW or more.
 * TODO: the rules do not say whether a heat pump of 20 kW or more needs this audit. v1 does not schedule one.
 * The first audit is the first maintenance date on or after the boiler turns 5,
 * counted from the install date on the legal interval (not shifted by a late visit).
 * After an audit is recorded, the next one is 5 years later. Later audits are not forced onto a maintenance visit.
 */
export function nextAuditDue(input: BoilerScheduleInput) {
  if (input.fuel === "heat_pump" || input.powerKw < LEGAL_KW) return null;
  if (input.lastAuditOn) return addYears(input.lastAuditOn, 5);
  const interval = legalMaintenanceIntervalMonths(input.fuel, input.powerKw);
  if (!interval) return null;
  const eligibleFrom = addYears(input.installedOn, 5);
  let cursor = addMonths(input.installedOn, interval);
  for (let step = 0; step < 80; step += 1) {
    if (cursor >= eligibleFrom) return cursor;
    cursor = addMonths(cursor, interval);
  }
  return cursor;
}

export type DueWindow = "overdue" | "30" | "60" | "90" | "later";

export function dueWindow(due: string | null, today: string): DueWindow | null {
  if (!due) return null;
  if (due < today) return "overdue";
  if (due <= addDays(today, 30)) return "30";
  if (due <= addDays(today, 60)) return "60";
  if (due <= addDays(today, 90)) return "90";
  return "later";
}
