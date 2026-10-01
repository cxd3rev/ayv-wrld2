import type { Metadata } from "next";
import { legacyModulesEnabled } from "@/config/features";
import { BillingPanel } from "@/components/billing/billing-panel";
import { PageHeader } from "@/components/page-header";
import { requireWorkspace } from "@/lib/auth/session";
import {
  getBillableCatalog,
  getOrganizationSubscriptions,
  getPlanCatalog,
  isStripeConfigured,
} from "@/services/billing";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/billing" } };

export default async function BillingPage() {
  if (!legacyModulesEnabled) redirect("/dashboard/settings/billing");
  const { organization } = await requireWorkspace();
  const t = await getTranslations("billing");
  const subscriptions = await getOrganizationSubscriptions(organization.id);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
      />
      <BillingPanel
        subscriptions={subscriptions}
        catalog={getBillableCatalog()}
        plans={getPlanCatalog()}
        stripeReady={isStripeConfigured()}
      />
    </div>
  );
}
