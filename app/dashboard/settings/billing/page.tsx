import { BillingPanel } from "@/components/billing/billing-panel";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";
import { getOrganizationSubscription, isStripeConfigured } from "@/services/billing";

export default async function SettingsBillingPage() {
  const { organization } = await requireWorkspace();
  const subscription = await getOrganizationSubscription(organization.id);

  return (
    <SettingsPage title="Billing" description="Current plan and Stripe customer portal.">
      <BillingPanel subscription={subscription} stripeReady={isStripeConfigured()} />
    </SettingsPage>
  );
}
