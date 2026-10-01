import { PRICING } from "@/config/site";

/** One plan. Amounts come from config/site.ts. */
export const ONDERHOUD_MONTHLY_PRICE_EUR: number = PRICING.monthlyEur;
export const ONDERHOUD_YEARLY_PRICE_EUR: number = PRICING.yearlyEur;
export const ONDERHOUD_FOUNDER_PRICE_EUR: number = PRICING.founderMonthlyEur;
export const ONDERHOUD_TRIAL_DAYS = PRICING.trialDays;
export const ONDERHOUD_PLAN_ID = "onderhoud" as const;
