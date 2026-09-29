import type { ProductId } from "@/config/products";
import type { AppLocale } from "@/i18n/config";

export const stackMarketing: Record<ProductId, { name: string }> = {
  avyro: { name: "Avyro" },
  velto: { name: "Velto" },
  rovyn: { name: "Rovyn" },
  orvyn: { name: "Orvyn" },
  nexro: { name: "Nexro" },
  ravelo: { name: "Ravelo" },
};

type ModuleCopy = { line: string; features: string[] };

type StackCopy = {
  nav: { modules: string; pricing: string; how: string; contact: string; start: string; login: string; menu: string; close: string };
  hero: { eyebrow: string; title: string; body: string; primary: string; secondary: string };
  modules: { eyebrow: string; title: string; body: string; learn: string };
  moduleCopy: Record<ProductId, ModuleCopy>;
  pricing: {
    eyebrow: string;
    title: string;
    body: string;
    month: string;
    excludingTax: string;
    starter: string;
    starterBody: string;
    starterCta: string;
    starterFeatures: string[];
    growth: string;
    growthBody: string;
    growthBadge: string;
    growthCta: string;
    growthFeatures: string[];
    stack: string;
    stackBody: string;
    stackCta: string;
    stackFeatures: string[];
    note: string;
  };
  how: { eyebrow: string; title: string; steps: { title: string; body: string }[] };
  proof: { eyebrow: string; title: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  footer: { blurb: string; modules: string; product: string; rights: string; terms: string; privacy: string };
};

const modulesEn: Record<ProductId, ModuleCopy> = {
  avyro: {
    line: "Stores each lead and emails them on the follow-up date you set.",
    features: [
      "Lead records with a status",
      "Follow-up email on the date you choose",
      "Shared calendar with the other modules",
      "Hand a lead to Velto, Rovyn, or Orvyn",
    ],
  },
  velto: {
    line: "Stores each booking and emails a reminder on the date you set.",
    features: [
      "Booking records with date and time",
      "Reminder email on the date you choose",
      "Shared calendar with the other modules",
      "Create a booking from an Avyro lead",
    ],
  },
  rovyn: {
    line: "Stores each quote and emails a follow-up on the date you set.",
    features: [
      "Quote records with an amount",
      "Follow-up email on the date you choose",
      "Status moves to followed up after the email",
      "Create a quote from a booking or lead",
    ],
  },
  orvyn: {
    line: "Stores each invoice and emails a reminder on the date you set.",
    features: [
      "Invoice records with a due date",
      "Reminder email on the date you choose",
      "Shared calendar with the other modules",
      "Create an invoice from a quote",
    ],
  },
  nexro: {
    line: "Stores a win-back or referral message and emails it on the date you set, or when you send it now.",
    features: [
      "Win-back and referral emails",
      "Send now, or on a date you choose",
      "Shared calendar with the other modules",
      "Start from a customer already in the stack",
    ],
  },
  ravelo: {
    line: "Stores a review request and emails it on the date you set.",
    features: [
      "Review request records",
      "Request email on the date you choose",
      "A later follow-up date",
      "Shared calendar with the other modules",
    ],
  },
};

const en: StackCopy = {
  nav: { modules: "Modules", pricing: "Pricing", how: "How it works", contact: "Contact", start: "Get started", login: "Log in", menu: "Open menu", close: "Close menu" },
  hero: {
    eyebrow: "AYV Automation Stack",
    title: "Turn Leads into Clients.",
    body: "Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo cover the work from a new lead to the next review. Start with Avyro, add the live modules, or take the full stack.",
    primary: "Get started",
    secondary: "View modules",
  },
  modules: {
    eyebrow: "The stack",
    title: "Six modules. One client journey.",
    body: "Each module does one job. Together they carry a client from the first enquiry to a booking, a quote, a payment, a return visit, and a review.",
    learn: "Learn more",
  },
  moduleCopy: modulesEn,
  pricing: {
    eyebrow: "Pricing",
    title: "Starter, Growth, or the full stack.",
    body: "Pick one workflow, connect three, or run every module together.",
    month: "/ month",
    excludingTax: "Tax not included",
    starter: "Starter",
    starterBody: "For businesses testing automation with one workflow.",
    starterCta: "Start with one module",
    starterFeatures: [
      "1 module of your choice (Avyro, Velto, Rovyn, Orvyn, Nexro, or Ravelo)",
      "Up to 200 contacts/leads per month",
      "Email follow-ups on the dates you set",
      "Shared calendar and client history",
      "Email support",
    ],
    growth: "Growth",
    growthBody: "For businesses ready to connect multiple workflows.",
    growthBadge: "Most popular",
    growthCta: "Start with Growth",
    growthFeatures: [
      "Choose any 3 modules",
      "Up to 1,000 contacts/leads per month",
      "Email follow-ups on the dates you set",
      "Shared calendar across the three modules",
      "Priority email support",
      "Save vs. buying modules separately",
    ],
    stack: "Full stack",
    stackBody: "The complete system — every module, fully connected.",
    stackCta: "Get the full stack",
    stackFeatures: [
      "All 6 modules included (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)",
      "Unlimited contacts/leads",
      "Email follow-ups on the dates you set",
      "Shared calendar across all six modules",
      "Priority email support",
      "Best value — save 35%+ vs. buying modules individually",
    ],
    note: "Not sure where to start? Most clients begin with Avyro or Ravelo, then add the rest of the stack once they see results.",
  },
  how: {
    eyebrow: "How it works",
    title: "From the first lead to the review.",
    steps: [
      { title: "Avyro takes the lead", body: "You add the lead and set a follow-up date. Avyro emails them that day." },
      { title: "Velto, Rovyn, and Orvyn carry the job", body: "Velto books and reminds. Rovyn follows the quote until there is a reply. Orvyn reminds on the invoice and confirms when it is paid." },
      { title: "Nexro and Ravelo bring them back", body: "Nexro contacts inactive customers and asks for referrals. Ravelo requests the review and keeps unhappy feedback private first." },
    ],
  },
  proof: { eyebrow: "Placeholder", title: "What teams say" },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered.",
    items: [
      { q: "What is in Starter, Growth, and the full stack?", a: "Starter is one module of your choice. Growth is any three modules. The full stack includes all six: Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo." },
      { q: "Can I buy one module?", a: "Yes. Starter is one module of your choice: Avyro, Velto, Rovyn, Orvyn, Nexro, or Ravelo." },
      { q: "Is the full stack checkout live?", a: "Yes. One module is €39 per month. Growth is €79 per month for any three modules. The full stack is €149 per month for all six. Tax is not included." },
      { q: "Can I upgrade later?", a: "Yes — you can add modules or move up a plan anytime, no lock-in contract." },
      { q: "What happens if I go over my contact limit?", a: "New records stop for the rest of the month. Upgrade to Growth or the full stack to raise the limit. There is no extra charge." },
      { q: "Is there a free trial?", a: "Yes. Each plan starts with 7 days free. A card is required, and billing starts when the trial ends." },
    ],
  },
  footer: {
    blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo follow the client from the first lead to the review.",
    modules: "Modules",
    product: "Product",
    rights: "All rights reserved.",
    terms: "Terms",
    privacy: "Privacy",
  },
};

