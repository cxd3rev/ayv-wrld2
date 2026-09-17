import type { SubscriptionStatus } from "@/types/database";

export function isUsableSecret(value: string | undefined, prefixes: string[]) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("...")) return false;
  return prefixes.some((prefix) => trimmed.startsWith(prefix) && trimmed.length > prefix.length + 8);
}

export function mapStripeStatus(status: string): SubscriptionStatus {
  if (status === "active" || status === "trialing" || status === "past_due" || status === "incomplete") {
    return status;
  }
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    return "cancelled";
  }
  return "incomplete";
}
