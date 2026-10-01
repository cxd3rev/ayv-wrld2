import type { AppLocale } from "@/i18n/config";
import type { ProductId } from "@/config/products";

export type HomeCopy = {
  products: string;
  how: string;
  pricing: string;
  login: string;
  tryNow: string;
  menu: string;
  close: string;
  headline: [string, string];
  subtext: string;
  demo: string;
  trust: string;
  learn: string;
  lines: Record<ProductId, string>;
};

const en: HomeCopy = {
  products: "Products",
  how: "How It Works",
  pricing: "Pricing",
  login: "Login",
  tryNow: "Try Now",
  menu: "Open menu",
  close: "Close menu",
  headline: ["Automation That Runs Your Business.", "You Just Collect The Results."],
  subtext: "AYV Stack Automation handles lead conversion, bookings, follow-ups, invoicing, reactivation, and reviews.",
  demo: "Book a Demo",
  trust: "Trusted by businesses across Belgium & the Netherlands.",
  learn: "Learn more",
  lines: {
    avyro: "Turns leads into booked calls, automatically.",
    velto: "Sends the booking reminder on the date you set.",
    rovyn: "Follows the quote until there is a reply.",
    orvyn: "Reminds them about the invoice until it is paid.",
    nexro: "Brings quiet customers back and asks for a referral.",
    ravelo: "Asks for the review on the date you choose.",
  },
};

const nl: HomeCopy = {
  ...en,
  products: "Producten",
  how: "Hoe het werkt",
  pricing: "Prijzen",
  login: "Inloggen",
  tryNow: "Probeer nu",
  menu: "Menu openen",
  close: "Menu sluiten",
  headline: ["Automatisering die je bedrijf draait.", "Jij haalt de resultaten op."],
  subtext: "AYV Stack Automation doet leadconversie, boekingen, opvolging, facturatie, heractivatie en reviews.",
  demo: "Boek een demo",
  trust: "Vertrouwd door bedrijven in België en Nederland.",
  learn: "Meer info",
  lines: {
    avyro: "Zet leads om in geboekte gesprekken, automatisch.",
    velto: "Stuurt de boekingsherinnering op de datum die je kiest.",
    rovyn: "Volgt de offerte tot er een antwoord is.",
    orvyn: "Herinnert aan de factuur tot die betaald is.",
    nexro: "Haalt stille klanten terug en vraagt een referral.",
    ravelo: "Vraagt de review op de datum die je kiest.",
  },
};

const fr: HomeCopy = {
  ...en,
  products: "Produits",
  how: "Fonctionnement",
  pricing: "Tarifs",
  login: "Connexion",
  tryNow: "Essayer",
  menu: "Ouvrir le menu",
  close: "Fermer le menu",
  headline: ["L’automatisation qui fait tourner votre entreprise.", "Vous ne faites que récolter les résultats."],
  subtext: "AYV Stack Automation gère la conversion, les réservations, les relances, la facturation, la réactivation et les avis.",
  demo: "Réserver une démo",
  trust: "La confiance d’entreprises en Belgique et aux Pays-Bas.",
  learn: "En savoir plus",
  lines: {
    avyro: "Transforme les prospects en rendez-vous, automatiquement.",
    velto: "Envoie le rappel de réservation à la date choisie.",
    rovyn: "Relance le devis jusqu’à une réponse.",
    orvyn: "Rappelle la facture jusqu’au paiement.",
    nexro: "Fait revenir les clients silencieux et demande un parrainage.",
    ravelo: "Demande l’avis à la date que vous choisissez.",
  },
};

const de: HomeCopy = {
  ...en,
  products: "Produkte",
  how: "So funktioniert’s",
  pricing: "Preise",
  login: "Anmelden",
  tryNow: "Jetzt testen",
  menu: "Menü öffnen",
  close: "Menü schließen",
  headline: ["Automatisierung, die Ihr Geschäft führt.", "Sie holen nur die Ergebnisse ab."],
  subtext: "AYV Stack Automation übernimmt Lead-Umwandlung, Buchungen, Nachfassen, Rechnungen, Rückgewinnung und Bewertungen.",
  demo: "Demo buchen",
  trust: "Vertraut von Betrieben in Belgien und den Niederlanden.",
  learn: "Mehr erfahren",
  lines: {
    avyro: "Macht aus Leads gebuchte Gespräche, automatisch.",
    velto: "Schickt die Buchungserinnerung am gewählten Datum.",
    rovyn: "Fasst das Angebot nach, bis eine Antwort kommt.",
    orvyn: "Erinnert an die Rechnung, bis sie bezahlt ist.",
    nexro: "Holt stille Kunden zurück und bittet um eine Empfehlung.",
    ravelo: "Bittet um die Bewertung am gewählten Datum.",
  },
};

const copy: Record<AppLocale, HomeCopy> = { en, nl, fr, de };

export function getHomeCopy(locale: AppLocale) {
  return copy[locale];
}
