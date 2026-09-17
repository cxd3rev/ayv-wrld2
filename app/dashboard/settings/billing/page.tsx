import { BillingPanel } from "@/components/billing/billing-panel";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";
import {
  getBillableCatalog,
  getOrganizationSubscriptions,
  isStripeConfigured,
} from "@/services/billing";
import { getTranslations } from "next-intl/server";

export default async function SettingsBillingPage() {
  const { organization } = await requireWorkspace();
  const t = await getTranslations("billing");
  const subscriptions = await getOrganizationSubscriptions(organization.id);

  return (
    <SettingsPage title={t("title")} description={t("settingsDescription")}>
      <BillingPanel
        subscriptions={subscriptions}
        catalog={getBillableCatalog()}
        stripeReady={isStripeConfigured()}
      />
    </SettingsPage>
  );
}
