import { BillingPanel } from "@/components/billing/billing-panel";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/auth/session";
import {
  getBillableCatalog,
  getOrganizationSubscriptions,
  isStripeConfigured,
} from "@/services/billing";

export default async function BillingPage() {
  const { organization } = await requireWorkspace();
  const subscriptions = await getOrganizationSubscriptions(organization.id);

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Each product is its own monthly subscription. Buy Avyro, Velto, Rovyn, or any combination."
      />
      <BillingPanel
        subscriptions={subscriptions}
        catalog={getBillableCatalog()}
        stripeReady={isStripeConfigured()}
      />
    </div>
  );
}
