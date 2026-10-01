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
  early: string;
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  footer: { blurb: string; modules: string; product: string; rights: string; terms: string; privacy: string };
};

const modulesEn: Record<ProductId, ModuleCopy> = {
  avyro: {
    line: "Shortly after an appointment or purchase, Avyro sends a short check-in asking how it went.",
    features: [
      "A short check-in after the service",
      "A positive reply starts a Ravelo review request",
      "A negative or neutral reply comes to you first",
    ],
  },
  velto: {
    line: "For a recurring service, membership, or contract, Velto reminds the client before the renewal date.",
    features: [
      "A reminder before the renewal, so it does not lapse by accident",
      "Built for memberships, contracts, and recurring services",
      "If they still do not renew, Velto flags Rovyn",
    ],
  },
  rovyn: {
    line: "Rovyn watches how often each client usually visits or buys, and flags anyone who has gone quiet.",
    features: [
      "Each client is compared with their own usual pattern",
      "Quiet clients are flagged before they are gone",
      "A flag starts a Nexro win-back",
    ],
  },
  orvyn: {
    line: "Orvyn spots repeat clients and can send a small thank-you or reward.",
    features: [
      "Repeat clients are recognised, such as 3 or more visits",
      "A thank-you or a small reward",
      "That loyal group is passed to Nexro for referrals",
    ],
  },
  nexro: {
    line: "Nexro wins back quiet clients and asks loyal ones for a referral, including messages you send yourself.",
    features: [
      "Win-backs start when Rovyn flags a quiet client",
      "Referral asks go to loyal clients from Orvyn",
      "You can still send a message by hand",
    ],
  },
  ravelo: {
    line: "Ravelo asks for a review when Avyro hears the visit went well, and when you ask yourself.",
    features: [
      "A review request after a positive Avyro check-in",
      "Requests you send yourself",
      "Unhappy check-ins stay with you",
    ],
  },
};

