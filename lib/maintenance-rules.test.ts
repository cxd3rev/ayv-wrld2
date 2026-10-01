import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node runs this TypeScript file directly.
const rules = await import("./maintenance-rules.ts");

const base = {
  fuel: "oil" as const,
  powerKw: 25,
  installedOn: "2020-03-01",
  lastMaintenanceOn: null,
  lastAuditOn: null,
  optionalIntervalMonths: null,
};

test("oil at 20 kW or more is due every year", () => {
  assert.equal(rules.nextMaintenanceDue({ ...base, powerKw: 20, lastMaintenanceOn: "2024-03-01" }), "2025-03-01");
  assert.equal(rules.nextMaintenanceDue({ ...base }), "2021-03-01");
});

test("gas at 20 kW or more is due every two years", () => {
  assert.equal(
    rules.nextMaintenanceDue({
      ...base,
      fuel: "gas",
      powerKw: 20,
      lastMaintenanceOn: "2024-01-15",
    }),
    "2026-01-15",
  );
});

test("solid fuel is yearly at any power", () => {
  assert.equal(
    rules.nextMaintenanceDue({
      ...base,
      fuel: "solid_fuel",
      powerKw: 5,
      lastMaintenanceOn: "2024-06-01",
    }),
    "2025-06-01",
  );
});

test("heat pumps and boilers under 20 kW have no legal date unless the installer sets one", () => {
  assert.equal(rules.nextMaintenanceDue({ ...base, fuel: "heat_pump", powerKw: 30 }), null);
  assert.equal(rules.nextMaintenanceDue({ ...base, fuel: "gas", powerKw: 19.9 }), null);
  assert.equal(
    rules.nextMaintenanceDue({
      ...base,
      fuel: "heat_pump",
      powerKw: 12,
      installedOn: "2024-02-01",
      optionalIntervalMonths: 18,
    }),
    "2025-08-01",
  );
});

test("the first heating audit is the first maintenance on or after the boiler turns 5", () => {
  assert.equal(rules.nextAuditDue({ ...base, installedOn: "2020-01-01" }), "2025-01-01");
  assert.equal(
    rules.nextAuditDue({ ...base, fuel: "gas", powerKw: 24, installedOn: "2020-06-01" }),
    "2026-06-01",
  );
});

test("a recorded audit makes the next one five years later", () => {
  assert.equal(
    rules.nextAuditDue({ ...base, lastAuditOn: "2025-01-01" }),
    "2030-01-01",
  );
});

test("no audit is scheduled under 20 kW or for a heat pump", () => {
  assert.equal(rules.nextAuditDue({ ...base, powerKw: 19 }), null);
  assert.equal(rules.nextAuditDue({ ...base, fuel: "heat_pump", powerKw: 30 }), null);
});

test("due windows count overdue and the next 30, 60, and 90 days", () => {
  assert.equal(rules.dueWindow("2026-01-01", "2026-02-01"), "overdue");
  assert.equal(rules.dueWindow("2026-02-01", "2026-02-01"), "30");
  assert.equal(rules.dueWindow("2026-03-03", "2026-02-01"), "30");
  assert.equal(rules.dueWindow("2026-03-15", "2026-02-01"), "60");
  assert.equal(rules.dueWindow("2026-04-20", "2026-02-01"), "90");
  assert.equal(rules.dueWindow("2026-08-01", "2026-02-01"), "later");
  assert.equal(rules.dueWindow(null, "2026-02-01"), null);
});

test("month ends do not roll into the following month", () => {
  assert.equal(rules.addMonths("2023-01-31", 1), "2023-02-28");
  assert.equal(rules.addYears("2024-02-29", 1), "2025-02-28");
});
