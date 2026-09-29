import type { AppLocale } from "@/i18n/config";
import { BUSINESS } from "@/lib/business";

export const legalContact = BUSINESS.email;

const countryLabel = {
  en: "Belgium",
  nl: "België",
  fr: "Belgique",
  de: "Belgien",
} as const;

const kboLabel = {
  en: "Enterprise number (KBO)",
  nl: "Ondernemingsnummer (KBO)",
  fr: "Numéro d'entreprise (KBO)",
  de: "Unternehmensnummer (KBO)",
} as const;

function identityDetails(locale: AppLocale) {
  const details: string[] = [];
  if (BUSINESS.address.trim()) details.push(BUSINESS.address.trim());
  if (BUSINESS.enterpriseNumber.trim()) details.push(`${kboLabel[locale]}: ${BUSINESS.enterpriseNumber.trim()}`);
  return details;
}

function providerIntro(locale: AppLocale, rest: string) {
  const lead = {
    en: `This service is provided by ${BUSINESS.name}, run by ${BUSINESS.owner}, ${countryLabel.en}.`,
    nl: `Deze dienst wordt geleverd door ${BUSINESS.name}, gevoerd door ${BUSINESS.owner}, ${countryLabel.nl}.`,
    fr: `Ce service est fourni par ${BUSINESS.name}, exploité par ${BUSINESS.owner}, ${countryLabel.fr}.`,
    de: `Dieser Dienst wird bereitgestellt von ${BUSINESS.name}, betrieben von ${BUSINESS.owner}, ${countryLabel.de}.`,
  }[locale];
  return [lead, ...identityDetails(locale), rest].join(" ");
}

function whoWeAre(locale: AppLocale) {
  const lead = {
    en: `${BUSINESS.name} is run by ${BUSINESS.owner}, ${countryLabel.en}.`,
    nl: `${BUSINESS.name} wordt gevoerd door ${BUSINESS.owner}, ${countryLabel.nl}.`,
    fr: `${BUSINESS.name} est exploité par ${BUSINESS.owner}, ${countryLabel.fr}.`,
    de: `${BUSINESS.name} wird betrieben von ${BUSINESS.owner}, ${countryLabel.de}.`,
  }[locale];
  const contact = {
    en: `Contact: ${BUSINESS.email}.`,
    nl: `Contact: ${BUSINESS.email}.`,
    fr: `Contact : ${BUSINESS.email}.`,
    de: `Kontakt: ${BUSINESS.email}.`,
  }[locale];
  return [lead, ...identityDetails(locale), contact].join(" ");
}

type LegalSection = { title: string; paragraphs: string[] };

