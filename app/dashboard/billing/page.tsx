import { BillingPanel } from "@/components/billing/billing-panel";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/auth/session";
import {
  getBillableCatalog,
  getOrganizationSubscriptions,
  isStripeConfigured,
} from "@/services/billing";
import { getTranslations } from "next-intl/server";

export default async function BillingPage() {
  const { organization } = await requireWorkspace();
  const t = await getTranslations("billing");
  const subscriptions = await getOrganizationSubscriptions(organization.id);

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <BillingPanel
        subscriptions={subscriptions}
        catalog={getBillableCatalog()}
        stripeReady={isStripeConfigured()}
      />
    </div>
  );
}