const fr: StackCopy = {
  ...en,
  nav: { ...en.nav, pricing: "Tarifs", how: "Fonctionnement", start: "Commencer", login: "Connexion", menu: "Ouvrir le menu", close: "Fermer le menu" },
  hero: { ...en.hero, title: "Transformez les prospects en clients.", body: "Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo couvrent le travail du nouveau prospect jusqu’à l’avis. Commencez par Avyro, ajoutez les modules en ligne, ou prenez toute la stack.", primary: "Commencer", secondary: "Voir les modules" },
  modules: { eyebrow: "La stack", title: "Six modules. Un parcours client.", body: "Chaque module fait un travail. Ensemble, ils mènent un client de la demande au rendez-vous, au devis, au paiement, au retour et à l’avis.", learn: "En savoir plus" },
  moduleCopy: {
    avyro: { line: "Enregistre chaque prospect et lui envoie un e-mail à la date de relance que vous choisissez.", features: ["Fiches prospect avec un statut", "E-mail de relance à la date choisie", "Calendrier partagé avec les autres modules", "Transmettre un prospect à Velto, Rovyn ou Orvyn"] },
    velto: { line: "Enregistre chaque réservation et envoie un e-mail de rappel à la date que vous choisissez.", features: ["Fiches de réservation avec date et heure", "E-mail de rappel à la date choisie", "Calendrier partagé avec les autres modules", "Créer une réservation depuis un prospect Avyro"] },
    rovyn: { line: "Enregistre chaque devis et envoie un e-mail de relance à la date que vous choisissez.", features: ["Fiches de devis avec un montant", "E-mail de relance à la date choisie", "Le statut passe à relancé après l’envoi", "Créer un devis depuis une réservation ou un prospect"] },
    orvyn: { line: "Enregistre chaque facture et envoie un e-mail de rappel à la date que vous choisissez.", features: ["Fiches de facture avec une échéance", "E-mail de rappel à la date choisie", "Calendrier partagé avec les autres modules", "Créer une facture depuis un devis"] },
    nexro: { line: "Enregistre un message de reconquête ou de parrainage et l’envoie par e-mail à la date choisie, ou tout de suite.", features: ["E-mails de reconquête et de parrainage", "Envoi immédiat ou à une date choisie", "Calendrier partagé avec les autres modules", "Partir d’un client déjà dans la stack"] },
    ravelo: { line: "Enregistre une demande d’avis et l’envoie par e-mail à la date que vous choisissez.", features: ["Fiches de demande d’avis", "E-mail à la date choisie", "Une date de relance plus tard", "Calendrier partagé avec les autres modules"] },
  },
  pricing: { ...en.pricing, excludingTax: "Hors taxes", month: "/ mois", eyebrow: "Tarifs", title: "Starter, Growth, ou la stack complète.", body: "Un seul flux, trois modules, ou tous les modules ensemble.", starterBody: "Pour les entreprises qui testent l’automatisation avec un seul flux.", starterCta: "Commencer avec un module", starterFeatures: ["1 module au choix (Avyro, Velto, Rovyn, Orvyn, Nexro ou Ravelo)", "Jusqu’à 200 contacts/prospects par mois", "E-mails de relance aux dates choisies", "Calendrier partagé et historique client", "Support par e-mail"], growthBody: "Pour les entreprises prêtes à relier plusieurs flux.", growthBadge: "Le plus choisi", growthCta: "Commencer avec Growth", growthFeatures: ["3 modules au choix", "Jusqu’à 1 000 contacts/prospects par mois", "E-mails de relance aux dates choisies", "Calendrier partagé sur les trois modules", "Support e-mail prioritaire", "Moins cher que les modules achetés séparément"], stack: "Stack complète", stackBody: "Le système complet — chaque module, connecté.", stackCta: "Prendre la stack complète", stackFeatures: ["Les 6 modules inclus (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Contacts/prospects illimités", "E-mails de relance aux dates choisies", "Calendrier partagé sur les six modules", "Support e-mail prioritaire", "Meilleur prix — plus de 35 % d’économie vs. les modules séparés"], note: "Vous ne savez pas par où commencer ? La plupart des clients commencent par Avyro ou Ravelo, puis ajoutent le reste de la stack quand ils voient les résultats." },
  how: { eyebrow: "Fonctionnement", title: "Du premier prospect à l’avis.", steps: [{ title: "Avyro prend le prospect", body: "Vous ajoutez le prospect et choisissez une date de relance. Avyro lui envoie un e-mail ce jour-là." }, { title: "Velto, Rovyn et Orvyn font avancer le travail", body: "Velto enregistre la réservation et rappelle à la date choisie. Rovyn relance le devis à la date choisie. Orvyn rappelle la facture à la date choisie." }, { title: "Nexro et Ravelo les font revenir", body: "Nexro envoie le message de retour ou de parrainage à la date choisie. Ravelo envoie la demande d’avis à la date choisie." }] },
  proof: { eyebrow: "Espace réservé", title: "Ce que disent les équipes" },
  faq: { eyebrow: "FAQ", title: "Les questions, simplement.", items: [{ q: "Que contiennent Starter, Growth et la stack complète ?", a: "Starter, c’est un module au choix. Growth, ce sont trois modules au choix. La stack complète inclut les six : Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo." }, { q: "Puis-je acheter un seul module ?", a: "Oui. Starter, c’est un module au choix : Avyro, Velto, Rovyn, Orvyn, Nexro ou Ravelo." }, { q: "Le paiement de la stack est-il en ligne ?", a: "Oui. Un module coûte 39 € par mois. Growth coûte 79 € par mois pour trois modules. La stack complète coûte 149 € par mois pour les six. Hors taxes." }, { q: "Puis-je changer de formule plus tard ?", a: "Oui — vous pouvez ajouter des modules ou monter de formule à tout moment, sans engagement." }, { q: "Que se passe-t-il si je dépasse ma limite de contacts ?", a: "Les nouveaux enregistrements s’arrêtent pour le reste du mois. Passez à Growth ou à la stack complète pour augmenter la limite. Il n’y a pas de frais en plus." }, { q: "Y a-t-il un essai gratuit ?", a: "Oui. Chaque formule commence par 7 jours gratuits. Une carte est demandée, et le paiement commence à la fin de l’essai." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo suivent le client du premier prospect jusqu’à l’avis.", product: "Produit", rights: "Tous droits réservés.", terms: "Conditions", privacy: "Confidentialité" },
};

const de: StackCopy = {
  ...en,
  nav: { ...en.nav, modules: "Module", pricing: "Preise", how: "So funktioniert’s", contact: "Kontakt", start: "Loslegen", login: "Anmelden", menu: "Menü öffnen", close: "Menü schließen" },
  hero: { ...en.hero, title: "Verwandeln Sie Leads in Kunden.", body: "Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo decken den Weg von der Anfrage bis zur Bewertung ab. Starten Sie mit Avyro, ergänzen Sie die verfügbaren Module oder nehmen Sie den ganzen Stack.", primary: "Loslegen", secondary: "Module ansehen" },
  modules: { eyebrow: "Der Stack", title: "Sechs Module. Ein Kundenweg.", body: "Jedes Modul erledigt eine Aufgabe. Zusammen führen sie von der Anfrage zu Termin, Angebot, Zahlung, Rückkehr und Bewertung.", learn: "Mehr erfahren" },
  moduleCopy: {
    avyro: { line: "Speichert jeden Lead und schickt am gewählten Nachfassdatum eine E-Mail.", features: ["Lead-Einträge mit Status", "Nachfass-E-Mail am gewählten Datum", "Gemeinsamer Kalender mit den anderen Modulen", "Einen Lead an Velto, Rovyn oder Orvyn übergeben"] },
    velto: { line: "Speichert jede Buchung und schickt am gewählten Datum eine Erinnerung per E-Mail.", features: ["Buchungseinträge mit Datum und Uhrzeit", "Erinnerungs-E-Mail am gewählten Datum", "Gemeinsamer Kalender mit den anderen Modulen", "Eine Buchung aus einem Avyro-Lead anlegen"] },
    rovyn: { line: "Speichert jedes Angebot und schickt am gewählten Datum eine Nachfass-E-Mail.", features: ["Angebotseinträge mit Betrag", "Nachfass-E-Mail am gewählten Datum", "Der Status wird nach dem Versand auf nachgefasst gesetzt", "Ein Angebot aus einer Buchung oder einem Lead anlegen"] },
    orvyn: { line: "Speichert jede Rechnung und schickt am gewählten Datum eine Erinnerung per E-Mail.", features: ["Rechnungseinträge mit Fälligkeitsdatum", "Erinnerungs-E-Mail am gewählten Datum", "Gemeinsamer Kalender mit den anderen Modulen", "Eine Rechnung aus einem Angebot anlegen"] },
    nexro: { line: "Speichert eine Rückgewinn- oder Empfehlungsnachricht und verschickt sie am gewählten Datum oder sofort per E-Mail.", features: ["E-Mails zur Rückgewinnung und Empfehlung", "Sofort senden oder an einem gewählten Datum", "Gemeinsamer Kalender mit den anderen Modulen", "Von einem Kunden starten, der schon im Stack ist"] },
    ravelo: { line: "Speichert eine Bewertungsanfrage und verschickt sie am gewählten Datum per E-Mail.", features: ["Einträge für Bewertungsanfragen", "E-Mail am gewählten Datum", "Ein späteres Nachfassdatum", "Gemeinsamer Kalender mit den anderen Modulen"] },
  },
  pricing: { ...en.pricing, excludingTax: "zzgl. MwSt.", month: "/ Monat", eyebrow: "Preise", title: "Starter, Growth oder der volle Stack.", body: "Ein Ablauf, drei Module oder alle Module zusammen.", starterBody: "Für Betriebe, die Automatisierung mit einem Ablauf testen.", starterCta: "Mit einem Modul starten", starterFeatures: ["1 Modul nach Wahl (Avyro, Velto, Rovyn, Orvyn, Nexro oder Ravelo)", "Bis zu 200 Kontakte/Leads pro Monat", "Nachfass-E-Mails an den gewählten Daten", "Gemeinsamer Kalender und Kundenhistorie", "E-Mail-Support"], growthBody: "Für Betriebe, die mehrere Abläufe verbinden wollen.", growthBadge: "Am beliebtesten", growthCta: "Mit Growth starten", growthFeatures: ["Beliebige 3 Module", "Bis zu 1.000 Kontakte/Leads pro Monat", "Nachfass-E-Mails an den gewählten Daten", "Gemeinsamer Kalender über die drei Module", "Priorisierter E-Mail-Support", "Günstiger als der Einzelkauf der Module"], stack: "Voller Stack", stackBody: "Das komplette System — jedes Modul, verbunden.", stackCta: "Den vollen Stack holen", stackFeatures: ["Alle 6 Module (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Unbegrenzte Kontakte/Leads", "Nachfass-E-Mails an den gewählten Daten", "Gemeinsamer Kalender über alle sechs Module", "Priorisierter E-Mail-Support", "Bester Preis — über 35 % günstiger als der Einzelkauf"], note: "Unsicher, wo Sie anfangen? Die meisten Kunden starten mit Avyro oder Ravelo und ergänzen den Rest, sobald sie Ergebnisse sehen." },
  how: { eyebrow: "So funktioniert’s", title: "Von der ersten Anfrage zur Bewertung.", steps: [{ title: "Avyro nimmt die Anfrage", body: "Sie legen den Lead an und wählen ein Nachfassdatum. Avyro schickt an dem Tag eine E-Mail." }, { title: "Velto, Rovyn und Orvyn führen den Auftrag", body: "Velto speichert die Buchung und erinnert am gewählten Datum. Rovyn fasst das Angebot am gewählten Datum nach. Orvyn erinnert am gewählten Datum an die Rechnung." }, { title: "Nexro und Ravelo holen sie zurück", body: "Nexro verschickt Rückgewinn oder Empfehlung am gewählten Datum. Ravelo verschickt die Bewertungsanfrage am gewählten Datum." }] },
  proof: { eyebrow: "Platzhalter", title: "Was Teams sagen" },
  faq: { eyebrow: "FAQ", title: "Fragen, beantwortet.", items: [{ q: "Was ist in Starter, Growth und dem vollen Stack?", a: "Starter ist ein Modul nach Wahl. Growth sind drei beliebige Module. Der volle Stack enthält alle sechs: Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo." }, { q: "Kann ich ein einzelnes Modul kaufen?", a: "Ja. Starter ist ein Modul nach Wahl: Avyro, Velto, Rovyn, Orvyn, Nexro oder Ravelo." }, { q: "Ist der Stack-Checkout live?", a: "Ja. Ein Modul kostet 39 € pro Monat. Growth kostet 79 € pro Monat für drei Module. Der volle Stack kostet 149 € pro Monat für alle sechs. Zuzüglich MwSt." }, { q: "Kann ich später wechseln?", a: "Ja — Sie können jederzeit Module ergänzen oder den Plan erhöhen, ohne Vertragsbindung." }, { q: "Was passiert, wenn ich das Kontaktlimit überschreite?", a: "Neue Einträge stoppen für den Rest des Monats. Wechseln Sie zu Growth oder zum vollen Stack, um das Limit zu erhöhen. Es gibt keine Zusatzkosten." }, { q: "Gibt es eine Testphase?", a: "Ja. Jeder Plan beginnt mit 7 kostenlosen Tagen. Eine Karte ist nötig, und die Abrechnung startet nach der Testphase." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo begleiten den Kunden von der Anfrage bis zur Bewertung.", modules: "Module", product: "Produkt", rights: "Alle Rechte vorbehalten.", terms: "AGB", privacy: "Datenschutz" },
};

const nl: StackCopy = {
  ...en,
  nav: { ...en.nav, pricing: "Prijzen", how: "Hoe het werkt", start: "Aan de slag", login: "Inloggen", menu: "Menu openen", close: "Menu sluiten" },
  hero: { ...en.hero, title: "Zet leads om in klanten.", body: "Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo dekken het werk van een nieuwe lead tot de volgende review. Begin met Avyro, voeg de live modules toe, of neem de hele stack.", primary: "Aan de slag", secondary: "Bekijk modules" },
  modules: { eyebrow: "De stack", title: "Zes modules. Eén klantreis.", body: "Elke module doet één taak. Samen brengen ze een klant van de aanvraag naar een afspraak, een offerte, een betaling, een terugkomst en een review.", learn: "Meer info" },
  moduleCopy: {
    avyro: { line: "Bewaart elke lead en mailt op de opvolgdatum die je kiest.", features: ["Leadkaarten met een status", "Opvolgmail op de gekozen datum", "Gedeelde agenda met de andere modules", "Een lead doorgeven aan Velto, Rovyn of Orvyn"] },
    velto: { line: "Bewaart elke boeking en mailt een herinnering op de datum die je kiest.", features: ["Boekingen met datum en tijd", "Herinneringsmail op de gekozen datum", "Gedeelde agenda met de andere modules", "Een boeking maken vanuit een Avyro-lead"] },
    rovyn: { line: "Bewaart elke offerte en mailt een opvolging op de datum die je kiest.", features: ["Offertes met een bedrag", "Opvolgmail op de gekozen datum", "De status wordt na de mail opgevolgd", "Een offerte maken vanuit een boeking of lead"] },
    orvyn: { line: "Bewaart elke factuur en mailt een herinnering op de datum die je kiest.", features: ["Facturen met een vervaldatum", "Herinneringsmail op de gekozen datum", "Gedeelde agenda met de andere modules", "Een factuur maken vanuit een offerte"] },
    nexro: { line: "Bewaart een terugwin- of referralbericht en mailt het op de gekozen datum, of meteen.", features: ["Terugwin- en referralmails", "Meteen versturen, of op een gekozen datum", "Gedeelde agenda met de andere modules", "Starten vanuit een klant die al in de stack staat"] },
    ravelo: { line: "Bewaart een reviewverzoek en mailt het op de datum die je kiest.", features: ["Reviewverzoeken", "Mail op de gekozen datum", "Een latere opvolgdatum", "Gedeelde agenda met de andere modules"] },
  },
  pricing: { ...en.pricing, excludingTax: "Exclusief btw", month: "/ maand", eyebrow: "Prijzen", title: "Starter, Growth, of de volledige stack.", body: "Eén workflow, drie modules, of alle modules samen.", starterBody: "Voor bedrijven die automatisering met één workflow testen.", starterCta: "Start met één module", starterFeatures: ["1 module naar keuze (Avyro, Velto, Rovyn, Orvyn, Nexro of Ravelo)", "Tot 200 contacten/leads per maand", "Opvolgmails op de gekozen datums", "Gedeelde agenda en klantgeschiedenis", "E-mailsupport"], growthBody: "Voor bedrijven die meerdere workflows willen koppelen.", growthBadge: "Meest gekozen", growthCta: "Start met Growth", growthFeatures: ["Kies 3 modules", "Tot 1.000 contacten/leads per maand", "Opvolgmails op de gekozen datums", "Gedeelde agenda over de drie modules", "Prioriteit per e-mail", "Goedkoper dan de modules apart"], stack: "Volledige stack", stackBody: "Het complete systeem — elke module, verbonden.", stackCta: "Neem de volledige stack", stackFeatures: ["Alle 6 modules (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Onbeperkte contacten/leads", "Opvolgmails op de gekozen datums", "Gedeelde agenda over alle zes modules", "Prioriteit per e-mail", "Beste prijs — meer dan 35% goedkoper dan losse modules"], note: "Weet je niet waar je begint? De meeste klanten starten met Avyro of Ravelo en voegen de rest toe zodra ze resultaat zien." },
  how: { eyebrow: "Hoe het werkt", title: "Van de eerste lead naar de review.", steps: [{ title: "Avyro pakt de lead", body: "Je voegt de lead toe en kiest een opvolgdatum. Avyro mailt die dag." }, { title: "Velto, Rovyn en Orvyn doen het werk", body: "Velto bewaart de boeking en herinnert op de gekozen datum. Rovyn volgt de offerte op de gekozen datum. Orvyn herinnert aan de factuur op de gekozen datum." }, { title: "Nexro en Ravelo brengen ze terug", body: "Nexro mailt het terugwin- of referralbericht op de gekozen datum. Ravelo mailt het reviewverzoek op de gekozen datum." }] },
  proof: { eyebrow: "Tijdelijk", title: "Wat teams zeggen" },
  faq: { eyebrow: "FAQ", title: "Vragen, beantwoord.", items: [{ q: "Wat zit er in Starter, Growth en de volledige stack?", a: "Starter is één module naar keuze. Growth is drie modules naar keuze. De volledige stack bevat alle zes: Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo." }, { q: "Kan ik één module kopen?", a: "Ja. Starter is één module naar keuze: Avyro, Velto, Rovyn, Orvyn, Nexro of Ravelo." }, { q: "Is de stack-checkout live?", a: "Ja. Eén module is €39 per maand. Growth is €79 per maand voor drie modules. De volledige stack is €149 per maand voor alle zes. Exclusief btw." }, { q: "Kan ik later upgraden?", a: "Ja — je kunt op elk moment modules toevoegen of een hoger plan nemen, zonder contract." }, { q: "Wat als ik over mijn contactlimiet ga?", a: "Nieuwe records stoppen voor de rest van de maand. Upgrade naar Growth of de volledige stack om de limiet te verhogen. Er komen geen extra kosten bij." }, { q: "Is er een proefperiode?", a: "Ja. Elk plan begint met 7 gratis dagen. Je koppelt een kaart, en de betaling start als de proef voorbij is." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo volgen de klant van de eerste lead tot de review.", product: "Product", rights: "Alle rechten voorbehouden.", terms: "Voorwaarden", privacy: "Privacy" },
};

const copy: Record<AppLocale, StackCopy> = { en, fr, de, nl };

export function getStackCopy(locale: AppLocale) {
  return copy[locale];
}
