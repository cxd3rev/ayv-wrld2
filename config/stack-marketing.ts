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
  footer: { blurb: string; modules: string; product: string; rights: string };
};

const modulesEn: Record<ProductId, ModuleCopy> = {
  avyro: {
    line: "Captures a new lead from a form, ad, DM, or website chat and starts a personalized email or SMS follow-up before it goes cold.",
    features: [
      "Instant lead capture and response",
      "Automated multi-step follow-up sequences",
      "Lead scoring",
      "Hot-lead alerts",
      "Connects to forms, ads, and website chat",
    ],
  },
  velto: {
    line: "Lets clients book without the back-and-forth, then sends confirmation and reminder email or SMS, including 24 hours and 1 hour before.",
    features: [
      "Self-serve booking link",
      "Automated confirmation messages",
      "Reminders 24 hours and 1 hour before",
      "Fewer no-shows",
      "Automated reschedule handling",
    ],
  },
  rovyn: {
    line: "Follows a sent quote on a schedule, such as day 2, day 5, and day 10, until the prospect responds, then pauses.",
    features: [
      "Automated quote follow-up sequences",
      "Customizable follow-up timing",
      "Response tracking",
      "Nudges when a quote is about to expire",
      "Follow-up pauses once the client responds",
    ],
  },
  orvyn: {
    line: "Sends invoice reminders before and after the due date, firms up the tone when a payment is late, and tells you when it is paid.",
    features: [
      "Automated invoice reminders",
      "Escalating follow-up for overdue payments",
      "Payment confirmation notifications",
      "Overdue payment dashboard",
    ],
  },
  nexro: {
    line: "Contacts inactive customers with a win-back offer or check-in, and asks happy customers for a referral.",
    features: [
      "Win-back campaigns for inactive customers",
      "Referral request automation",
      "Referral incentive tracking",
      "Customer inactivity detection",
    ],
  },
  ravelo: {
    line: "Asks for a review after the job, sends happy clients to a public review site, and keeps unhappy feedback private first.",
    features: [
      "Automated post-service review requests",
      "Public review or private feedback routing",
      "Links for more than one review platform",
      "Review response tracking",
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
    starter: "Starter",
    starterBody: "For businesses testing automation with one workflow.",
    starterCta: "Start with one module",
    starterFeatures: [
      "1 module of your choice (Avyro, Velto, Rovyn, Orvyn, Nexro, or Ravelo)",
      "Up to 200 contacts/leads per month",
      "Email automation included",
      "Basic analytics dashboard",
      "Email support",
    ],
    growth: "Growth",
    growthBody: "For businesses ready to connect multiple workflows.",
    growthBadge: "Most popular",
    growthCta: "Start with Growth",
    growthFeatures: [
      "Choose any 3 modules",
      "Up to 1,000 contacts/leads per month",
      "Email + SMS automation included",
      "Advanced analytics + reporting",
      "Priority email support",
      "Save vs. buying modules separately",
    ],
    stack: "Full stack",
    stackBody: "The complete system — every module, fully connected.",
    stackCta: "Get the full stack",
    stackFeatures: [
      "All 6 modules included (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)",
      "Unlimited contacts/leads",
      "Email + SMS + WhatsApp automation",
      "Full analytics suite + monthly performance report",
      "Priority support + onboarding call",
      "Best value — save 35%+ vs. buying modules individually",
    ],
    note: "Not sure where to start? Most clients begin with Avyro or Ravelo, then add the rest of the stack once they see results.",
  },
  how: {
    eyebrow: "How it works",
    title: "From the first lead to the review.",
    steps: [
      { title: "Avyro takes the lead", body: "A form, ad, DM, or website chat starts an email or SMS follow-up, and you are told when the lead is hot." },
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
      { q: "Is the full stack checkout live?", a: "Not yet. You can subscribe to Avyro, Velto, Rovyn, and Orvyn one at a time." },
      { q: "Can I upgrade later?", a: "Yes — you can add modules or move up a plan anytime, no lock-in contract." },
      { q: "What happens if I go over my contact limit?", a: "We'll notify you before any charges apply, and you can upgrade instantly." },
      { q: "Is there a free trial?", a: "Yes — every plan includes a 14-day free trial, no card required." },
    ],
  },
  footer: {
    blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo follow the client from the first lead to the review.",
    modules: "Modules",
    product: "Product",
    rights: "All rights reserved.",
  },
};

const fr: StackCopy = {
  ...en,
  nav: { ...en.nav, pricing: "Tarifs", how: "Fonctionnement", start: "Commencer", login: "Connexion", menu: "Ouvrir le menu", close: "Fermer le menu" },
  hero: { ...en.hero, title: "Transformez les prospects en clients.", body: "Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo couvrent le travail du nouveau prospect jusqu’à l’avis. Commencez par Avyro, ajoutez les modules en ligne, ou prenez toute la stack.", primary: "Commencer", secondary: "Voir les modules" },
  modules: { eyebrow: "La stack", title: "Six modules. Un parcours client.", body: "Chaque module fait un travail. Ensemble, ils mènent un client de la demande au rendez-vous, au devis, au paiement, au retour et à l’avis.", learn: "En savoir plus" },
  moduleCopy: {
    avyro: { line: "Capture un nouveau prospect depuis un formulaire, une pub, un DM ou le chat du site, puis lance un suivi personnalisé par e-mail ou SMS.", features: ["Capture et réponse instantanées", "Séquences de relance en plusieurs étapes", "Score des prospects", "Alerte quand un prospect est chaud", "Connexion aux formulaires, pubs et chat du site"] },
    velto: { line: "Permet de réserver sans aller-retour, puis envoie une confirmation et des rappels par e-mail ou SMS, dont 24 h et 1 h avant.", features: ["Lien de réservation en libre-service", "Messages de confirmation automatiques", "Rappels 24 h et 1 h avant", "Moins d’absences", "Report géré automatiquement"] },
    rovyn: { line: "Relance un devis envoyé selon un calendrier, par exemple jour 2, jour 5 et jour 10, jusqu’à la réponse, puis s’arrête.", features: ["Séquences de relance de devis", "Calendrier de relance réglable", "Suivi des réponses", "Rappel quand un devis va expirer", "La relance s’arrête dès que le client répond"] },
    orvyn: { line: "Envoie des rappels de facture avant et après l’échéance, durcit le ton si le paiement est en retard, et signale quand c’est payé.", features: ["Rappels de facture automatiques", "Relance plus ferme pour les retards", "Notification quand le paiement arrive", "Tableau des paiements en retard"] },
    nexro: { line: "Contacte les clients inactifs avec une offre de retour ou un message, et demande un parrainage aux clients contents.", features: ["Campagnes de reconquête des clients inactifs", "Demandes de parrainage automatiques", "Suivi de l’incitation au parrainage", "Détection de l’inactivité"] },
    ravelo: { line: "Demande un avis après la prestation, envoie les clients contents vers un site d’avis public, et garde d’abord le mécontentement en privé.", features: ["Demandes d’avis après la prestation", "Avis public ou retour privé", "Liens vers plusieurs plateformes d’avis", "Suivi des réponses aux avis"] },
  },
  pricing: { ...en.pricing, eyebrow: "Tarifs", title: "Starter, Growth, ou la stack complète.", body: "Un seul flux, trois modules, ou tous les modules ensemble.", starterBody: "Pour les entreprises qui testent l’automatisation avec un seul flux.", starterCta: "Commencer avec un module", starterFeatures: ["1 module au choix (Avyro, Velto, Rovyn, Orvyn, Nexro ou Ravelo)", "Jusqu’à 200 contacts/prospects par mois", "Automatisation e-mail incluse", "Tableau de bord analytique de base", "Support par e-mail"], growthBody: "Pour les entreprises prêtes à relier plusieurs flux.", growthBadge: "Le plus choisi", growthCta: "Commencer avec Growth", growthFeatures: ["3 modules au choix", "Jusqu’à 1 000 contacts/prospects par mois", "Automatisation e-mail + SMS incluse", "Analyses avancées et rapports", "Support e-mail prioritaire", "Moins cher que les modules achetés séparément"], stack: "Stack complète", stackBody: "Le système complet — chaque module, connecté.", stackCta: "Prendre la stack complète", stackFeatures: ["Les 6 modules inclus (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Contacts/prospects illimités", "Automatisation e-mail + SMS + WhatsApp", "Suite analytique complète et rapport mensuel", "Support prioritaire et appel de mise en route", "Meilleur prix — plus de 35 % d’économie vs. les modules séparés"], note: "Vous ne savez pas par où commencer ? La plupart des clients commencent par Avyro ou Ravelo, puis ajoutent le reste de la stack quand ils voient les résultats." },
  how: { eyebrow: "Fonctionnement", title: "Du premier prospect à l’avis.", steps: [{ title: "Avyro prend le prospect", body: "Un formulaire, une pub, un DM ou le chat lance un suivi par e-mail ou SMS, et vous êtes prévenu quand le prospect est chaud." }, { title: "Velto, Rovyn et Orvyn font avancer le travail", body: "Velto réserve et rappelle. Rovyn relance le devis jusqu’à une réponse. Orvyn rappelle la facture et confirme le paiement." }, { title: "Nexro et Ravelo les font revenir", body: "Nexro contacte les clients inactifs et demande des parrainages. Ravelo demande l’avis et garde d’abord le mécontentement en privé." }] },
  proof: { eyebrow: "Espace réservé", title: "Ce que disent les équipes" },
  faq: { eyebrow: "FAQ", title: "Les questions, simplement.", items: [{ q: "Que contiennent Starter, Growth et la stack complète ?", a: "Starter, c’est un module au choix. Growth, ce sont trois modules au choix. La stack complète inclut les six : Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo." }, { q: "Puis-je acheter un seul module ?", a: "Oui. Starter, c’est un module au choix : Avyro, Velto, Rovyn, Orvyn, Nexro ou Ravelo." }, { q: "Le paiement de la stack est-il en ligne ?", a: "Pas encore. Vous pouvez vous abonner à Avyro, Velto, Rovyn et Orvyn un par un." }, { q: "Puis-je changer de formule plus tard ?", a: "Oui — vous pouvez ajouter des modules ou monter de formule à tout moment, sans engagement." }, { q: "Que se passe-t-il si je dépasse ma limite de contacts ?", a: "Nous vous prévenons avant tout frais, et vous pouvez monter de formule tout de suite." }, { q: "Y a-t-il un essai gratuit ?", a: "Oui — chaque formule inclut 14 jours d’essai, sans carte bancaire." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo suivent le client du premier prospect jusqu’à l’avis.", product: "Produit", rights: "Tous droits réservés." },
};

const de: StackCopy = {
  ...en,
  nav: { ...en.nav, modules: "Module", pricing: "Preise", how: "So funktioniert’s", contact: "Kontakt", start: "Loslegen", login: "Anmelden", menu: "Menü öffnen", close: "Menü schließen" },
  hero: { ...en.hero, title: "Verwandeln Sie Leads in Kunden.", body: "Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo decken den Weg von der Anfrage bis zur Bewertung ab. Starten Sie mit Avyro, ergänzen Sie die verfügbaren Module oder nehmen Sie den ganzen Stack.", primary: "Loslegen", secondary: "Module ansehen" },
  modules: { eyebrow: "Der Stack", title: "Sechs Module. Ein Kundenweg.", body: "Jedes Modul erledigt eine Aufgabe. Zusammen führen sie von der Anfrage zu Termin, Angebot, Zahlung, Rückkehr und Bewertung.", learn: "Mehr erfahren" },
  moduleCopy: {
    avyro: { line: "Erfasst eine neue Anfrage aus Formular, Anzeige, DM oder Website-Chat und startet eine persönliche E-Mail- oder SMS-Nachfassung.", features: ["Sofortige Erfassung und Antwort", "Mehrstufige Nachfass-Sequenzen", "Lead-Bewertung", "Hinweis, wenn ein Lead heiß ist", "Anbindung an Formulare, Anzeigen und Website-Chat"] },
    velto: { line: "Kunden buchen ohne Hin und Her. Danach gehen Bestätigung und Erinnerung per E-Mail oder SMS, auch 24 Stunden und 1 Stunde vorher.", features: ["Buchungslink zur Selbstbedienung", "Automatische Bestätigungen", "Erinnerungen 24 Stunden und 1 Stunde vorher", "Weniger Nichterscheinen", "Automatisches Verschieben"] },
    rovyn: { line: "Verfolgt ein gesendetes Angebot nach Plan, etwa Tag 2, Tag 5 und Tag 10, bis eine Antwort kommt, und stoppt dann.", features: ["Automatische Angebots-Nachfassung", "Einstellbare Zeitpunkte", "Antworten werden verfolgt", "Hinweis, kurz bevor ein Angebot ausläuft", "Nachfassung stoppt, sobald der Kunde antwortet"] },
    orvyn: { line: "Schickt Rechnungserinnerungen vor und nach dem Fälligkeitsdatum, wird bei Verzug bestimmter und meldet, wenn bezahlt wurde.", features: ["Automatische Rechnungserinnerungen", "Deutlicherer Ton bei überfälligen Zahlungen", "Meldung, wenn die Zahlung eingeht", "Übersicht überfälliger Zahlungen"] },
    nexro: { line: "Meldet sich bei inaktiven Kunden mit einem Rückgewinn-Angebot oder einer Nachfrage und bittet zufriedene Kunden um eine Empfehlung.", features: ["Rückgewinnung inaktiver Kunden", "Automatische Empfehlungsanfragen", "Verfolgung des Empfehlungsanreizes", "Erkennt, wenn ein Kunde inaktiv wird"] },
    ravelo: { line: "Bittet nach dem Auftrag um eine Bewertung, schickt zufriedene Kunden auf eine öffentliche Seite und hält unzufriedenes Feedback zuerst privat.", features: ["Bewertungsanfrage nach dem Auftrag", "Öffentliche Bewertung oder privates Feedback", "Links zu mehr als einer Bewertungsplattform", "Verfolgung der Antworten"] },
  },
  pricing: { ...en.pricing, eyebrow: "Preise", title: "Starter, Growth oder der volle Stack.", body: "Ein Ablauf, drei Module oder alle Module zusammen.", starterBody: "Für Betriebe, die Automatisierung mit einem Ablauf testen.", starterCta: "Mit einem Modul starten", starterFeatures: ["1 Modul nach Wahl (Avyro, Velto, Rovyn, Orvyn, Nexro oder Ravelo)", "Bis zu 200 Kontakte/Leads pro Monat", "E-Mail-Automatisierung inklusive", "Einfaches Analyse-Dashboard", "E-Mail-Support"], growthBody: "Für Betriebe, die mehrere Abläufe verbinden wollen.", growthBadge: "Am beliebtesten", growthCta: "Mit Growth starten", growthFeatures: ["Beliebige 3 Module", "Bis zu 1.000 Kontakte/Leads pro Monat", "E-Mail- und SMS-Automatisierung inklusive", "Erweiterte Analysen und Berichte", "Priorisierter E-Mail-Support", "Günstiger als der Einzelkauf der Module"], stack: "Voller Stack", stackBody: "Das komplette System — jedes Modul, verbunden.", stackCta: "Den vollen Stack holen", stackFeatures: ["Alle 6 Module (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Unbegrenzte Kontakte/Leads", "E-Mail-, SMS- und WhatsApp-Automatisierung", "Volle Analyse plus monatlicher Bericht", "Priorisierter Support und Einführungsgespräch", "Bester Preis — über 35 % günstiger als der Einzelkauf"], note: "Unsicher, wo Sie anfangen? Die meisten Kunden starten mit Avyro oder Ravelo und ergänzen den Rest, sobald sie Ergebnisse sehen." },
  how: { eyebrow: "So funktioniert’s", title: "Von der ersten Anfrage zur Bewertung.", steps: [{ title: "Avyro nimmt die Anfrage", body: "Formular, Anzeige, DM oder Chat starten eine E-Mail- oder SMS-Nachfassung, und Sie erfahren, wenn der Lead heiß ist." }, { title: "Velto, Rovyn und Orvyn führen den Auftrag", body: "Velto bucht und erinnert. Rovyn verfolgt das Angebot bis zur Antwort. Orvyn erinnert an die Rechnung und bestätigt die Zahlung." }, { title: "Nexro und Ravelo holen sie zurück", body: "Nexro kontaktiert inaktive Kunden und bittet um Empfehlungen. Ravelo fragt nach der Bewertung und hält unzufriedenes Feedback zuerst privat." }] },
  proof: { eyebrow: "Platzhalter", title: "Was Teams sagen" },
  faq: { eyebrow: "FAQ", title: "Fragen, beantwortet.", items: [{ q: "Was ist in Starter, Growth und dem vollen Stack?", a: "Starter ist ein Modul nach Wahl. Growth sind drei beliebige Module. Der volle Stack enthält alle sechs: Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo." }, { q: "Kann ich ein einzelnes Modul kaufen?", a: "Ja. Starter ist ein Modul nach Wahl: Avyro, Velto, Rovyn, Orvyn, Nexro oder Ravelo." }, { q: "Ist der Stack-Checkout live?", a: "Noch nicht. Avyro, Velto, Rovyn und Orvyn können Sie einzeln abonnieren." }, { q: "Kann ich später wechseln?", a: "Ja — Sie können jederzeit Module ergänzen oder den Plan erhöhen, ohne Vertragsbindung." }, { q: "Was passiert, wenn ich das Kontaktlimit überschreite?", a: "Wir melden uns, bevor Kosten entstehen, und Sie können sofort upgraden." }, { q: "Gibt es eine Testphase?", a: "Ja — jeder Plan enthält 14 Tage Test, ohne Karte." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo begleiten den Kunden von der Anfrage bis zur Bewertung.", modules: "Module", product: "Produkt", rights: "Alle Rechte vorbehalten." },
};

const nl: StackCopy = {
  ...en,
  nav: { ...en.nav, pricing: "Prijzen", how: "Hoe het werkt", start: "Aan de slag", login: "Inloggen", menu: "Menu openen", close: "Menu sluiten" },
  hero: { ...en.hero, title: "Zet leads om in klanten.", body: "Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo dekken het werk van een nieuwe lead tot de volgende review. Begin met Avyro, voeg de live modules toe, of neem de hele stack.", primary: "Aan de slag", secondary: "Bekijk modules" },
  modules: { eyebrow: "De stack", title: "Zes modules. Eén klantreis.", body: "Elke module doet één taak. Samen brengen ze een klant van de aanvraag naar een afspraak, een offerte, een betaling, een terugkomst en een review.", learn: "Meer info" },
  moduleCopy: {
    avyro: { line: "Vangt een nieuwe lead uit een formulier, advertentie, DM of websitechat en start een persoonlijke opvolging per e-mail of sms.", features: ["Direct een lead vangen en antwoorden", "Opvolgreeksen in meerdere stappen", "Leadscore", "Melding als een lead warm is", "Koppeling met formulieren, advertenties en websitechat"] },
    velto: { line: "Klanten boeken zonder heen-en-weer, daarna volgen een bevestiging en herinneringen per e-mail of sms, ook 24 uur en 1 uur van tevoren.", features: ["Boekingslink die de klant zelf gebruikt", "Automatische bevestigingen", "Herinneringen 24 uur en 1 uur van tevoren", "Minder no-shows", "Verzetten gaat automatisch"] },
    rovyn: { line: "Volgt een verstuurde offerte op een schema, bijvoorbeeld dag 2, dag 5 en dag 10, tot er een antwoord is, en stopt dan.", features: ["Automatische offerte-opvolging", "Instelbare tijdstippen", "Reacties worden bijgehouden", "Duw als een offerte bijna verloopt", "Opvolging stopt zodra de klant reageert"] },
    orvyn: { line: "Stuurt factuurherinneringen voor en na de vervaldatum, wordt stelliger bij een late betaling, en laat weten wanneer er betaald is.", features: ["Automatische factuurherinneringen", "Stevigere opvolging bij te late betalingen", "Melding als de betaling binnen is", "Overzicht van openstaande betalingen"] },
    nexro: { line: "Neemt contact op met inactieve klanten met een terugkomactie of een bericht, en vraagt tevreden klanten om een referral.", features: ["Terugwinacties voor inactieve klanten", "Automatische referralverzoeken", "Bijhouden van de referralbonus", "Ziet wanneer een klant inactief wordt"] },
    ravelo: { line: "Vraagt na de klus om een review, stuurt tevreden klanten naar een openbaar reviewplatform en houdt ontevreden feedback eerst privé.", features: ["Reviewverzoek na de klus", "Openbare review of privéfeedback", "Links naar meer dan één reviewplatform", "Bijhouden van reacties op reviews"] },
  },
  pricing: { ...en.pricing, eyebrow: "Prijzen", title: "Starter, Growth, of de volledige stack.", body: "Eén workflow, drie modules, of alle modules samen.", starterBody: "Voor bedrijven die automatisering met één workflow testen.", starterCta: "Start met één module", starterFeatures: ["1 module naar keuze (Avyro, Velto, Rovyn, Orvyn, Nexro of Ravelo)", "Tot 200 contacten/leads per maand", "E-mailautomatisering inbegrepen", "Eenvoudig analysedashboard", "E-mailsupport"], growthBody: "Voor bedrijven die meerdere workflows willen koppelen.", growthBadge: "Meest gekozen", growthCta: "Start met Growth", growthFeatures: ["Kies 3 modules", "Tot 1.000 contacten/leads per maand", "E-mail- en sms-automatisering inbegrepen", "Uitgebreide analyses en rapporten", "Prioriteit per e-mail", "Goedkoper dan de modules apart"], stack: "Volledige stack", stackBody: "Het complete systeem — elke module, verbonden.", stackCta: "Neem de volledige stack", stackFeatures: ["Alle 6 modules (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Onbeperkte contacten/leads", "E-mail-, sms- en WhatsApp-automatisering", "Volledige analyse plus maandelijks rapport", "Prioriteitssupport en een onboardingsgesprek", "Beste prijs — meer dan 35% goedkoper dan losse modules"], note: "Weet je niet waar je begint? De meeste klanten starten met Avyro of Ravelo en voegen de rest toe zodra ze resultaat zien." },
  how: { eyebrow: "Hoe het werkt", title: "Van de eerste lead naar de review.", steps: [{ title: "Avyro pakt de lead", body: "Een formulier, advertentie, DM of chat start een opvolging per e-mail of sms, en je hoort het als de lead warm is." }, { title: "Velto, Rovyn en Orvyn doen het werk", body: "Velto plant en herinnert. Rovyn volgt de offerte tot er een antwoord is. Orvyn herinnert aan de factuur en bevestigt de betaling." }, { title: "Nexro en Ravelo brengen ze terug", body: "Nexro benadert inactieve klanten en vraagt om referrals. Ravelo vraagt de review en houdt ontevreden feedback eerst privé." }] },
  proof: { eyebrow: "Tijdelijk", title: "Wat teams zeggen" },
  faq: { eyebrow: "FAQ", title: "Vragen, beantwoord.", items: [{ q: "Wat zit er in Starter, Growth en de volledige stack?", a: "Starter is één module naar keuze. Growth is drie modules naar keuze. De volledige stack bevat alle zes: Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo." }, { q: "Kan ik één module kopen?", a: "Ja. Starter is één module naar keuze: Avyro, Velto, Rovyn, Orvyn, Nexro of Ravelo." }, { q: "Is de stack-checkout live?", a: "Nog niet. Je kunt Avyro, Velto, Rovyn en Orvyn één voor één nemen." }, { q: "Kan ik later upgraden?", a: "Ja — je kunt op elk moment modules toevoegen of een hoger plan nemen, zonder contract." }, { q: "Wat als ik over mijn contactlimiet ga?", a: "We laten het weten voordat er kosten bijkomen, en je kunt meteen upgraden." }, { q: "Is er een proefperiode?", a: "Ja — elk plan heeft 14 dagen proef, zonder kaart." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo volgen de klant van de eerste lead tot de review.", product: "Product", rights: "Alle rechten voorbehouden." },
};

const copy: Record<AppLocale, StackCopy> = { en, fr, de, nl };

export function getStackCopy(locale: AppLocale) {
  return copy[locale];
}
