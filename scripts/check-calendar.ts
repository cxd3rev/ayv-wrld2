import assert from "node:assert/strict";
// Node's type-stripping runner requires the source extension.
// @ts-expect-error This script intentionally executes TypeScript source directly.
const calendarModule = await import("../lib/calendar.ts");
const {
  addCalendarDays,
  buildCalendarEvents,
  monthGrid,
  parseDateOnly,
  shiftMonth,
} = calendarModule;

assert.deepEqual(parseDateOnly("2028-02-29"), { year: 2028, month: 2, day: 29 });
assert.equal(parseDateOnly("2027-02-29"), null);
assert.equal(parseDateOnly("2026-2-01"), null);
assert.equal(addCalendarDays("2028-02-28", 1), "2028-02-29");
assert.equal(addCalendarDays("2028-02-29", 1), "2028-03-01");
assert.equal(addCalendarDays("2026-01-01", -1), "2025-12-31");
assert.deepEqual(shiftMonth(2026, 1, -1), { year: 2025, month: 12 });
assert.deepEqual(shiftMonth(2026, 12, 1), { year: 2027, month: 1 });

const september = monthGrid(2026, 9);
assert.equal(september.length, 42);
assert.equal(september[0], "2026-08-31");
assert.equal(september[6], "2026-09-06");
assert.equal(september[41], "2026-10-11");

assert.deepEqual(buildCalendarEvents({ leads: [], bookings: [], quotes: [] }), []);

console.log("Calendar helper checks passed.");
