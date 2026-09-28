"use client";

import { HelpTrigger } from "@/components/help/help-trigger";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { formatDate } from "@/lib/utils";
import { openBillingPortal, startCheckout } from "@/services/billing-actions";
import { isPaidStatus } from "@/lib/billing-status";
import { formatEuroPrice } from "@/lib/pricing";
import { isBillableProductId, type BillablePlanId, type BillableProductId } from "@/lib/stripe-catalog";
import type { Subscription } from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export type BillableCatalogItem = {
  id: BillableProductId;
  name: string;
  monthlyPrice: number | null;
  configured: boolean;
};

export type PlanCatalogItem = {
  id: BillablePlanId;
  name: string;
  monthlyPrice: number;
  configured: boolean;
};

export function BillingPanel({
  subscriptions,
  catalog,
  plans,
  stripeReady,
}: {
  subscriptions: Subscription[];
  catalog: BillableCatalogItem[];
  plans: PlanCatalogItem[];
  stripeReady: boolean;
}) {
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const statusLabel: Record<string, string> = {
    active: t("statusActive"),
    trialing: t("statusTrialing"),
    past_due: t("statusPastDue"),
    cancelled: t("statusCancelled"),
    incomplete: t("statusIncomplete"),
  };
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"portal" | BillableProductId | BillablePlanId | null>(null);
  const [growthModules, setGrowthModules] = useState<BillableProductId[]>([]);

  function toggleGrowthModule(id: BillableProductId) {
    setGrowthModules((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  async function checkout(product: BillableProductId | BillablePlanId, modules: BillableProductId[] = []) {
    setError("");
    setPending(product);
    const result = await startCheckout(product, modules);
    if (result?.error) setError(result.error);
    setPending(null);
  }

  async function portal() {
    setError("");
    setPending("portal");
    const result = await openBillingPortal();
    if (result?.error) setError(result.error);
    setPending(null);
  }

  const growth = plans.find((plan) => plan.id === "growth");
  const fullStack = plans.find((plan) => plan.id === "full_stack");
  const growthSubscription =
    subscriptions.find((item) => item.product_slug === "growth" && isPaidStatus(item.status)) ??
    subscriptions.find((item) => item.product_slug === "growth") ??
    null;
  const fullStackSubscription =
    subscriptions.find((item) => item.product_slug === "full_stack" && isPaidStatus(item.status)) ??
    subscriptions.find((item) => item.product_slug === "full_stack") ??
    null;
  const growthActive = Boolean(growthSubscription && isPaidStatus(growthSubscription.status));
  const fullStackActive = Boolean(fullStackSubscription && isPaidStatus(fullStackSubscription.status));
  const paidModule = subscriptions.some(
    (item) => item.product_slug && isBillableProductId(item.product_slug) && isPaidStatus(item.status),
  );
  const growthReplaces = paidModule && !growthActive && !fullStackActive;
  const fullStackReplaces = (paidModule || growthActive) && !fullStackActive;

  return (
    <div data-help-avoid className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {growth ? (
          <Card id="growth">
            <CardHeader>
              <CardDescription>
                {formatEuroPrice(growth.monthlyPrice, locale)} {tCommon("perMonth")}
              </CardDescription>
              <CardTitle className="flex items-center gap-3">
                {growth.name}
                <HelpTrigger topicId="growth-modules" />
              </CardTitle>
              <p className="pt-2 text-sm text-muted">{t("growthHelp")}</p>
              {growthReplaces ? <p className="pt-2 text-sm text-muted">{t("switchHelp")}</p> : null}
            </CardHeader>
            <div className="flex flex-wrap gap-2 pb-4">
              {catalog.map((product) => {
                const checked = growthModules.includes(product.id);
                return (
                  <label key={product.id} className="flex items-center gap-2 border border-foreground/15 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={growthActive || (!checked && growthModules.length >= 3)}
                      onChange={() => toggleGrowthModule(product.id)}
                    />
                    {product.name}
                  </label>
                );
              })}
            </div>
            <Button
              onClick={() => checkout("growth", growthModules)}
              disabled={pending !== null || !growth.configured || growthActive || fullStackActive || growthModules.length !== 3}
            >
              {growthActive ? t("active", { name: growth.name }) : t(growthReplaces ? "switch" : "start", { name: growth.name })}
            </Button>
          </Card>
        ) : null}
        {fullStack ? (
          <Card id="full-stack">
            <CardHeader>
              <CardDescription>
                {formatEuroPrice(fullStack.monthlyPrice, locale)} {tCommon("perMonth")}
              </CardDescription>
              <CardTitle>{fullStack.name}</CardTitle>
              <p className="pt-2 text-sm text-muted">{t("fullStackHelp")}</p>
              {fullStackReplaces ? <p className="pt-2 text-sm text-muted">{t("switchHelp")}</p> : null}
            </CardHeader>
            <Button
              onClick={() => checkout("full_stack")}
              disabled={pending !== null || !fullStack.configured || fullStackActive}
            >
              {fullStackActive ? t("active", { name: fullStack.name }) : t(fullStackReplaces ? "switch" : "start", { name: fullStack.name })}
            </Button>
          </Card>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
      {catalog.map((product) => {
        const subscription =
          subscriptions.find((item) => item.product_slug === product.id && isPaidStatus(item.status)) ??
          subscriptions.find((item) => item.product_slug === product.id) ??
          null;
        const entitled = Boolean(subscription && isPaidStatus(subscription.status));

        return (
          <Card key={product.id}>
            <CardHeader>
              <CardDescription>
                {product.monthlyPrice === null
                  ? t("notSubscribed")
                  : `${formatEuroPrice(product.monthlyPrice, locale)} ${tCommon("perMonth")}`}
              </CardDescription>
              <CardTitle>{product.name}</CardTitle>
              <p className="pt-2 text-sm text-muted">
                {subscription
                  ? subscription.current_period_end
                    ? t("nextBill", {
                        status: statusLabel[subscription.status] ?? subscription.status,
                        date: formatDate(subscription.current_period_end, locale),
                      })
                    : (statusLabel[subscription.status] ?? subscription.status)
                  : t("notSubscribed")}
              </p>
            </CardHeader>
            <Button
              onClick={() => checkout(product.id)}
              disabled={pending !== null || !product.configured || entitled || fullStackActive}
            >
              {entitled ? t("active", { name: product.name }) : t("start", { name: product.name })}
            </Button>
          </Card>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 lg:col-span-3">
        <Button variant="secondary" onClick={portal} disabled={pending !== null || !stripeReady}>
          {t("manage")}
        </Button>
        {!stripeReady ? <p className="text-sm text-muted">{t("stripeHint")}</p> : null}
      </div>
      <FormError message={error} />
    </div>
    </div>
  );
}
