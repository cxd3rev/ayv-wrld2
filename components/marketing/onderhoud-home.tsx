import { ONDERHOUD_MONTHLY_PRICE_EUR, ONDERHOUD_TRIAL_DAYS } from "@/config/onderhoud";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/config/site";
import { BUSINESS } from "@/lib/business";
import Link from "next/link";

const steps = [
  { title: "Klanten en ketels", body: "Een klant, een of meer adressen, een of meer ketels. Brandstof, vermogen, plaatsingsdatum." },
  { title: "Berekende datums", body: "Het volgende onderhoud en de verwarmingsaudit worden berekend. U typt die datum niet." },
  { title: "Herinnering", body: "De klant krijgt een e-mail in het Nederlands, met uw naam en een link om te boeken." },
  { title: "Afspraak en attest", body: "De klant kiest een open tijdslot. Na het bezoek laadt u het attest op." },
];

export function OnderhoudHome() {
  const price = ONDERHOUD_MONTHLY_PRICE_EUR == null ? "Prijs volgt" : `€${ONDERHOUD_MONTHLY_PRICE_EUR} / maand`;

  return (
    <main id="main-content">
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Voor verwarmingsinstallateurs in Vlaanderen</p>
        <h1 className="display mt-6 max-w-3xl text-5xl tracking-tight sm:text-6xl">{PRODUCT_TAGLINE}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Papieren lijsten en spreadsheets missen een stookolieketel die elk jaar moet, of een gasketel die om de twee jaar moet. {PRODUCT_NAME} berekent de volgende datum per ketel, herinnert de klant, en houdt het attest bij.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="button-primary">Start</Link>
          <a href="#werking" className="button-secondary">Hoe het werkt</a>
        </div>
      </section>

      <section id="werking" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display text-3xl">Wat het doet</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <article key={step.title} className="rounded-3xl border border-foreground/10 p-6">
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted">
          De termijnen in de software zijn voor het Vlaams Gewest en moeten voor de lancering nog gecontroleerd worden. Er wordt geen andere wettelijke verplichting beweerd.
        </p>
      </section>

      <section id="prijs" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display text-3xl">Eén plan</h2>
        <p className="mt-4 text-4xl font-medium">{price}</p>
        <p className="mt-2 text-sm text-muted">Btw niet inbegrepen. Eerste abonnement: {ONDERHOUD_TRIAL_DAYS} dagen proef. Het maandbedrag wordt nog vastgelegd.</p>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display text-3xl">Contact</h2>
        <a href={`mailto:${BUSINESS.email}`} className="mt-4 inline-flex text-lg">{BUSINESS.email}</a>
      </section>
    </main>
  );
}
