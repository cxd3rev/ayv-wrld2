import assert from "node:assert/strict";
import test from "node:test";
// Node's type-stripping runner requires the source extension.
// @ts-expect-error This test intentionally executes TypeScript source directly.
const { calculatePricingSummary, formatEuroPrice } = await import("./pricing.ts");

test("calculates the six-product catalog and exact 50% bundle", () => {
  assert.deepEqual(
    calculatePricingSummary([49, 49, 89, 89, 129, 129], 0.5),
    {
      fullMonthly: 534,
      discountedMonthly: 267,
      savingsMonthly: 267,
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
  assert.equal(formatEuroPrice(49, "en"), "€49");
  assert.match(formatEuroPrice(49, "nl"), /^€\s?49$/);
  assert.match(formatEuroPrice(24.5, "de"), /^24,50\s?€$/);
});
