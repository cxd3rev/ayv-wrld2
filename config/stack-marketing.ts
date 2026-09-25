import type { ProductId } from "@/config/products";
import type { AppLocale } from "@/i18n/config";

export const stackMarketing: Record<ProductId, { name: string; line: string }> = {
  avyro: { name: "Leadflow", line: "Lead conversion automation" },
  velto: { name: "Bookflow", line: "Booking and reminder automation" },
  rovyn: { name: "Followup", line: "Quote follow-up automation" },
  orvyn: { name: "Payflow", line: "Payment and invoice follow-up automation" },
  nexro: { name: "Reactivate", line: "Customer reactivation and referrals" },
  ravelo: { name: "Reviews", line: "Review automation" },
};

type StackCopy = {
  nav: { modules: string; pricing: string; how: string; contact: string; start: string; login: string; menu: string; close: string };
  hero: { eyebrow: string; title: string; body: string; primary: string; secondary: string };
  modules: { eyebrow: string; title: string; body: string; learn: string };
  pricing: { eyebrow: string; title: string; body: string; month: string; starter: string; starterPrice: string; starterBody: string; starterFeatures: string[]; module: string; moduleBody: string; moduleFeatures: string[]; stack: string; stackBody: string; stackFeatures: string[]; best: string; stackNote: string; choose: string; seeStack: string };
  how: { eyebrow: string; title: string; steps: { title: string; body: string }[] };
  proof: { eyebrow: string; title: string };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  footer: { blurb: string; modules: string; product: string; rights: string };
};

const en: StackCopy = {
  nav: { modules: "Modules", pricing: "Pricing", how: "How it works", contact: "Contact", start: "Get started", login: "Log in", menu: "Open menu", close: "Close menu" },
  hero: {
    eyebrow: "AYV Automation Stack",
    title: "Automate how you win and keep clients.",
    body: "Six modules for the work between a new lead and a returning customer. Start with one, or run the full stack.",
    primary: "Get started",
    secondary: "View modules",
  },
  modules: {
    eyebrow: "The stack",
    title: "One system. Six jobs.",
    body: "Each module does one thing well. Together they carry a client from first contact to the next booking.",
    learn: "Learn more",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Start free. Add what you need.",
    body: "Create an account at no charge. Buy a single module, or take every module together.",
    month: "/ month",
    starter: "Starter",
    starterPrice: "€0",
    starterBody: "A workspace to look around before you subscribe.",
    starterFeatures: ["Create an account", "See every module", "No charge until you buy"],
    module: "One module",
    moduleBody: "Pick the job you want automated first.",
    moduleFeatures: ["Any single module", "Opens in your workspace", "Add more later"],
    stack: "Full stack",
    stackBody: "All six modules, priced as one system.",
    stackFeatures: ["Leadflow through Reviews", "Half the separate total", "One connected workflow"],
    best: "Best value",
    stackNote: "Bundle checkout is not available yet. Active modules can still be purchased on their own.",
    choose: "Choose a module",
    seeStack: "See the stack",
  },
  how: {
    eyebrow: "How it works",
    title: "From the first lead to the next review.",
    steps: [
      { title: "Capture the lead", body: "Leadflow answers new enquiries and keeps the conversation moving." },
      { title: "Automate the follow-up", body: "Bookflow, Followup, and Payflow handle the booking, the quote, and the invoice." },
      { title: "Keep them coming back", body: "Reactivate and Reviews bring past customers back and ask for the review." },
    ],
  },
  proof: { eyebrow: "Placeholder", title: "What teams say" },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered.",
    items: [
      { q: "Can I buy one module instead of the stack?", a: "Yes. Each module is its own product. The full stack is the bundle that includes all six." },
      { q: "Is the full stack checkout live?", a: "Not yet. You can still subscribe to the modules that are available, one at a time." },
      { q: "Which modules can I use today?", a: "Leadflow, Bookflow, Followup, and Payflow are available. Reactivate and Reviews are still in development." },
      { q: "Does creating an account charge me?", a: "No. Starter is an account only. You are charged when you subscribe to a module." },
    ],
  },
  footer: {
    blurb: "AYV Automation Stack helps businesses follow up, book, get paid, and bring customers back.",
    modules: "Modules",
    product: "Product",
    rights: "All rights reserved.",
  },
};

