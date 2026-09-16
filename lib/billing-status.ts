import type { SubscriptionStatus } from "@/types/database";

export function mapStripeStatus(status: string): SubscriptionStatus {
  if (status === "active" || status === "trialing" || status === "past_due" || status === "incomplete") {
    return status;
  }
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    return "cancelled";
  }
  return "incomplete";
}
