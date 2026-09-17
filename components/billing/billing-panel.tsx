"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { formatDate } from "@/lib/utils";
import { openBillingPortal, startCheckout } from "@/services/billing-actions";
import { isPaidStatus } from "@/lib/billing-status";
import type { BillableProductId } from "@/lib/stripe-catalog";
import type { Subscription } from "@/types/database";
import { useState } from "react";

const statusLabel: Record<string, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past due",
  cancelled: "Cancelled",
  incomplete: "Incomplete",
};

export type BillableCatalogItem = {
  id: BillableProductId;
  name: string;
  priceLabel: string;
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
              <CardDescription>{product.priceLabel}</CardDescription>
              <CardTitle>{product.name}</CardTitle>
              <p className="pt-2 text-sm text-muted">
                {subscription
                  ? `${statusLabel[subscription.status] ?? subscription.status}${
                      subscription.current_period_end
                        ? ` · next bill ${formatDate(subscription.current_period_end)}`
                        : ""
                    }`
                  : "Not subscribed"}
              </p>
            </CardHeader>
            <Button
              onClick={() => checkout(product.id)}
              disabled={pending !== null || !product.configured || entitled}
            >
              {entitled ? `${product.name} active` : `Start ${product.name} subscription`}
            </Button>
          </Card>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 lg:col-span-3">
        <Button variant="secondary" onClick={portal} disabled={pending !== null || !stripeReady}>
          Manage subscriptions
        </Button>
        {!stripeReady ? (
          <p className="text-sm text-muted">
            Add Stripe keys to enable checkout. The customer portal is optional and does not block Start
            subscription.
          </p>
        ) : null}
      </div>
      <FormError message={error} />
    </div>
  );
}
