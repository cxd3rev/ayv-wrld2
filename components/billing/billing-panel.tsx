"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { formatDate } from "@/lib/utils";
import { openBillingPortal, startCheckout } from "@/services/billing-actions";
import type { Subscription } from "@/types/database";
import { useState } from "react";

const statusLabel: Record<string, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past due",
  cancelled: "Cancelled",
  incomplete: "Incomplete",
};

export function BillingPanel({
  subscription,
  stripeReady,
}: {
  subscription: Subscription | null;
  stripeReady: boolean;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function checkout() {
    setError("");
    setPending(true);
    const result = await startCheckout();
    if (result?.error) setError(result.error);
    setPending(false);
  }

  async function portal() {
    setError("");
    setPending(true);
    const result = await openBillingPortal();
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Current plan</CardDescription>
          <CardTitle>{subscription ? "AYV WRLD subscription" : "No plan yet"}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Subscription status</CardDescription>
          <CardTitle>
            {subscription ? statusLabel[subscription.status] ?? subscription.status : "None"}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Next billing date</CardDescription>
          <CardTitle>{formatDate(subscription?.current_period_end)}</CardTitle>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-3 lg:col-span-3">
        <Button onClick={checkout} disabled={pending || !stripeReady}>
          {subscription ? "Change plan" : "Start subscription"}
        </Button>
        <Button variant="secondary" onClick={portal} disabled={pending || !stripeReady}>
          Manage subscription
        </Button>
        {!stripeReady ? (
          <p className="text-sm text-muted">
            Add Stripe keys to enable checkout and the customer portal.
          </p>
        ) : null}
      </div>
      <FormError message={error} />
    </div>
  );
}
