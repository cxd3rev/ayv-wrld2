"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { formatDate } from "@/lib/utils";
import { openBillingPortal, startCheckout } from "@/services/billing-actions";
import { isPaidStatus } from "@/lib/billing-status";
import { formatEuroPrice } from "@/lib/pricing";
import type { BillableProductId } from "@/lib/stripe-catalog";
import type { Subscription } from "@/types/database";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export type BillableCatalogItem = {
  id: BillableProductId;
  name: string;
  monthlyPrice: number | null;
  configured: boolean;
};

export function BillingPanel({
  subscriptions,
  catalog,
  stripeReady,
}: {
  subscriptions: Subscription[];
  catalog: BillableCatalogItem[];
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
  const [pending, setPending] = useState<"portal" | BillableProductId | null>(null);

  async function checkout(product: BillableProductId) {
    setError("");
    setPending(product);
    const result = await startCheckout(product);
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

  return (
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
              disabled={pending !== null || !product.configured || entitled}
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
  );
}
