"use client";

import { ONDERHOUD_MONTHLY_PRICE_EUR, ONDERHOUD_TRIAL_DAYS } from "@/config/onderhoud";
import { PRODUCT_NAME } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function OnderhoudPlanCard({ stripeReady }: { stripeReady: boolean }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const price = ONDERHOUD_MONTHLY_PRICE_EUR == null ? "Prijs volgt" : `€${ONDERHOUD_MONTHLY_PRICE_EUR} / maand`;

  return (
    <article className="workspace-card max-w-lg p-6">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{PRODUCT_NAME}</p>
      <p className="display mt-4 text-4xl">{price}</p>
      <p className="mt-3 text-sm text-muted">Eén plan. Eerste abonnement start met {ONDERHOUD_TRIAL_DAYS} dagen proef.</p>
      <p className="mt-2 text-xs text-muted">Het maandbedrag wordt nog vastgelegd.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <Button
        className="mt-6"
        disabled={!stripeReady || pending || ONDERHOUD_MONTHLY_PRICE_EUR == null}
        onClick={async () => {
          setPending(true);
          setError("");
          const response = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product: "onderhoud" }),
          });
          const body = (await response.json()) as { url?: string; error?: string };
          setPending(false);
          if (!response.ok || !body.url) {
            setError(body.error ?? "Betaling is nog niet ingesteld.");
            return;
          }
          window.location.href = body.url;
        }}
      >
        {stripeReady && ONDERHOUD_MONTHLY_PRICE_EUR != null ? "Start de proef" : "Nog niet te koop"}
      </Button>
    </article>
  );
}
