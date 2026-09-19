import assert from "node:assert/strict";
import test from "node:test";
// Node's type-stripping runner requires the source extension.
// @ts-expect-error This test intentionally executes TypeScript source directly.
const { calculatePricingSummary, formatEuroPrice } = await import("./pricing.ts");

test("calculates the AYV Automation Stack catalog and exact 50% price", () => {
  assert.deepEqual(
    calculatePricingSummary([40, 40, 70, 70, 90, 90], 0.5),
    {
      fullMonthly: 400,
      discountedMonthly: 200,
      savingsMonthly: 200,
    },
  );
});

test("keeps fifty cents when halving an odd whole-euro total", () => {
  assert.deepEqual(calculatePricingSummary([49], 0.5), {
    fullMonthly: 49,
    discountedMonthly: 24.5,
    savingsMonthly: 24.5,
  });
});

test("omits phantom cents but preserves real cents by locale", () => {
  assert.equal(formatEuroPrice(40, "en"), "€40");
  assert.match(formatEuroPrice(40, "nl"), /^€\s?40$/);
  assert.match(formatEuroPrice(24.5, "de"), /^24,50\s?€$/);
});
