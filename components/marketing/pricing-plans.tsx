"use client";

import { CONTACT_EMAIL, PRICING, PRODUCT_NAME } from "@/config/site";
import Link from "next/link";
import { useState } from "react";

const included = [
  "Onbeperkt klanten, adressen en ketels",
  "Deadlines volgens de Vlaamse regels",
  "Automatische e-mailherinneringen",
  "Online een moment laten kiezen",
  "Attesten digitaal bewaren",
  "Overzicht per gemeente",
  "Tot 3 gebruikers",
  "Support via e-mail",
];

export function PricingPlans() {
  const [yearly, setYearly] = useState(false);
  const testMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Testklant ${PRODUCT_NAME}`)}`;

  return (
    <div>
      <div className="inline-flex rounded-full border border-foreground/15 p-1 text-sm">
        <button type="button" className={yearly ? "rounded-full px-4 py-2" : "rounded-full bg-foreground px-4 py-2 text-background"} onClick={() => setYearly(false)}>
          Maandelijks
        </button>
        <button type="button" className={yearly ? "rounded-full bg-foreground px-4 py-2 text-background" : "rounded-full px-4 py-2"} onClick={() => setYearly(true)}>
          Jaarlijks
          <span className="ml-2 rounded-full border border-current px-2 py-0.5 text-xs">{PRICING.yearlyLabel}</span>
        </button>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-foreground/10 p-6">
          <h2 className="text-lg font-medium">{PRODUCT_NAME}</h2>
          <p className="display mt-4 text-4xl">
            {yearly ? `€${PRICING.yearlyEur} / jaar` : `€${PRICING.monthlyEur} / maand`}
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {included.map((item) => <li key={item}>• {item}</li>)}
          </ul>
          <Link href="/signup" className="button-primary mt-8">7 dagen gratis proberen</Link>
        </article>
        <article className="rounded-3xl border border-foreground bg-foreground p-6 text-background">
          <p className="text-xs uppercase tracking-[0.16em]">Oprichtersprijs</p>
          <p className="display mt-4 text-4xl">€{PRICING.founderMonthlyEur} / maand, zolang je klant blijft</p>
          <p className="mt-4 text-sm">Voor de eerste 10 installateurs die meetesten en feedback geven.</p>
          <p className="mt-2 text-sm">{PRICING.founderAvailability}</p>
          <a href={testMailto} className="mt-8 inline-flex h-12 items-center rounded-full bg-background px-5 text-sm font-medium text-foreground">Word testklant</a>
        </article>
      </div>
    </div>
  );
}
