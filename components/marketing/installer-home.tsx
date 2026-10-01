import { CONTACT_EMAIL, PRICING, PRODUCT_NAME, PRODUCT_TAGLINE } from "@/config/site";
import Link from "next/link";

const problems = [
  ["Alles in je hoofd of in Excel", "Wie moet dit jaar langskomen? Wie vorig jaar? Bij honderden klanten raakt dat overzicht snel kwijt."],
  ["Klanten vergeten het zelf", "Het onderhoud is verplicht, maar de meeste klanten bellen pas als de ketel stilvalt. Dan sta je onder druk in de drukste maanden."],
  ["Attesten overal en nergens", "Papieren attesten, foto's op je gsm, mails. Als een klant er een vraagt, begint het zoeken."],
] as const;

const steps = [
  ["01", "Zet je klanten erin", "Importeer je klantenlijst of voeg ze één voor één toe: adres, type ketel, brandstof, vermogen en datum van het laatste onderhoud."],
  ["02", "Wij rekenen de deadlines uit", "Op basis van de Vlaamse regels zie je meteen welke ketels deze maand, binnen 60 en binnen 90 dagen aan de beurt zijn, en welke te laat zijn."],
  ["03", "Je klant krijgt een herinnering", "Een nette e-mail met jouw naam, op het moment dat jij kiest. Je klant klikt en kiest zelf een vrij moment in jouw planning."],
  ["04", "Na het onderhoud: klaar", "Upload het attest bij het bezoek. De volgende deadline staat er meteen in."],
] as const;

const features = [
  ["Deadlines volgens de Vlaamse regels", "Jaarlijks bij stookolie, om de twee jaar bij gas, jaarlijks bij vaste brandstof. Plus de verwarmingsaudit om de vijf jaar."],
  ["Automatische herinneringen", "Je klant krijgt een e-mail voor zijn onderhoud. Jij kiest hoeveel dagen op voorhand."],
  ["Online een moment kiezen", "Jij zet je vrije momenten open. Je klant kiest er een. Geen telefoontjes heen en weer."],
  ["Overzicht per gemeente", "Plan je rondes slim: zie per gemeente wie aan de beurt is."],
  ["Attesten digitaal bewaard", "Per adres het attest en de geschiedenis van elk bezoek. Altijd terug te vinden."],
  ["Ook voor warmtepompen", "Geen wettelijke plicht, wel slim: stel zelf een herinneringsinterval in."],
] as const;

// TODO: verify every rule against the official Flemish source before launch.
const rules = [
  ["Stookolie", "Elk jaar", "20 kW"],
  ["Gas", "Om de 2 jaar", "20 kW"],
  ["Vaste brandstof (hout, pellets)", "Elk jaar", "Elk vermogen"],
  ["Verwarmingsaudit", "Om de 5 jaar", "20 kW"],
] as const;

// TODO: keep the import answer only while CSV import exists in the dashboard.
// TODO: the database runs in eu-west-1. Confirm storage and logs stay in the EU before launch.
// TODO: keep the export sentence only while CSV export exists in the dashboard.
const questions: [string, string][] = [
  ["Moet ik iets installeren?", `Nee. ${PRODUCT_NAME} werkt in je browser, op je computer en op je gsm.`],
  ["Kan ik mijn bestaande klantenlijst importeren?", "Ja. Je kunt een Excel- of CSV-bestand importeren. Lukt het niet, dan helpen we je bij de start."],
  ["Wat zien mijn klanten?", "Alleen de herinneringsmail met jouw naam en de pagina om een moment te kiezen. Ze hebben geen account nodig."],
  ["Wat als ik ook in Brussel of Wallonië werk?", "Die regels ondersteunen we nog niet. Je kunt voor die ketels wel zelf een interval instellen."],
  ["Waarom vragen jullie mijn kaart bij de proefperiode?", "Zo loopt alles gewoon door na 7 dagen. Je betaalt niets tijdens de proefperiode, en wie voor dag 7 opzegt, betaalt nooit."],
  ["Is mijn data veilig?", "Je gegevens staan in de EU en zijn enkel zichtbaar voor jouw bedrijf. Jij blijft eigenaar van je klantgegevens."],
  ["Kan ik opzeggen?", "Ja, op elk moment, zonder opzegtermijn, ook tijdens de proefperiode. Je kunt je gegevens altijd exporteren."],
];

const testMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Testklant ${PRODUCT_NAME}`)}`;
const talkMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Gesprek")}`;

export function FaqList() {
  return (
    <div className="mt-8 divide-y divide-foreground/10 border-y border-foreground/10">
      {questions.map(([question, answer]) => (
        <details key={question} className="group py-4">
          <summary className="cursor-pointer text-base font-medium">{question}</summary>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function InstallerHome() {
  return (
    <main id="main-content">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Voor verwarmingsinstallateurs in Vlaanderen</p>
        <h1 className="display mt-6 max-w-3xl text-4xl tracking-tight sm:text-6xl">{PRODUCT_TAGLINE}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          {PRODUCT_NAME} houdt bij wanneer elke ketel van je klanten aan onderhoud toe is, stuurt zelf de herinnering en laat je klant online een moment kiezen. Jij doet het werk, wij doen de opvolging.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="button-primary">7 dagen gratis proberen</Link>
          <a href="#hoe-het-werkt" className="button-secondary">Bekijk hoe het werkt</a>
        </div>
        <p className="mt-4 text-sm text-muted">7 dagen gratis · Opzeggen wanneer je wil · Gemaakt in België</p>
      </section>

      <section id="probleem" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display max-w-xl text-3xl sm:text-4xl">Honderden ketels. Elk met een eigen deadline.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {problems.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-foreground/10 p-6">
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="hoe-het-werkt" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display text-3xl sm:text-4xl">Zo werkt het.</h2>
        <ol className="mt-8 grid gap-4">
          {steps.map(([number, title, body]) => (
            <li key={number} className="grid gap-3 rounded-3xl border border-foreground/10 p-6 sm:grid-cols-[4rem_1fr]">
              <span className="font-mono text-sm text-muted">{number}</span>
              <div>
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="functies" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display text-3xl sm:text-4xl">Alles wat je nodig hebt. Niets meer.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-foreground/10 p-6">
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="regels" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display text-3xl sm:text-4xl">Welke regels volgt {PRODUCT_NAME}?</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          We volgen de Vlaamse regels voor centrale stooktoestellen. Werk je ook in Brussel of Wallonië? Daar gelden andere termijnen; die ondersteunen we later.
        </p>
        <div className="mt-8 overflow-x-auto rounded-3xl border border-foreground/10">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Brandstof</th>
                <th className="px-4 py-3 font-medium">Onderhoud</th>
                <th className="px-4 py-3 font-medium">Geldt vanaf</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(([fuel, care, from]) => (
                <tr key={fuel} className="border-t border-foreground/10">
                  <td className="px-4 py-3">{fuel}</td>
                  <td className="px-4 py-3">{care}</td>
                  <td className="px-4 py-3">{from}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">Dit is een vereenvoudigd overzicht. Controleer altijd de actuele regelgeving.</p>
      </section>

      <section id="testfase" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display max-w-xl text-3xl sm:text-4xl">We zoeken de eerste 10 installateurs.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          {PRODUCT_NAME} is nieuw. Ik bouw het samen met installateurs die het dagelijks gebruiken. Als testklant krijg je de oprichtersprijs van €{PRICING.founderMonthlyEur} per maand, zolang je klant blijft, en je bepaalt mee welke functies er komen.
        </p>
        <a href={testMailto} className="button-primary mt-8">Word testklant</a>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display text-3xl sm:text-4xl">Eén prijs. Alles inbegrepen.</h2>
        <p className="mt-4 text-sm leading-6 text-muted">€{PRICING.monthlyEur} per maand, of €{PRICING.yearlyEur} per jaar. Onbeperkt klanten en ketels.</p>
        <Link href="/prijzen" className="button-secondary mt-8">Bekijk de prijzen</Link>
      </section>

      <section id="vragen" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="display text-3xl sm:text-4xl">Vragen</h2>
        <FaqList />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="display max-w-xl text-3xl sm:text-4xl">Klaar met ketels opvolgen in Excel?</h2>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/signup" className="button-primary">7 dagen gratis proberen</Link>
          <a href={talkMailto} className="text-sm underline">Of plan een gesprek</a>
        </div>
      </section>
    </main>
  );
}