const fr: StackCopy = {
  ...en,
  nav: { ...en.nav, modules: "Modules", pricing: "Tarifs", how: "Fonctionnement", contact: "Contact", start: "Commencer", login: "Connexion", menu: "Ouvrir le menu", close: "Fermer le menu" },
  hero: { ...en.hero, title: "Automatisez la façon dont vous gagnez et gardez vos clients.", body: "Six modules pour le travail entre un nouveau prospect et un client qui revient. Commencez par un seul, ou prenez toute la stack.", primary: "Commencer", secondary: "Voir les modules" },
  modules: { eyebrow: "La stack", title: "Un système. Six tâches.", body: "Chaque module fait une chose, et la fait bien. Ensemble, ils suivent un client du premier contact à la prochaine réservation.", learn: "En savoir plus" },
  pricing: { ...en.pricing, eyebrow: "Tarifs", title: "Commencez gratuitement. Ajoutez ce qu’il vous faut.", body: "Créez un compte sans frais. Achetez un module, ou prenez-les tous ensemble.", starter: "Début", starterBody: "Un espace pour regarder avant de vous abonner.", starterFeatures: ["Créer un compte", "Voir chaque module", "Aucun frais avant l’achat"], module: "Un module", moduleBody: "Choisissez la tâche à automatiser en premier.", moduleFeatures: ["N’importe quel module", "S’ouvre dans votre espace", "Ajoutez-en plus ensuite"], stack: "Stack complète", stackBody: "Les six modules, au prix d’un seul système.", stackFeatures: ["De Leadflow à Reviews", "La moitié du total séparé", "Un flux connecté"], best: "Meilleur choix", stackNote: "Le paiement groupé n’est pas encore disponible. Les modules actifs peuvent toujours être achetés séparément.", choose: "Choisir un module", seeStack: "Voir la stack" },
  how: { eyebrow: "Fonctionnement", title: "Du premier prospect au prochain avis.", steps: [{ title: "Captez le prospect", body: "Leadflow répond aux nouvelles demandes et fait avancer la conversation." }, { title: "Automatisez le suivi", body: "Bookflow, Followup et Payflow gèrent la réservation, le devis et la facture." }, { title: "Faites-les revenir", body: "Reactivate et Reviews ramènent les anciens clients et demandent l’avis." }] },
  proof: { eyebrow: "Espace réservé", title: "Ce que disent les équipes" },
  faq: { eyebrow: "FAQ", title: "Les questions, simplement.", items: [{ q: "Puis-je acheter un seul module ?", a: "Oui. Chaque module est un produit à part. La stack complète est le lot des six." }, { q: "Le paiement de la stack est-il en ligne ?", a: "Pas encore. Vous pouvez déjà vous abonner aux modules disponibles, un par un." }, { q: "Quels modules puis-je utiliser aujourd’hui ?", a: "Leadflow, Bookflow, Followup et Payflow sont disponibles. Reactivate et Reviews sont encore en développement." }, { q: "Créer un compte me facture-t-il ?", a: "Non. Début est seulement un compte. Vous êtes facturé quand vous vous abonnez à un module." }] },
  footer: { blurb: "AYV Automation Stack aide les entreprises à relancer, réserver, être payées et faire revenir leurs clients.", modules: "Modules", product: "Produit", rights: "Tous droits réservés." },
};

const de: StackCopy = {
  ...en,
  nav: { ...en.nav, modules: "Module", pricing: "Preise", how: "So funktioniert’s", contact: "Kontakt", start: "Loslegen", login: "Anmelden", menu: "Menü öffnen", close: "Menü schließen" },
  hero: { ...en.hero, title: "Automatisieren Sie, wie Sie Kunden gewinnen und halten.", body: "Sechs Module für die Arbeit zwischen einer neuen Anfrage und einem wiederkehrenden Kunden. Starten Sie mit einem, oder nutzen Sie den ganzen Stack.", primary: "Loslegen", secondary: "Module ansehen" },
  modules: { eyebrow: "Der Stack", title: "Ein System. Sechs Aufgaben.", body: "Jedes Modul macht eine Sache gut. Zusammen begleiten sie einen Kunden vom ersten Kontakt zur nächsten Buchung.", learn: "Mehr erfahren" },
  pricing: { ...en.pricing, eyebrow: "Preise", title: "Kostenlos starten. Dazu nehmen, was Sie brauchen.", body: "Legen Sie ein Konto ohne Kosten an. Kaufen Sie ein Modul oder alle zusammen.", starter: "Start", starterBody: "Ein Arbeitsbereich zum Ansehen, bevor Sie abonnieren.", starterFeatures: ["Konto erstellen", "Jedes Modul sehen", "Keine Kosten vor dem Kauf"], module: "Ein Modul", moduleBody: "Wählen Sie die Aufgabe, die zuerst laufen soll.", moduleFeatures: ["Ein beliebiges Modul", "Öffnet sich in Ihrem Bereich", "Später weitere ergänzen"], stack: "Voller Stack", stackBody: "Alle sechs Module, als ein System berechnet.", stackFeatures: ["Von Leadflow bis Reviews", "Die Hälfte der Einzelpreise", "Ein verbundener Ablauf"], best: "Bester Wert", stackNote: "Der Bundle-Checkout ist noch nicht verfügbar. Aktive Module können einzeln gekauft werden.", choose: "Modul wählen", seeStack: "Stack ansehen" },
  how: { eyebrow: "So funktioniert’s", title: "Von der ersten Anfrage zur nächsten Bewertung.", steps: [{ title: "Anfrage aufnehmen", body: "Leadflow beantwortet neue Anfragen und hält das Gespräch in Bewegung." }, { title: "Nachfassen automatisieren", body: "Bookflow, Followup und Payflow übernehmen Termin, Angebot und Rechnung." }, { title: "Kunden zurückholen", body: "Reactivate und Reviews holen frühere Kunden zurück und bitten um die Bewertung." }] },
  proof: { eyebrow: "Platzhalter", title: "Was Teams sagen" },
  faq: { eyebrow: "FAQ", title: "Fragen, beantwortet.", items: [{ q: "Kann ich nur ein Modul kaufen?", a: "Ja. Jedes Modul ist ein eigenes Produkt. Der volle Stack ist das Bündel aller sechs." }, { q: "Ist der Stack-Checkout live?", a: "Noch nicht. Verfügbare Module können Sie bereits einzeln abonnieren." }, { q: "Welche Module kann ich heute nutzen?", a: "Leadflow, Bookflow, Followup und Payflow sind verfügbar. Reactivate und Reviews sind noch in Entwicklung." }, { q: "Kostet das Konto etwas?", a: "Nein. Start ist nur ein Konto. Berechnet wird erst das Modul-Abo." }] },
  footer: { blurb: "AYV Automation Stack hilft Betrieben beim Nachfassen, Buchen, Bezahltwerden und Zurückholen von Kunden.", modules: "Module", product: "Produkt", rights: "Alle Rechte vorbehalten." },
};

