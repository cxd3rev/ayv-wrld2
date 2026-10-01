import type { Metadata } from "next";
import { legacyModulesEnabled } from "@/config/features";
import { PRODUCT_NAME } from "@/config/site";
import { OnderhoudPlanCard } from "@/components/onderhoud/plan-card";
import { BillingPanel } from "@/components/billing/billing-panel";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";
import {
  getBillableCatalog,
  getOrganizationSubscriptions,
  getPlanCatalog,
  isProductCheckoutReady,
  isStripeConfigured,
} from "@/services/billing";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/settings/billing" } };

export default async function SettingsBillingPage() {
  const { organization } = await requireWorkspace();
  const t = await getTranslations("billing");
  const subscriptions = await getOrganizationSubscriptions(organization.id);

  return (
    <SettingsPage
      title={legacyModulesEnabled ? t("title") : "Facturatie"}
      description={legacyModulesEnabled ? t("settingsDescription") : `Eén plan voor ${PRODUCT_NAME}. De prijs wordt nog vastgelegd.`}
    >
      {legacyModulesEnabled ? (
        <BillingPanel
          subscriptions={subscriptions}
          catalog={getBillableCatalog()}
          plans={getPlanCatalog()}
          stripeReady={isStripeConfigured()}
        />
      ) : (
        <OnderhoudPlanCard stripeReady={isProductCheckoutReady("onderhoud")} />
      )}
    </SettingsPage>
  );
}
