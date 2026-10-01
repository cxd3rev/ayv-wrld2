import { PricingFaqList } from "@/components/marketing/installer-home";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { PublicShell } from "@/components/marketing/public-site";
import { PRICING } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prijzen",
  alternates: { canonical: "/prijzen" },
};

export default function PricingPage() {
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="display text-4xl tracking-tight sm:text-5xl">Eén plan. Alles inbegrepen.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Prijzen excl. btw. {PRICING.trialDays} dagen gratis, daarna €{PRICING.monthlyEur} per maand. Opzeggen kan altijd.
        </p>
        <div className="mt-10">
          <PricingPlans />
        </div>
        <PricingFaqList />
      </main>
    </PublicShell>
  );
}
