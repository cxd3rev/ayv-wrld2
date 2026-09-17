import { BillingPanel } from "@/components/billing/billing-panel";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";
import {
  getBillableCatalog,
  getOrganizationSubscriptions,
  isStripeConfigured,
} from "@/services/billing";

export default async function SettingsBillingPage() {
  const { organization } = await requireWorkspace();
  const subscriptions = await getOrganizationSubscriptions(organization.id);

  return (
    <SettingsPage title="Billing" description="Start Avyro, Velto, or Rovyn, or manage them in the Stripe portal.">
      <BillingPanel
        subscriptions={subscriptions}
        catalog={getBillableCatalog()}
        stripeReady={isStripeConfigured()}
      />
    </SettingsPage>
  );
}