type LegalDocument = {
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

type LegalCopy = {
  terms: LegalDocument;
  privacy: LegalDocument;
};

const en: LegalCopy = {
  terms: {
    title: "Terms",
    description: "The terms for using the AYV Automation Stack.",
    updated: "Updated 29 September 2026",
    intro: providerIntro(
      "en",
      "These terms cover the AYV Automation Stack at ayvautomation.space. By creating an account or paying for a plan, you agree to them.",
    ),
    sections: [
      {
        title: "The service",
        paragraphs: [
          "The AYV Automation Stack is a set of six modules: Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo. You add your own client records and choose the dates. On that date, the module sends a follow-up email.",
          "The apps do not collect leads from ads, forms, or other inboxes, and they do not send SMS or WhatsApp messages.",
        ],
      },
      {
        title: "Accounts",
        paragraphs: [
          "You need an account to use the apps. You are responsible for the email and password on the account, and for the people you allow into the workspace.",
        ],
      },
      {
        title: "Plans and prices",
        paragraphs: [
          "Prices are in euro, exclude tax, and are billed monthly. One module is €39. Growth is €79 and includes exactly three modules. The full stack is €149 and includes all six.",
          "One module allows 200 new records in a calendar month. Growth allows 1,000. The full stack has no cap. When a limit is reached, new records stop until the next month or you move to a higher plan. There is no extra charge for going over the limit.",
        ],
      },
      {
        title: "Trial and billing",
        paragraphs: [
          "The first subscription starts with 7 days free. A card is required. Billing starts when the trial ends, unless you cancel before then.",
          "A later purchase does not start a new trial. When you move from one module to Growth, or from Growth to the full stack, you pay the new plan and the previous plan stops renewing. The period you already paid is not refunded.",
          "You can cancel from Billing. The plan then stops renewing. Card payments are processed by Stripe. We do not store your full card number.",
        ],
      },
      {
        title: "Your clients",
        paragraphs: [
          "You choose who is emailed and what the record says. You need a valid reason to contact those people. You are responsible for the content of the records and for the emails the apps send on your behalf.",
        ],
      },
      {
        title: "Use of the service",
        paragraphs: [
          "Do not use the apps to break the law, to send unwanted email, or to interfere with the service. We can suspend an account that is used that way.",
          "We aim to keep the service available, and we do not promise that every email will be delivered or that the service will be uninterrupted.",
        ],
      },
      {
        title: "Data processing",
        paragraphs: [
          "We process client records only on the customer's instructions. We keep them confidential and apply appropriate security. The sub-processors are listed in the Privacy page. We help with data subject requests. We report data breaches within 48 hours. We delete the data after the account is closed.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          `Questions about these terms: ${legalContact}.`,
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy",
    description: "How the AYV Automation Stack handles personal data.",
    updated: "Updated 29 September 2026",
    intro:
      "This page explains what the AYV Automation Stack stores, why, and who else processes it. The service is operated from Belgium.",
    sections: [
      {
        title: "Who we are",
        paragraphs: [whoWeAre("en")],
      },
      {
        title: "Our role",
        paragraphs: [
          "For account and billing data, we are the controller. For the client records you add to the modules, you are the controller and we act as your processor. We process those records only to provide the service, under the data processing terms in our Terms.",
        ],
      },
      {
        title: "Legal basis",
        paragraphs: [
          "Account and records: performance of our contract with you. Billing records: legal obligation (tax). Service emails and security: legitimate interest.",
        ],
      },
      {
        title: "Account data",
        paragraphs: [
          "When you sign up we store your name, email address, and a password through our login provider. We also store the workspace name you choose.",
          "We use this to create your account, sign you in, and contact you about the account.",
        ],
      },
      {
        title: "Records you add",
        paragraphs: [
          "The modules store the client details you type: names, email addresses, dates, amounts, statuses, and notes for leads, bookings, quotes, invoices, reactivation, and reviews.",
          "We use those records to show them in your workspace and to send the follow-up email on the date you set.",
        ],
      },
      {
        title: "Billing",
        paragraphs: [
          "Payments are handled by Stripe. Stripe receives the card and billing details. We store the plan, the subscription status, and the Stripe customer id so the apps know what you have paid for.",
        ],
      },
      {
        title: "Email",
        paragraphs: [
          "Follow-up emails are sent by Resend from noreply@ayvautomation.space to the address on the record. We store whether the send succeeded.",
          "Nexro and Ravelo emails include the business name, its contact details, and a one-click unsubscribe link. An unsubscribed address is not emailed again by those two modules.",
        ],
      },
      {
        title: "Cookies and analytics",
        paragraphs: [
          "A cookie named ayv_locale remembers the language you pick. Sign-in uses session cookies so you stay logged in.",
          "The site uses Vercel Analytics, which records page views. It does not use that data to advertise to you.",
        ],
      },
      {
        title: "Who else processes data",
        paragraphs: [
          "Supabase stores the account and the records. Stripe processes payments. Resend sends the emails. Vercel hosts the site. These providers may process data outside your country.",
        ],
      },
      {
        title: "Prospecting",
        paragraphs: [
          "We contact businesses by email to offer our service. We use company information from Apollo.io, Google Maps and company websites (company name, website, business email address, city, industry, and the name and role of the owner). The legal basis is our legitimate interest in B2B direct marketing. Every email lets you opt out with one reply; after that we add the address to a do-not-contact list and never email it again. We delete prospect data we no longer use after 12 months, except the do-not-contact entry.",
        ],
      },
      {
        title: "Transfers outside the EU",
        paragraphs: [
          "Some providers (Stripe, Resend, Vercel, Supabase) may process data outside the EU. Where they do, the transfer is covered by the EU Standard Contractual Clauses or the EU-US Data Privacy Framework.",
        ],
      },
      {
        title: "How long we keep it",
        paragraphs: [
          "We keep account and client records while the workspace exists. You can delete records in the apps. When you ask us to delete the account, we delete the workspace data we still hold, except billing records we have to keep for tax.",
        ],
      },
      {
        title: "Your rights",
        paragraphs: [
          "You can ask for a copy of your data, a correction, or deletion. You can also object to how we use it. Write to the address below. You can also complain to the Belgian Data Protection Authority (Gegevensbeschermingsautoriteit / Autorité de protection des données), www.gegevensbeschermingsautoriteit.be.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          `Privacy questions: ${legalContact}.`,
        ],
      },
    ],
  },
};

const fr: LegalCopy = {
  terms: {
    title: "Conditions",
    description: "Les conditions d’utilisation de l’AYV Automation Stack.",
    updated: "Mis à jour le 29 septembre 2026",
    intro: providerIntro(
      "fr",
      "Ces conditions couvrent l’AYV Automation Stack sur ayvautomation.space. En créant un compte ou en payant une formule, vous les acceptez.",
    ),
    sections: [
      {
        title: "Le service",
        paragraphs: [
          "L’AYV Automation Stack comprend six modules : Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo. Vous ajoutez vos propres fiches client et choisissez les dates. Ce jour-là, le module envoie un e-mail de relance.",
          "Les apps ne récupèrent pas de prospects depuis des publicités, des formulaires ou d’autres boîtes mail, et elles n’envoient ni SMS ni WhatsApp.",
        ],
      },
      {
        title: "Comptes",
        paragraphs: [
          "Un compte est nécessaire pour utiliser les apps. Vous êtes responsable de l’e-mail et du mot de passe du compte, et des personnes que vous laissez entrer dans l’espace de travail.",
        ],
      },
      {
        title: "Formules et prix",
        paragraphs: [
          "Les prix sont en euros, hors taxes, et facturés chaque mois. Un module coûte 39 €. Growth coûte 79 € et comprend exactement trois modules. La stack complète coûte 149 € et comprend les six.",
          "Un module autorise 200 nouveaux enregistrements par mois calendaire. Growth en autorise 1 000. La stack complète n’a pas de plafond. Une fois la limite atteinte, les nouveaux enregistrements s’arrêtent jusqu’au mois suivant ou jusqu’à un changement de formule. Il n’y a pas de frais en plus.",
        ],
      },
      {
        title: "Essai et paiement",
        paragraphs: [
          "Le premier abonnement commence par 7 jours gratuits. Une carte est demandée. Le paiement commence à la fin de l’essai, sauf si vous annulez avant.",
          "Un achat plus tard ne relance pas un essai. Quand vous passez d’un module à Growth, ou de Growth à la stack complète, vous payez la nouvelle formule et l’ancienne cesse de se renouveler. La période déjà payée n’est pas remboursée.",
          "Vous pouvez annuler depuis Facturation. La formule cesse alors de se renouveler. Les paiements par carte passent par Stripe. Nous ne conservons pas le numéro complet de la carte.",
        ],
      },
      {
        title: "Vos clients",
        paragraphs: [
          "Vous choisissez qui reçoit un e-mail et ce que dit la fiche. Il vous faut une raison valable de contacter ces personnes. Vous êtes responsable du contenu des fiches et des e-mails que les apps envoient pour vous.",
        ],
      },
      {
        title: "Utilisation du service",
        paragraphs: [
          "N’utilisez pas les apps pour enfreindre la loi, envoyer des e-mails non souhaités, ou gêner le service. Nous pouvons suspendre un compte utilisé de cette façon.",
          "Nous cherchons à garder le service disponible, et nous ne promettons pas que chaque e-mail sera délivré ni que le service sera ininterrompu.",
        ],
      },
      {
        title: "Traitement des données",
        paragraphs: [
          "Nous traitons les fiches client uniquement sur instruction du client. Nous les gardons confidentielles et appliquons une sécurité appropriée. Les sous-traitants sont indiqués sur la page Confidentialité. Nous aidons pour les demandes des personnes concernées. Nous signalons les violations de données dans les 48 heures. Nous supprimons les données après la fermeture du compte.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [`Questions sur ces conditions : ${legalContact}.`],
      },
    ],
  },
  privacy: {
    title: "Confidentialité",
    description: "Comment l’AYV Automation Stack traite les données personnelles.",
    updated: "Mis à jour le 29 septembre 2026",
    intro:
      "Cette page explique ce que l’AYV Automation Stack conserve, pourquoi, et qui d’autre les traite. Le service est exploité depuis la Belgique.",
    sections: [
      {
        title: "Qui nous sommes",
        paragraphs: [whoWeAre("fr")],
      },
      {
        title: "Notre rôle",
        paragraphs: [
          "Pour les données de compte et de facturation, nous sommes le responsable du traitement. Pour les fiches client que vous ajoutez aux modules, vous êtes le responsable du traitement et nous agissons comme votre sous-traitant. Nous traitons ces fiches uniquement pour fournir le service, selon les conditions de traitement des données dans nos Conditions.",
        ],
      },
      {
        title: "Base juridique",
        paragraphs: [
          "Compte et fiches : exécution de notre contrat avec vous. Données de facturation : obligation légale (fiscalité). E-mails de service et sécurité : intérêt légitime.",
        ],
      },
      {
        title: "Données du compte",
        paragraphs: [
          "À l’inscription, nous conservons votre nom, votre adresse e-mail et un mot de passe via notre fournisseur de connexion. Nous conservons aussi le nom de l’espace de travail que vous choisissez.",
          "Nous les utilisons pour créer le compte, vous connecter, et vous écrire au sujet du compte.",
        ],
      },
      {
        title: "Fiches que vous ajoutez",
        paragraphs: [
          "Les modules conservent les détails client que vous saisissez : noms, adresses e-mail, dates, montants, statuts et notes pour les prospects, réservations, devis, factures, reconquêtes et avis.",
          "Nous utilisons ces fiches pour les afficher dans votre espace et pour envoyer l’e-mail de relance à la date choisie.",
        ],
      },
      {
        title: "Paiement",
        paragraphs: [
          "Les paiements sont gérés par Stripe. Stripe reçoit la carte et les informations de facturation. Nous conservons la formule, le statut de l’abonnement et l’identifiant client Stripe pour savoir ce que vous avez payé.",
        ],
      },
      {
        title: "E-mail",
        paragraphs: [
          "Les e-mails de relance sont envoyés par Resend depuis noreply@ayvautomation.space vers l’adresse de la fiche. Nous conservons si l’envoi a réussi.",
          "Les e-mails Nexro et Ravelo indiquent le nom de l’entreprise, ses coordonnées et un lien de désinscription en un clic. Une adresse désinscrite ne reçoit plus d’e-mail de ces deux modules.",
        ],
      },
      {
        title: "Cookies et mesure d’audience",
        paragraphs: [
          "Un cookie nommé ayv_locale retient la langue choisie. La connexion utilise des cookies de session pour vous garder connecté.",
          "Le site utilise Vercel Analytics, qui enregistre les pages vues. Ces données ne servent pas à vous adresser de la publicité.",
        ],
      },
      {
        title: "Qui d’autre traite les données",
        paragraphs: [
          "Supabase conserve le compte et les fiches. Stripe traite les paiements. Resend envoie les e-mails. Vercel héberge le site. Ces prestataires peuvent traiter des données en dehors de votre pays.",
        ],
      },
      {
        title: "Prospection",
        paragraphs: [
          "Nous contactons des entreprises par e-mail pour proposer notre service. Nous utilisons des informations d’entreprise provenant d’Apollo.io, de Google Maps et des sites d’entreprise (nom de l’entreprise, site web, adresse e-mail professionnelle, ville, secteur, et le nom et la fonction du dirigeant). La base juridique est notre intérêt légitime pour le marketing direct B2B. Chaque e-mail permet de se désinscrire en une réponse ; ensuite nous ajoutons l’adresse à une liste de non-contact et nous ne lui écrivons plus. Nous supprimons les données de prospection que nous n’utilisons plus après 12 mois, sauf l’entrée de non-contact.",
        ],
      },
      {
        title: "Transferts hors de l’UE",
        paragraphs: [
          "Certains prestataires (Stripe, Resend, Vercel, Supabase) peuvent traiter des données hors de l’UE. Dans ce cas, le transfert est couvert par les clauses contractuelles types de l’UE ou le EU-US Data Privacy Framework.",
        ],
      },
      {
        title: "Durée de conservation",
        paragraphs: [
          "Nous conservons le compte et les fiches client tant que l’espace existe. Vous pouvez supprimer des fiches dans les apps. Quand vous demandez la suppression du compte, nous supprimons les données de l’espace encore en notre possession, sauf les données de facturation que nous devons garder pour les impôts.",
        ],
      },
      {
        title: "Vos droits",
        paragraphs: [
          "Vous pouvez demander une copie de vos données, une correction ou une suppression. Vous pouvez aussi vous opposer à leur utilisation. Écrivez à l’adresse ci-dessous. Vous pouvez aussi déposer une plainte auprès de l’Autorité de protection des données (Gegevensbeschermingsautoriteit), www.gegevensbeschermingsautoriteit.be.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [`Questions de confidentialité : ${legalContact}.`],
      },
    ],
  },
};

const de: LegalCopy = {
  terms: {
    title: "AGB",
    description: "Die Bedingungen für die Nutzung des AYV Automation Stack.",
    updated: "Aktualisiert am 29. September 2026",
    intro: providerIntro(
      "de",
      "Diese Bedingungen gelten für den AYV Automation Stack auf ayvautomation.space. Mit einem Konto oder einer bezahlten Formel stimmen Sie ihnen zu.",
    ),
    sections: [
      {
        title: "Der Dienst",
        paragraphs: [
          "Der AYV Automation Stack besteht aus sechs Modulen: Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo. Sie legen eigene Kundeneinträge an und wählen die Daten. An diesem Tag sendet das Modul eine Nachfass-E-Mail.",
          "Die Apps holen keine Leads aus Anzeigen, Formularen oder anderen Postfächern und senden keine SMS oder WhatsApp-Nachrichten.",
        ],
      },
      {
        title: "Konten",
        paragraphs: [
          "Für die Apps brauchen Sie ein Konto. Sie sind verantwortlich für E-Mail und Passwort des Kontos und für die Personen, die Sie in den Workspace lassen.",
        ],
      },
      {
        title: "Pläne und Preise",
        paragraphs: [
          "Die Preise sind in Euro, verstehen sich zuzüglich MwSt. und werden monatlich berechnet. Ein Modul kostet 39 €. Growth kostet 79 € und umfasst genau drei Module. Der volle Stack kostet 149 € und umfasst alle sechs.",
          "Ein Modul erlaubt 200 neue Einträge in einem Kalendermonat. Growth erlaubt 1.000. Der volle Stack hat keine Grenze. Ist das Limit erreicht, stoppen neue Einträge bis zum nächsten Monat oder bis zu einem höheren Plan. Es gibt keine Zusatzkosten.",
        ],
      },
      {
        title: "Testphase und Abrechnung",
        paragraphs: [
          "Das erste Abonnement beginnt mit 7 kostenlosen Tagen. Eine Karte ist nötig. Die Abrechnung startet nach der Testphase, außer Sie kündigen vorher.",
          "Ein späterer Kauf startet keine neue Testphase. Beim Wechsel von einem Modul zu Growth oder von Growth zum vollen Stack zahlen Sie den neuen Plan, und der vorherige Plan verlängert sich nicht mehr. Der bereits bezahlte Zeitraum wird nicht erstattet.",
          "Sie können unter Abrechnung kündigen. Der Plan verlängert sich dann nicht mehr. Kartenzahlungen laufen über Stripe. Wir speichern nicht die volle Kartennummer.",
        ],
      },
      {
        title: "Ihre Kunden",
        paragraphs: [
          "Sie entscheiden, wer eine E-Mail erhält und was der Eintrag sagt. Sie brauchen einen gültigen Grund, diese Personen zu kontaktieren. Sie sind verantwortlich für den Inhalt der Einträge und für die E-Mails, die die Apps in Ihrem Auftrag senden.",
        ],
      },
      {
        title: "Nutzung des Dienstes",
        paragraphs: [
          "Nutzen Sie die Apps nicht, um gegen das Gesetz zu verstoßen, unerwünschte E-Mails zu senden oder den Dienst zu stören. Ein Konto, das so genutzt wird, können wir sperren.",
          "Wir wollen den Dienst verfügbar halten und versprechen nicht, dass jede E-Mail ankommt oder dass der Dienst ohne Unterbrechung läuft.",
        ],
      },
      {
        title: "Datenverarbeitung",
        paragraphs: [
          "Wir verarbeiten Kundendaten nur auf Weisung des Kunden. Wir halten sie vertraulich und wenden angemessene Sicherheit an. Die Unterauftragsverarbeiter stehen auf der Datenschutzseite. Wir helfen bei Anfragen betroffener Personen. Wir melden Datenschutzverletzungen innerhalb von 48 Stunden. Wir löschen die Daten, nachdem das Konto geschlossen wurde.",
        ],
      },
      {
        title: "Kontakt",
        paragraphs: [`Fragen zu diesen Bedingungen: ${legalContact}.`],
      },
    ],
  },
  privacy: {
    title: "Datenschutz",
    description: "Wie der AYV Automation Stack personenbezogene Daten verarbeitet.",
    updated: "Aktualisiert am 29. September 2026",
    intro:
      "Diese Seite erklärt, was der AYV Automation Stack speichert, warum, und wer die Daten sonst verarbeitet. Der Dienst wird aus Belgien betrieben.",
    sections: [
      {
        title: "Wer wir sind",
        paragraphs: [whoWeAre("de")],
      },
      {
        title: "Unsere Rolle",
        paragraphs: [
          "Für Konto- und Abrechnungsdaten sind wir Verantwortlicher. Für die Kundendaten, die Sie in den Modulen anlegen, sind Sie Verantwortlicher und wir handeln als Ihr Auftragsverarbeiter. Wir verarbeiten diese Daten nur, um den Dienst zu erbringen, gemäß den Datenverarbeitungsbedingungen in unseren AGB.",
        ],
      },
      {
        title: "Rechtsgrundlage",
        paragraphs: [
          "Konto und Einträge: Erfüllung unseres Vertrags mit Ihnen. Abrechnungsdaten: gesetzliche Pflicht (Steuern). Service-E-Mails und Sicherheit: berechtigtes Interesse.",
        ],
      },
      {
        title: "Kontodaten",
        paragraphs: [
          "Bei der Registrierung speichern wir Ihren Namen, Ihre E-Mail-Adresse und ein Passwort über unseren Login-Anbieter. Wir speichern auch den Workspace-Namen, den Sie wählen.",
          "Wir nutzen das, um das Konto anzulegen, Sie anzumelden und Sie zum Konto zu kontaktieren.",
        ],
      },
      {
        title: "Einträge, die Sie anlegen",
        paragraphs: [
          "Die Module speichern die Kundendaten, die Sie eingeben: Namen, E-Mail-Adressen, Daten, Beträge, Status und Notizen zu Leads, Buchungen, Angeboten, Rechnungen, Rückgewinnung und Bewertungen.",
          "Wir nutzen diese Einträge, um sie im Workspace zu zeigen und die Nachfass-E-Mail am gewählten Datum zu senden.",
        ],
      },
      {
        title: "Zahlung",
        paragraphs: [
          "Zahlungen laufen über Stripe. Stripe erhält die Karte und die Rechnungsdaten. Wir speichern den Plan, den Abo-Status und die Stripe-Kundennummer, damit die Apps wissen, wofür Sie bezahlt haben.",
        ],
      },
      {
        title: "E-Mail",
        paragraphs: [
          "Nachfass-E-Mails sendet Resend von noreply@ayvautomation.space an die Adresse im Eintrag. Wir speichern, ob der Versand gelungen ist.",
          "Nexro- und Ravelo-E-Mails enthalten den Firmennamen, die Kontaktdaten und einen Abmeldelink mit einem Klick. Eine abgemeldete Adresse wird von diesen beiden Modulen nicht erneut angeschrieben.",
        ],
      },
      {
        title: "Cookies und Auswertung",
        paragraphs: [
          "Ein Cookie namens ayv_locale merkt sich die gewählte Sprache. Die Anmeldung nutzt Sitzungs-Cookies, damit Sie angemeldet bleiben.",
          "Die Website nutzt Vercel Analytics und zeichnet Seitenaufrufe auf. Diese Daten dienen nicht dazu, Sie zu bewerben.",
        ],
      },
      {
        title: "Wer Daten sonst verarbeitet",
        paragraphs: [
          "Supabase speichert Konto und Einträge. Stripe verarbeitet Zahlungen. Resend sendet die E-Mails. Vercel betreibt die Website. Diese Anbieter können Daten außerhalb Ihres Landes verarbeiten.",
        ],
      },
      {
        title: "Akquise",
        paragraphs: [
          "Wir kontaktieren Unternehmen per E-Mail, um unseren Dienst anzubieten. Wir nutzen Unternehmensangaben von Apollo.io, Google Maps und Unternehmenswebsites (Firmenname, Website, geschäftliche E-Mail-Adresse, Stadt, Branche sowie Name und Funktion des Inhabers). Die Rechtsgrundlage ist unser berechtigtes Interesse an B2B-Direktwerbung. Jede E-Mail lässt sich mit einer Antwort abbestellen; danach setzen wir die Adresse auf eine Nicht-kontaktieren-Liste und schreiben sie nicht mehr an. Prospect-Daten, die wir nicht mehr nutzen, löschen wir nach 12 Monaten, außer dem Nicht-kontaktieren-Eintrag.",
        ],
      },
      {
        title: "Übermittlungen außerhalb der EU",
        paragraphs: [
          "Einige Anbieter (Stripe, Resend, Vercel, Supabase) können Daten außerhalb der EU verarbeiten. Wo das geschieht, ist die Übermittlung durch die EU-Standardvertragsklauseln oder das EU-US Data Privacy Framework abgedeckt.",
        ],
      },
      {
        title: "Speicherdauer",
        paragraphs: [
          "Konto- und Kundendaten bleiben, solange der Workspace besteht. Einträge können Sie in den Apps löschen. Wenn Sie die Löschung des Kontos verlangen, löschen wir die Workspace-Daten, die wir noch haben, außer Abrechnungsdaten, die wir für die Steuer aufbewahren müssen.",
        ],
      },
      {
        title: "Ihre Rechte",
        paragraphs: [
          "Sie können eine Kopie Ihrer Daten, eine Korrektur oder eine Löschung verlangen. Sie können der Nutzung auch widersprechen. Schreiben Sie an die Adresse unten. Sie können sich auch bei der belgischen Datenschutzbehörde (Gegevensbeschermingsautoriteit / Autorité de protection des données) beschweren, www.gegevensbeschermingsautoriteit.be.",
        ],
      },
      {
        title: "Kontakt",
        paragraphs: [`Datenschutzfragen: ${legalContact}.`],
      },
    ],
  },
};

const nl: LegalCopy = {
  terms: {
    title: "Voorwaarden",
    description: "De voorwaarden voor het gebruik van de AYV Automation Stack.",
    updated: "Bijgewerkt op 29 september 2026",
    intro: providerIntro(
      "nl",
      "Deze voorwaarden gelden voor de AYV Automation Stack op ayvautomation.space. Door een account te maken of een plan te betalen, ga je ermee akkoord.",
    ),
    sections: [
      {
        title: "De dienst",
        paragraphs: [
          "De AYV Automation Stack bestaat uit zes modules: Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo. Je voegt je eigen klantrecords toe en kiest de datums. Op die datum stuurt de module een opvolgmail.",
          "De apps halen geen leads op uit advertenties, formulieren of andere inboxen, en ze sturen geen sms of WhatsApp.",
        ],
      },
      {
        title: "Accounts",
        paragraphs: [
          "Je hebt een account nodig om de apps te gebruiken. Je bent verantwoordelijk voor het e-mailadres en wachtwoord van het account, en voor de mensen die je toelaat in de workspace.",
        ],
      },
      {
        title: "Plannen en prijzen",
        paragraphs: [
          "Prijzen zijn in euro, exclusief btw, en worden maandelijks gefactureerd. Eén module is €39. Growth is €79 en bevat precies drie modules. De volledige stack is €149 en bevat alle zes.",
          "Eén module staat 200 nieuwe records toe in een kalendermaand. Growth staat 1.000 toe. De volledige stack heeft geen limiet. Als de limiet bereikt is, stoppen nieuwe records tot de volgende maand of tot je een hoger plan neemt. Er komen geen extra kosten bij.",
        ],
      },
      {
        title: "Proef en betaling",
        paragraphs: [
          "Het eerste abonnement begint met 7 gratis dagen. Een kaart is nodig. De betaling start als de proef voorbij is, tenzij je daarvoor opzegt.",
          "Een latere aankoop start geen nieuwe proef. Als je van één module naar Growth gaat, of van Growth naar de volledige stack, betaal je het nieuwe plan en stopt het vorige plan met verlengen. De periode die je al betaald hebt, wordt niet terugbetaald.",
          "Je kunt opzeggen via Facturatie. Het plan verlengt dan niet meer. Kaartbetalingen lopen via Stripe. We bewaren je volledige kaartnummer niet.",
        ],
      },
      {
        title: "Jouw klanten",
        paragraphs: [
          "Jij kiest wie een mail krijgt en wat het record zegt. Je hebt een geldige reden nodig om die mensen te mailen. Jij bent verantwoordelijk voor de inhoud van de records en voor de mails die de apps namens jou sturen.",
        ],
      },
      {
        title: "Gebruik van de dienst",
        paragraphs: [
          "Gebruik de apps niet om de wet te overtreden, ongewenste mail te sturen, of de dienst te verstoren. Een account dat zo wordt gebruikt, kunnen we blokkeren.",
          "We proberen de dienst beschikbaar te houden, en we beloven niet dat elke mail aankomt of dat de dienst nooit onderbroken is.",
        ],
      },
      {
        title: "Gegevensverwerking",
        paragraphs: [
          "We verwerken klantgegevens alleen op instructie van de klant. We houden ze vertrouwelijk en passen passende beveiliging toe. De subverwerkers staan op de privacypagina. We helpen bij verzoeken van betrokkenen. We melden datalekken binnen 48 uur. We verwijderen de gegevens nadat het account is gesloten.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [`Vragen over deze voorwaarden: ${legalContact}.`],
      },
    ],
  },
  privacy: {
    title: "Privacy",
    description: "Hoe de AYV Automation Stack persoonsgegevens verwerkt.",
    updated: "Bijgewerkt op 29 september 2026",
    intro:
      "Deze pagina legt uit wat de AYV Automation Stack bewaart, waarom, en wie het verder verwerkt. De dienst wordt vanuit België gevoerd.",
    sections: [
      {
        title: "Wie we zijn",
        paragraphs: [whoWeAre("nl")],
      },
      {
        title: "Onze rol",
        paragraphs: [
          "Voor account- en factuurgegevens zijn wij verwerkingsverantwoordelijke. Voor de klantgegevens die je in de modules zet, ben jij verwerkingsverantwoordelijke en treden wij op als verwerker. We verwerken die gegevens alleen om de dienst te leveren, volgens de verwerkingsafspraken in onze voorwaarden.",
        ],
      },
      {
        title: "Rechtsgrond",
        paragraphs: [
          "Account en records: uitvoering van onze overeenkomst met jou. Factuurgegevens: wettelijke verplichting (belastingen). Servicemails en beveiliging: gerechtvaardigd belang.",
        ],
      },
      {
        title: "Accountgegevens",
        paragraphs: [
          "Bij het aanmelden bewaren we je naam, e-mailadres en een wachtwoord via onze loginprovider. We bewaren ook de naam van de workspace die je kiest.",
          "We gebruiken dit om je account te maken, je in te loggen, en je te bereiken over het account.",
        ],
      },
      {
        title: "Records die je toevoegt",
        paragraphs: [
          "De modules bewaren de klantgegevens die je invult: namen, e-mailadressen, datums, bedragen, statussen en notities voor leads, boekingen, offertes, facturen, heractivatie en reviews.",
          "We gebruiken die records om ze in je workspace te tonen en om de opvolgmail te sturen op de datum die je kiest.",
        ],
      },
      {
        title: "Betaling",
        paragraphs: [
          "Betalingen lopen via Stripe. Stripe ontvangt de kaart en de factuurgegevens. Wij bewaren het plan, de abonnementsstatus en het Stripe-klantnummer, zodat de apps weten waarvoor je betaald hebt.",
        ],
      },
      {
        title: "E-mail",
        paragraphs: [
          "Opvolgmails worden verstuurd door Resend vanaf noreply@ayvautomation.space naar het adres op het record. We bewaren of de verzending gelukt is.",
          "Nexro- en Ravelo-mails bevatten de bedrijfsnaam, de contactgegevens en een afmeldlink met één klik. Een afgemeld adres krijgt geen mail meer van die twee modules.",
        ],
      },
      {
        title: "Cookies en statistiek",
        paragraphs: [
          "Een cookie met de naam ayv_locale onthoudt de taal die je kiest. Inloggen gebruikt sessiecookies zodat je ingelogd blijft.",
          "De site gebruikt Vercel Analytics, dat paginaweergaven bijhoudt. Die gegevens worden niet gebruikt om je reclame te sturen.",
        ],
      },
      {
        title: "Wie gegevens verder verwerkt",
        paragraphs: [
          "Supabase bewaart het account en de records. Stripe verwerkt betalingen. Resend verstuurt de mails. Vercel host de site. Deze partijen kunnen gegevens buiten je land verwerken.",
        ],
      },
      {
        title: "Prospectie",
        paragraphs: [
          "We nemen per e-mail contact op met bedrijven om onze dienst aan te bieden. We gebruiken bedrijfsinformatie van Apollo.io, Google Maps en bedrijfswebsites (bedrijfsnaam, website, zakelijk e-mailadres, stad, sector, en de naam en functie van de eigenaar). De grondslag is ons gerechtvaardigd belang bij B2B-directmarketing. Elke mail laat je met één antwoord afmelden; daarna zetten we het adres op een niet-contacteren-lijst en mailen we het nooit meer. Prospectgegevens die we niet meer gebruiken verwijderen we na 12 maanden, behalve de niet-contacteren-vermelding.",
        ],
      },
      {
        title: "Doorgifte buiten de EU",
        paragraphs: [
          "Sommige partijen (Stripe, Resend, Vercel, Supabase) kunnen gegevens buiten de EU verwerken. Waar dat gebeurt, valt de doorgifte onder de EU-standaardcontractbepalingen of het EU-VS Data Privacy Framework.",
        ],
      },
      {
        title: "Hoe lang we het bewaren",
        paragraphs: [
          "We bewaren account- en klantrecords zolang de workspace bestaat. Records kun je in de apps verwijderen. Als je vraagt om het account te verwijderen, verwijderen we de workspacedata die we nog hebben, behalve factuurgegevens die we voor de belasting moeten bewaren.",
        ],
      },
      {
        title: "Je rechten",
        paragraphs: [
          "Je kunt een kopie van je gegevens vragen, een correctie, of verwijdering. Je kunt ook bezwaar maken tegen het gebruik. Mail het adres hieronder. Je kunt ook een klacht indienen bij de Gegevensbeschermingsautoriteit (Autorité de protection des données), www.gegevensbeschermingsautoriteit.be.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [`Privacyvragen: ${legalContact}.`],
      },
    ],
  },
};

const copy: Record<AppLocale, LegalCopy> = { en, fr, de, nl };

export function getLegalCopy(locale: AppLocale) {
  return copy[locale];
}