const en: StackCopy = {
  nav: { modules: "Modules", pricing: "Pricing", how: "How it works", contact: "Contact", start: "Get started", login: "Log in", menu: "Open menu", close: "Close menu" },
  hero: {
    eyebrow: "AYV Automation Stack",
    title: "Keep The Clients You Already Have.",
    body: "Six modules check in after a service, catch renewal lapses, spot who is going quiet, reward loyal clients, win back the ones who left, and ask happy clients for reviews. It gets sharper as more modules are connected.",
    primary: "Get started",
    secondary: "View modules",
  },
  modules: {
    eyebrow: "The stack",
    title: "Six modules. One client journey.",
    body: "Each module does one job. Together they look after the clients you already have: the check-in, the renewal, the quiet stretch, the thank-you, the win-back, and the review.",
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
      "Up to 200 contacts per month",
      "Automatic check-ins, reminders, and win-backs",
      "Shared calendar and client history",
      "Email support",
    ],
    growth: "Growth",
    growthBody: "For businesses ready to connect multiple workflows.",
    growthBadge: "Most popular",
    growthCta: "Start with Growth",
    growthFeatures: [
      "Choose any 3 modules",
      "Up to 1,000 contacts per month",
      "Automatic check-ins, reminders, and win-backs",
      "Shared calendar across the three modules",
      "Priority email support",
      "Save vs. buying modules separately",
    ],
    stack: "Full stack",
    stackBody: "The complete system — every module, fully connected.",
    stackCta: "Get the full stack",
    stackFeatures: [
      "All 6 modules included (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)",
      "Unlimited contacts",
      "Automatic check-ins, reminders, and win-backs",
      "Shared calendar across all six modules",
      "Priority email support",
      "Best value — save 35%+ vs. buying modules individually",
    ],
    note: "Not sure where to start? Most clients begin with Avyro or Ravelo, then add the rest of the stack once they see results.",
  },
  how: {
    eyebrow: "How it works",
    title: "From the visit to the next one.",
    steps: [
      { title: "Avyro checks in after every service", body: "A positive reply is handed to Ravelo for a review request. A negative or neutral reply comes to you, so you can handle it privately." },
      { title: "Velto and Rovyn catch the drift", body: "Velto watches renewal dates. Rovyn watches each client's own visit pattern. Together they notice someone slipping away before they are gone." },
      { title: "Orvyn rewards, Nexro brings them back", body: "Orvyn thanks loyal clients and passes them to Nexro. Nexro wins back the ones Rovyn flagged and asks the best ones for a referral." },
    ],
  },
  early: "New in Belgium — early clients get personal onboarding.",
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
    blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo keep the clients you already have, and ask the happy ones to come back.",
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
  hero: { ...en.hero, title: "Gardez les clients que vous avez déjà.", body: "Six modules prennent des nouvelles après une prestation, rattrapent les renouvellements oubliés, repèrent qui se fait rare, remercient les clients fidèles, ramènent ceux qui sont partis et demandent un avis aux clients contents. Plus les modules sont reliés, plus c’est précis.", primary: "Commencer", secondary: "Voir les modules" },
  modules: { eyebrow: "La stack", title: "Six modules. Un parcours client.", body: "Chaque module fait un travail. Ensemble, ils s’occupent des clients que vous avez déjà : le suivi, le renouvellement, le silence, le remerciement, la reconquête et l’avis.", learn: "En savoir plus" },
  moduleCopy: {
    avyro: { line: "Peu après un rendez-vous ou un achat, Avyro envoie un court message pour demander comment ça s’est passé.", features: ["Un court suivi après la prestation", "Une réponse positive lance une demande d’avis Ravelo", "Une réponse négative ou neutre vous arrive d’abord"] },
    velto: { line: "Pour un service récurrent, un abonnement ou un contrat, Velto rappelle le client avant la date de renouvellement.", features: ["Un rappel avant le renouvellement, pour éviter un oubli", "Pensé pour les abonnements, contrats et services récurrents", "S’ils ne renouvellent pas, Velto le signale à Rovyn"] },
    rovyn: { line: "Rovyn suit le rythme habituel de chaque client et signale ceux qui se font rares.", features: ["Chaque client est comparé à son propre rythme", "Les clients silencieux sont signalés avant qu’ils ne partent", "Un signal lance une reconquête Nexro"] },
    orvyn: { line: "Orvyn repère les clients fidèles et peut leur envoyer un petit remerciement ou une récompense.", features: ["Les clients réguliers sont reconnus, par exemple dès 3 visites", "Un remerciement ou une petite récompense", "Ce groupe fidèle est transmis à Nexro pour des parrainages"] },
    nexro: { line: "Nexro ramène les clients silencieux et demande un parrainage aux clients fidèles, en plus des messages que vous envoyez vous-même.", features: ["Les reconquêtes partent quand Rovyn signale un client silencieux", "Les demandes de parrainage vont aux clients fidèles d’Orvyn", "Vous pouvez encore envoyer un message vous-même"] },
    ravelo: { line: "Ravelo demande un avis quand Avyro entend que la visite s’est bien passée, et quand vous le demandez vous-même.", features: ["Une demande d’avis après un suivi Avyro positif", "Les demandes que vous envoyez vous-même", "Les suivis négatifs restent chez vous"] },
  },
  pricing: { ...en.pricing, excludingTax: "Hors taxes", month: "/ mois", eyebrow: "Tarifs", title: "Starter, Growth, ou la stack complète.", body: "Un seul flux, trois modules, ou tous les modules ensemble.", starterBody: "Pour les entreprises qui testent l’automatisation avec un seul flux.", starterCta: "Commencer avec un module", starterFeatures: ["1 module au choix (Avyro, Velto, Rovyn, Orvyn, Nexro ou Ravelo)", "Jusqu’à 200 contacts par mois", "Suivis, rappels et reconquêtes automatiques", "Calendrier partagé et historique client", "Support par e-mail"], growthBody: "Pour les entreprises prêtes à relier plusieurs flux.", growthBadge: "Le plus choisi", growthCta: "Commencer avec Growth", growthFeatures: ["3 modules au choix", "Jusqu’à 1 000 contacts par mois", "Suivis, rappels et reconquêtes automatiques", "Calendrier partagé sur les trois modules", "Support e-mail prioritaire", "Moins cher que les modules achetés séparément"], stack: "Stack complète", stackBody: "Le système complet — chaque module, connecté.", stackCta: "Prendre la stack complète", stackFeatures: ["Les 6 modules inclus (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Contacts illimités", "Suivis, rappels et reconquêtes automatiques", "Calendrier partagé sur les six modules", "Support e-mail prioritaire", "Meilleur prix — plus de 35 % d’économie vs. les modules séparés"], note: "Vous ne savez pas par où commencer ? La plupart des clients commencent par Avyro ou Ravelo, puis ajoutent le reste de la stack quand ils voient les résultats." },
  how: { eyebrow: "Fonctionnement", title: "De la visite à la suivante.", steps: [{ title: "Avyro prend des nouvelles après chaque prestation", body: "Une réponse positive part vers Ravelo pour une demande d’avis. Une réponse négative ou neutre vous arrive, pour la traiter en privé." }, { title: "Velto et Rovyn voient qui s’éloigne", body: "Velto surveille les dates de renouvellement. Rovyn surveille le rythme de visite de chaque client. Ensemble, ils repèrent quelqu’un avant qu’il ne parte." }, { title: "Orvyn remercie, Nexro ramène", body: "Orvyn remercie les clients fidèles et les transmet à Nexro. Nexro ramène ceux que Rovyn a signalés et demande un parrainage aux meilleurs." }] },
  early: "Nouveau en Belgique — les premiers clients reçoivent un accompagnement personnel.",
  faq: { eyebrow: "FAQ", title: "Les questions, simplement.", items: [{ q: "Que contiennent Starter, Growth et la stack complète ?", a: "Starter, c’est un module au choix. Growth, ce sont trois modules au choix. La stack complète inclut les six : Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo." }, { q: "Puis-je acheter un seul module ?", a: "Oui. Starter, c’est un module au choix : Avyro, Velto, Rovyn, Orvyn, Nexro ou Ravelo." }, { q: "Le paiement de la stack est-il en ligne ?", a: "Oui. Un module coûte 39 € par mois. Growth coûte 79 € par mois pour trois modules. La stack complète coûte 149 € par mois pour les six. Hors taxes." }, { q: "Puis-je changer de formule plus tard ?", a: "Oui — vous pouvez ajouter des modules ou monter de formule à tout moment, sans engagement." }, { q: "Que se passe-t-il si je dépasse ma limite de contacts ?", a: "Les nouveaux enregistrements s’arrêtent pour le reste du mois. Passez à Growth ou à la stack complète pour augmenter la limite. Il n’y a pas de frais en plus." }, { q: "Y a-t-il un essai gratuit ?", a: "Oui. Chaque formule commence par 7 jours gratuits. Une carte est demandée, et le paiement commence à la fin de l’essai." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo gardent les clients que vous avez déjà, et demandent aux clients contents de revenir.", product: "Produit", rights: "Tous droits réservés.", terms: "Conditions", privacy: "Confidentialité" },
};

const de: StackCopy = {
  ...en,
  nav: { ...en.nav, modules: "Module", pricing: "Preise", how: "So funktioniert’s", contact: "Kontakt", start: "Loslegen", login: "Anmelden", menu: "Menü öffnen", close: "Menü schließen" },
  hero: { ...en.hero, title: "Behalten Sie die Kunden, die Sie schon haben.", body: "Sechs Module fragen nach dem Termin nach, fangen verpasste Verlängerungen ab, erkennen wer still wird, danken treuen Kunden, holen Abgewanderte zurück und bitten zufriedene Kunden um eine Bewertung. Je mehr Module verbunden sind, desto genauer wird es.", primary: "Loslegen", secondary: "Module ansehen" },
  modules: { eyebrow: "Der Stack", title: "Sechs Module. Ein Kundenweg.", body: "Jedes Modul erledigt eine Aufgabe. Zusammen kümmern sie sich um die Kunden, die Sie schon haben: Nachfrage, Verlängerung, Stille, Dank, Rückgewinnung und Bewertung.", learn: "Mehr erfahren" },
  moduleCopy: {
    avyro: { line: "Kurz nach einem Termin oder Kauf schickt Avyro eine kurze Nachfrage, wie es gelaufen ist.", features: ["Eine kurze Nachfrage nach der Leistung", "Eine positive Antwort startet eine Ravelo-Bewertungsanfrage", "Eine negative oder neutrale Antwort erreicht zuerst Sie"] },
    velto: { line: "Bei einem wiederkehrenden Service, einer Mitgliedschaft oder einem Vertrag erinnert Velto vor dem Verlängerungsdatum.", features: ["Eine Erinnerung vor der Verlängerung, damit sie nicht versehentlich ausläuft", "Für Mitgliedschaften, Verträge und wiederkehrende Services", "Wenn sie nicht verlängern, meldet Velto das an Rovyn"] },
    rovyn: { line: "Rovyn merkt sich, wie oft jeder Kunde normalerweise kommt oder kauft, und markiert, wer still geworden ist.", features: ["Jeder Kunde wird mit seinem eigenen Rhythmus verglichen", "Stille Kunden werden markiert, bevor sie weg sind", "Eine Markierung startet eine Nexro-Rückgewinnung"] },
    orvyn: { line: "Orvyn erkennt Stammkunden und kann ein kleines Dankeschön oder eine Belohnung schicken.", features: ["Stammkunden werden erkannt, zum Beispiel ab 3 Besuchen", "Ein Dankeschön oder eine kleine Belohnung", "Diese treue Gruppe geht an Nexro für Empfehlungen"] },
    nexro: { line: "Nexro holt stille Kunden zurück und bittet treue um eine Empfehlung, zusätzlich zu Nachrichten, die Sie selbst schicken.", features: ["Rückgewinnung startet, wenn Rovyn einen stillen Kunden markiert", "Empfehlungsbitten gehen an treue Kunden von Orvyn", "Sie können weiterhin selbst eine Nachricht schicken"] },
    ravelo: { line: "Ravelo bittet um eine Bewertung, wenn Avyro hört, dass der Besuch gut war, und wenn Sie selbst fragen.", features: ["Eine Bewertungsanfrage nach einer positiven Avyro-Nachfrage", "Anfragen, die Sie selbst schicken", "Unzufriedene Nachfragen bleiben bei Ihnen"] },
  },
  pricing: { ...en.pricing, excludingTax: "zzgl. MwSt.", month: "/ Monat", eyebrow: "Preise", title: "Starter, Growth oder der volle Stack.", body: "Ein Ablauf, drei Module oder alle Module zusammen.", starterBody: "Für Betriebe, die Automatisierung mit einem Ablauf testen.", starterCta: "Mit einem Modul starten", starterFeatures: ["1 Modul nach Wahl (Avyro, Velto, Rovyn, Orvyn, Nexro oder Ravelo)", "Bis zu 200 Kontakte pro Monat", "Automatische Nachfragen, Erinnerungen und Rückgewinnung", "Gemeinsamer Kalender und Kundenhistorie", "E-Mail-Support"], growthBody: "Für Betriebe, die mehrere Abläufe verbinden wollen.", growthBadge: "Am beliebtesten", growthCta: "Mit Growth starten", growthFeatures: ["Beliebige 3 Module", "Bis zu 1.000 Kontakte pro Monat", "Automatische Nachfragen, Erinnerungen und Rückgewinnung", "Gemeinsamer Kalender über die drei Module", "Priorisierter E-Mail-Support", "Günstiger als der Einzelkauf der Module"], stack: "Voller Stack", stackBody: "Das komplette System — jedes Modul, verbunden.", stackCta: "Den vollen Stack holen", stackFeatures: ["Alle 6 Module (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Unbegrenzte Kontakte", "Automatische Nachfragen, Erinnerungen und Rückgewinnung", "Gemeinsamer Kalender über alle sechs Module", "Priorisierter E-Mail-Support", "Bester Preis — über 35 % günstiger als der Einzelkauf"], note: "Unsicher, wo Sie anfangen? Die meisten Kunden starten mit Avyro oder Ravelo und ergänzen den Rest, sobald sie Ergebnisse sehen." },
  how: { eyebrow: "So funktioniert’s", title: "Vom Besuch zum nächsten.", steps: [{ title: "Avyro fragt nach jeder Leistung nach", body: "Eine positive Antwort geht an Ravelo für eine Bewertungsanfrage. Eine negative oder neutrale Antwort kommt zu Ihnen, damit Sie sie privat klären." }, { title: "Velto und Rovyn merken, wer abdriftet", body: "Velto achtet auf Verlängerungsdaten. Rovyn achtet auf das Besuchsmuster jedes Kunden. Zusammen sehen sie jemanden, bevor er weg ist." }, { title: "Orvyn dankt, Nexro holt zurück", body: "Orvyn dankt treuen Kunden und gibt sie an Nexro. Nexro holt die von Rovyn markierten zurück und bittet die besten um eine Empfehlung." }] },
  early: "Neu in Belgien — frühe Kunden erhalten eine persönliche Einführung.",
  faq: { eyebrow: "FAQ", title: "Fragen, beantwortet.", items: [{ q: "Was ist in Starter, Growth und dem vollen Stack?", a: "Starter ist ein Modul nach Wahl. Growth sind drei beliebige Module. Der volle Stack enthält alle sechs: Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo." }, { q: "Kann ich ein einzelnes Modul kaufen?", a: "Ja. Starter ist ein Modul nach Wahl: Avyro, Velto, Rovyn, Orvyn, Nexro oder Ravelo." }, { q: "Ist der Stack-Checkout live?", a: "Ja. Ein Modul kostet 39 € pro Monat. Growth kostet 79 € pro Monat für drei Module. Der volle Stack kostet 149 € pro Monat für alle sechs. Zuzüglich MwSt." }, { q: "Kann ich später wechseln?", a: "Ja — Sie können jederzeit Module ergänzen oder den Plan erhöhen, ohne Vertragsbindung." }, { q: "Was passiert, wenn ich das Kontaktlimit überschreite?", a: "Neue Einträge stoppen für den Rest des Monats. Wechseln Sie zu Growth oder zum vollen Stack, um das Limit zu erhöhen. Es gibt keine Zusatzkosten." }, { q: "Gibt es eine Testphase?", a: "Ja. Jeder Plan beginnt mit 7 kostenlosen Tagen. Eine Karte ist nötig, und die Abrechnung startet nach der Testphase." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo behalten die Kunden, die Sie schon haben, und bitten die zufriedenen um eine Rückkehr.", modules: "Module", product: "Produkt", rights: "Alle Rechte vorbehalten.", terms: "AGB", privacy: "Datenschutz" },
};

const nl: StackCopy = {
  ...en,
  nav: { ...en.nav, pricing: "Prijzen", how: "Hoe het werkt", start: "Aan de slag", login: "Inloggen", menu: "Menu openen", close: "Menu sluiten" },
  hero: { ...en.hero, title: "Houd de klanten die je al hebt.", body: "Zes modules checken in na een afspraak, vangen gemiste verlengingen, zien wie stil wordt, belonen trouwe klanten, winnen wie wegbleef terug en vragen blije klanten om een review. Hoe meer modules verbonden zijn, hoe scherper het wordt.", primary: "Aan de slag", secondary: "Bekijk modules" },
  modules: { eyebrow: "De stack", title: "Zes modules. Eén klantreis.", body: "Elke module doet één taak. Samen zorgen ze voor de klanten die je al hebt: de check-in, de verlenging, de stilte, het bedankje, de terugwinning en de review.", learn: "Meer info" },
  moduleCopy: {
    avyro: { line: "Kort na een afspraak of aankoop stuurt Avyro een korte check-in: hoe is het gegaan?", features: ["Een korte check-in na de afspraak", "Een positief antwoord start een Ravelo-reviewverzoek", "Een negatief of neutraal antwoord komt eerst bij jou"] },
    velto: { line: "Voor een terugkerende dienst, lidmaatschap of contract herinnert Velto de klant vóór de verlengdatum.", features: ["Een herinnering vóór de verlenging, zodat die niet per ongeluk vervalt", "Voor lidmaatschappen, contracten en terugkerende diensten", "Blijft de verlenging uit, dan seint Velto Rovyn"] },
    rovyn: { line: "Rovyn volgt hoe vaak elke klant normaal komt of koopt, en markeert wie opvallend stil is.", features: ["Elke klant wordt vergeleken met het eigen ritme", "Stille klanten worden gemarkeerd voordat ze weg zijn", "Een markering start een Nexro-terugwinning"] },
    orvyn: { line: "Orvyn herkent terugkerende klanten en kan een klein bedankje of een beloning sturen.", features: ["Terugkerende klanten worden herkend, bijvoorbeeld vanaf 3 bezoeken", "Een bedankje of een kleine beloning", "Die trouwe groep gaat naar Nexro voor referrals"] },
    nexro: { line: "Nexro haalt stille klanten terug en vraagt trouwe klanten om een referral, plus berichten die je zelf stuurt.", features: ["Terugwinning start als Rovyn een stille klant markeert", "Referralverzoeken gaan naar trouwe klanten van Orvyn", "Je kunt nog steeds zelf een bericht sturen"] },
    ravelo: { line: "Ravelo vraagt een review als Avyro hoort dat het goed ging, en als je het zelf vraagt.", features: ["Een reviewverzoek na een positieve Avyro-check-in", "Verzoeken die je zelf stuurt", "Ontevreden check-ins blijven bij jou"] },
  },
  pricing: { ...en.pricing, excludingTax: "Exclusief btw", month: "/ maand", eyebrow: "Prijzen", title: "Starter, Growth, of de volledige stack.", body: "Eén workflow, drie modules, of alle modules samen.", starterBody: "Voor bedrijven die automatisering met één workflow testen.", starterCta: "Start met één module", starterFeatures: ["1 module naar keuze (Avyro, Velto, Rovyn, Orvyn, Nexro of Ravelo)", "Tot 200 contacten per maand", "Automatische check-ins, herinneringen en terugwinacties", "Gedeelde agenda en klantgeschiedenis", "E-mailsupport"], growthBody: "Voor bedrijven die meerdere workflows willen koppelen.", growthBadge: "Meest gekozen", growthCta: "Start met Growth", growthFeatures: ["Kies 3 modules", "Tot 1.000 contacten per maand", "Automatische check-ins, herinneringen en terugwinacties", "Gedeelde agenda over de drie modules", "Prioriteit per e-mail", "Goedkoper dan de modules apart"], stack: "Volledige stack", stackBody: "Het complete systeem — elke module, verbonden.", stackCta: "Neem de volledige stack", stackFeatures: ["Alle 6 modules (Avyro, Velto, Rovyn, Orvyn, Nexro, Ravelo)", "Onbeperkte contacten", "Automatische check-ins, herinneringen en terugwinacties", "Gedeelde agenda over alle zes modules", "Prioriteit per e-mail", "Beste prijs — meer dan 35% goedkoper dan losse modules"], note: "Weet je niet waar je begint? De meeste klanten starten met Avyro of Ravelo en voegen de rest toe zodra ze resultaat zien." },
  how: { eyebrow: "Hoe het werkt", title: "Van het bezoek naar het volgende.", steps: [{ title: "Avyro checkt in na elke afspraak", body: "Een positief antwoord gaat naar Ravelo voor een reviewverzoek. Een negatief of neutraal antwoord komt bij jou, zodat je het privé kunt oplossen." }, { title: "Velto en Rovyn zien wie afdrijft", body: "Velto let op verlengdatums. Rovyn let op het bezoekpatroon van elke klant. Samen zien ze iemand wegglijden voordat die weg is." }, { title: "Orvyn bedankt, Nexro haalt terug", body: "Orvyn bedankt trouwe klanten en geeft ze door aan Nexro. Nexro haalt terug wie Rovyn markeerde en vraagt de besten om een referral." }] },
  early: "Nieuw in België — vroege klanten krijgen persoonlijke onboarding.",
  faq: { eyebrow: "FAQ", title: "Vragen, beantwoord.", items: [{ q: "Wat zit er in Starter, Growth en de volledige stack?", a: "Starter is één module naar keuze. Growth is drie modules naar keuze. De volledige stack bevat alle zes: Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo." }, { q: "Kan ik één module kopen?", a: "Ja. Starter is één module naar keuze: Avyro, Velto, Rovyn, Orvyn, Nexro of Ravelo." }, { q: "Is de stack-checkout live?", a: "Ja. Eén module is €39 per maand. Growth is €79 per maand voor drie modules. De volledige stack is €149 per maand voor alle zes. Exclusief btw." }, { q: "Kan ik later upgraden?", a: "Ja — je kunt op elk moment modules toevoegen of een hoger plan nemen, zonder contract." }, { q: "Wat als ik over mijn contactlimiet ga?", a: "Nieuwe records stoppen voor de rest van de maand. Upgrade naar Growth of de volledige stack om de limiet te verhogen. Er komen geen extra kosten bij." }, { q: "Is er een proefperiode?", a: "Ja. Elk plan begint met 7 gratis dagen. Je koppelt een kaart, en de betaling start als de proef voorbij is." }] },
  footer: { ...en.footer, blurb: "Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo houden de klanten die je al hebt, en vragen de blije om terug te komen.", product: "Product", rights: "Alle rechten voorbehouden.", terms: "Voorwaarden", privacy: "Privacy" },
};

const copy: Record<AppLocale, StackCopy> = { en, fr, de, nl };

export function getStackCopy(locale: AppLocale) {
  return copy[locale];
}
