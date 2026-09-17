export type PricingSummary = {
  fullMonthly: number;
  discountedMonthly: number;
  savingsMonthly: number;
};

export function calculatePricingSummary(
  monthlyPrices: readonly number[],
  discountFraction: number,
): PricingSummary {
  if (discountFraction < 0 || discountFraction > 1) {
    throw new RangeError("Discount must be between 0 and 1.");
  }

  const fullMonthlyCents = monthlyPrices.reduce(
    (total, price) => total + Math.round(price * 100),
    0,
  );
  const discountedMonthlyCents = Math.round(
    fullMonthlyCents * (1 - discountFraction),
  );

  return {
    fullMonthly: fullMonthlyCents / 100,
    discountedMonthly: discountedMonthlyCents / 100,
    savingsMonthly: (fullMonthlyCents - discountedMonthlyCents) / 100,
  };
}

export function formatEuroPrice(amount: number, locale: string) {
  const hasCents = !Number.isInteger(amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}