const nl: StackCopy = {
  ...en,
  nav: { ...en.nav, modules: "Modules", pricing: "Prijzen", how: "Hoe het werkt", contact: "Contact", start: "Aan de slag", login: "Inloggen", menu: "Menu openen", close: "Menu sluiten" },
  hero: { ...en.hero, title: "Automatiseer hoe je klanten wint en houdt.", body: "Zes modules voor het werk tussen een nieuwe lead en een terugkerende klant. Begin met één, of neem de hele stack.", primary: "Aan de slag", secondary: "Bekijk modules" },
  modules: { eyebrow: "De stack", title: "Eén systeem. Zes taken.", body: "Elke module doet één ding goed. Samen brengen ze een klant van het eerste contact naar de volgende afspraak.", learn: "Meer info" },
  pricing: { ...en.pricing, eyebrow: "Prijzen", title: "Start gratis. Voeg toe wat je nodig hebt.", body: "Maak een account zonder kosten. Koop één module, of neem ze allemaal samen.", starter: "Starter", starterBody: "Een werkruimte om te kijken voordat je abonneert.", starterFeatures: ["Account aanmaken", "Elke module bekijken", "Geen kosten tot je koopt"], module: "Eén module", moduleBody: "Kies de taak die je eerst wilt automatiseren.", moduleFeatures: ["Elke losse module", "Opent in je werkruimte", "Later meer toevoegen"], stack: "Volledige stack", stackBody: "Alle zes modules, geprijsd als één systeem.", stackFeatures: ["Van Leadflow tot Reviews", "De helft van het losse totaal", "Eén gekoppelde flow"], best: "Beste waarde", stackNote: "Bundelafrekenen is nog niet beschikbaar. Actieve modules kun je wel apart kopen.", choose: "Kies een module", seeStack: "Bekijk de stack" },
  how: { eyebrow: "Hoe het werkt", title: "Van de eerste lead naar de volgende review.", steps: [{ title: "Vang de lead", body: "Leadflow beantwoordt nieuwe aanvragen en houdt het gesprek gaande." }, { title: "Automatiseer de opvolging", body: "Bookflow, Followup en Payflow regelen de afspraak, de offerte en de factuur." }, { title: "Laat ze terugkomen", body: "Reactivate en Reviews halen oude klanten terug en vragen om de review." }] },
  proof: { eyebrow: "Tijdelijk", title: "Wat teams zeggen" },
  faq: { eyebrow: "FAQ", title: "Vragen, beantwoord.", items: [{ q: "Kan ik één module kopen in plaats van de stack?", a: "Ja. Elke module is een eigen product. De volledige stack is de bundel van alle zes." }, { q: "Is de stack-checkout live?", a: "Nog niet. Je kunt de beschikbare modules wel al één voor één nemen." }, { q: "Welke modules kan ik vandaag gebruiken?", a: "Leadflow, Bookflow, Followup en Payflow zijn beschikbaar. Reactivate en Reviews zijn nog in ontwikkeling." }, { q: "Kost een account iets?", a: "Nee. Starter is alleen een account. Je betaalt pas als je een module neemt." }] },
  footer: { blurb: "AYV Automation Stack helpt bedrijven opvolgen, inplannen, betaald krijgen en klanten terugbrengen.", modules: "Modules", product: "Product", rights: "Alle rechten voorbehouden." },
};

const copy: Record<AppLocale, StackCopy> = { en, fr, de, nl };

export function getStackCopy(locale: AppLocale) {
  return copy[locale];
}
