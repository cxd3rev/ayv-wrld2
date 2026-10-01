import type { Metadata } from "next";
import { legacyModulesEnabled } from "@/config/features";
import { PRODUCT_NAME } from "@/config/site";
import { OnderhoudPlanCard } from "@/components/onderhoud/plan-card";
import { SubscriptionPanel } from "@/components/onderhoud/subscription-panel";
import { BillingPanel } from "@/components/billing/billing-panel";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";
import { onderhoudCharge } from "@/lib/stripe-catalog";
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
  const subscription = subscriptions.find((item) => item.product_slug === "onderhoud") ?? null;
  const charge = onderhoudCharge(subscription?.stripe_price_id);

  return (
    <SettingsPage
      title={legacyModulesEnabled ? t("title") : "Abonnement"}
      description={legacyModulesEnabled ? t("settingsDescription") : `Je plan voor ${PRODUCT_NAME}, de proefperiode en de volgende betaling.`}
    >
      {legacyModulesEnabled ? (
        <BillingPanel
          subscriptions={subscriptions}
          catalog={getBillableCatalog()}
          plans={getPlanCatalog()}
          stripeReady={isStripeConfigured()}
        />
      ) : (
        <>
          <SubscriptionPanel
            plan={PRODUCT_NAME}
            statusLabel={
              subscription?.status === "trialing"
                ? "Proefperiode"
                : subscription?.status === "active"
                  ? "Actief"
                  : subscription
                    ? subscription.status
                    : "Nog geen abonnement"
            }
            trialEnds={
              subscription?.status === "trialing" && subscription.current_period_end
                ? new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Brussels" }).format(
                    new Date(subscription.current_period_end),
                  )
                : null
            }
            nextCharge={charge ? `€${charge.amountEur} per ${charge.period}` : null}
          />
          <div className="mt-8">
            <OnderhoudPlanCard stripeReady={isProductCheckoutReady("onderhoud")} />
          </div>
        </>
      )}
    </SettingsPage>
  );
}
