import { BillingPanel } from "@/components/billing/billing-panel";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/auth/session";
import { getOrganizationSubscription, isStripeConfigured } from "@/services/billing";

export default async function BillingPage() {
  const { organization } = await requireWorkspace();
  const subscription = await getOrganizationSubscription(organization.id);

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Subscriptions are billed at the organization level, not per user."
      />
      <BillingPanel subscription={subscription} stripeReady={isStripeConfigured()} />
    </div>
  );
}
