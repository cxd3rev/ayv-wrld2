"use client";

import { FormError } from "@/components/ui/form-error";
import { openBillingPortal } from "@/services/billing-actions";
import { useState } from "react";

export function SubscriptionPanel({
  plan,
  statusLabel,
  trialEnds,
  nextCharge,
}: {
  plan: string;
  statusLabel: string;
  trialEnds: string | null;
  nextCharge: string | null;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onManage() {
    setError("");
    setPending(true);
    const result = await openBillingPortal();
    if (result && !result.ok) {
      setError("Het klantportaal is nog niet beschikbaar. Start eerst de proefperiode.");
      setPending(false);
    }
  }

  return (
    <section className="max-w-xl rounded-3xl border border-foreground/10 p-6">
      <h2 className="text-lg font-medium">{plan}</h2>
      <p className="mt-3 text-sm text-muted">{statusLabel}</p>
      {trialEnds ? <p className="mt-2 text-sm">Proefperiode tot {trialEnds}</p> : null}
      {nextCharge ? <p className="mt-2 text-sm">Volgende betaling: {nextCharge} (excl. btw)</p> : null}
      <button type="button" className="button-primary mt-6" disabled={pending} onClick={onManage}>
        {pending ? "Bezig…" : "Abonnement beheren of opzeggen"}
      </button>
      <FormError message={error} />
    </section>
  );
}
