import type { AppLocale } from "@/i18n/config";
import { oneManArmyBrand, ratedBrand, kleuroBrand } from "@/config/brands";

export const projects = [
  {
    slug: "kleuro",
    name: "Kleuro",
    description:
      "A project for visualizing house exterior colours, with a future path toward painting estimates.",
    status: "In development",
    route: "/projects/kleuro",
    category: "Visualization",
    productType: "project",
    cta: "View project",
    logo: kleuroBrand.logo,
  },
  {
    slug: "rated",
    name: "Rated",
    description: "A personal and social project for rating music albums.",
    status: "In development",
    route: "/projects/rated",
    category: "Music",
    productType: "project",
    cta: "View project",
    logo: ratedBrand.logo,
  },
] as const;

export type Project = (typeof projects)[number];

export const ecosystems = {
  oneManArmy: {
    name: "One Man Army Stack",
    slug: "one-man-army",
    route: "/one-man-army",
    audience: "Software builders",
    productType: "standalone_commercial_product",
    status: "in_development",
    logo: oneManArmyBrand.logo,
  },
  automation: {
    name: "AYV Automation",
    slug: "automation",
    route: "/automation",
    audience: "Businesses",
    productType: "product_ecosystem",
    status: "active",
  },
  automationStack: {
    name: "AYV Automation Stack",
    slug: "stack",
    route: "/automation/stack",
    audience: "Businesses",
    productType: "commercial_bundle",
    status: "display_only",
    checkoutAvailable: false,
  },
} as const;

const en = {
  locale: "en",
  nav: { projects: "Projects", army: "One Man Army", automation: "Automation", products: "Products", stack: "Automation Stack", about: "About", explore: "Explore AYV WRLD", login: "Log in", menu: "Open menu", close: "Close menu" },
  common: { parent: "Independent software company", available: "Available", soon: "Coming soon", development: "In development", learn: "Learn more", view: "View", back: "Back", individual: "Individual product", bundle: "Bundle", project: "Independent project", perMonth: "/ month", skip: "Skip to content", catalogMath: "Catalog math", availability: "Availability", purchasedSeparately: "Value when purchased separately", plannedPrice: "Planned bundle price", save: "Save", includes: "Six products included", individualNote: "No bundle checkout is available yet. Available products can still be purchased individually.", categories: { Acquire: "Acquire", Schedule: "Schedule", Convert: "Convert", Collect: "Collect", Retain: "Retain", Reputation: "Reputation" } },
  home: {
    eyebrow: "AYV WRLD · Parent company",
    title: "Build systems. Automate work. Create what’s next.",
    body: "AYV WRLD builds practical software, automation systems, and independent digital products.",
    projectsCta: "Explore projects", stacksCta: "Explore the products",
    whatTitle: "What AYV WRLD does", build: "BUILD", buildBody: "Focused software for people turning ideas into real products.", automate: "AUTOMATE", automateBody: "Operational systems that remove repetitive work from businesses.", experiment: "EXPERIMENT", experimentBody: "Independent projects that test useful ideas in the real world.",
    pathsTitle: "Two products. Two distinct audiences.", pathsBody: "One Man Army Stack is for software builders. AYV Automation is for businesses. Neither depends on the other.",
    armyTitle: "One Man Army Stack", armyBody: "A standalone commercial product for builders, developers, founders, freelancers, creators, and aspiring SaaS founders.", armyCta: "Explore One Man Army",
    automationTitle: "AYV Automation", automationBody: "A separate business ecosystem: choose an individual automation product or explore the complete connected bundle.", automationCta: "Explore Automation",
    productsTitle: "Six independent automation products", productsBody: "Choose one for a focused job, combine products over time, or explore the separate AYV Automation Stack bundle.",
    stackTitle: "One business. One connected system.", stackBody: "Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo are individual products. The AYV Automation Stack is the bundle that brings all six together.", stackCta: "Explore the bundle",
    projectsTitle: "Independent AYV WRLD projects", projectsBody: "Kleuro and Rated sit directly under AYV WRLD. They are not part of either commercial product path.",
    aboutTitle: "Independent. Experimental. Practical.", aboutBody: "AYV WRLD stays close to the work: build a focused product, learn from real use, and keep improving what earns its place.", aboutCta: "About AYV WRLD",
    finalTitle: "Build something. Automate something. Make it real.", finalBody: "Choose the path that fits what you are creating or operating."
  },
  automation: {
    eyebrow: "AYV WRLD / AYV Automation",
    title: "Automation built around the work businesses repeat.",
    body: "AYV Automation is a product ecosystem for businesses. Buy an individual product for one job, or consider the AYV Automation Stack as the separate bundle path.",
    productsTitle: "Individual products", productsBody: "Every product stands on its own and remains recognizable and individually accessible.",
    journeyTitle: "A connected business journey", journeyBody: "Acquire → Schedule → Convert → Collect → Retain → Reputation. Add products as the workflow grows.",
    stackTitle: "The sibling bundle option", stackBody: "AYV Automation Stack contains all six products. It is a bundle inside AYV Automation—not the parent of those products.", stackCta: "View AYV Automation Stack"
  },
  army: {
    eyebrow: "AYV WRLD / One Man Army Stack", title: "A commercial product path for people building software.", body: "One Man Army Stack is for builders, solo founders, developers, freelancers, creators, and aspiring SaaS founders. It is separate from AYV Automation and is not required by automation customers.",
    lifecycle: "From idea to a better product", research: "Research", researchBody: "Understand the problem, audience, and direction.", build: "Build", buildBody: "Turn a focused idea into working software.", deploy: "Deploy", deployBody: "Move the product from a local build into the world.", monetize: "Monetize", monetizeBody: "Create a practical commercial path.", improve: "Improve", improveBody: "Learn from use and strengthen what matters.",
    status: "In development", cta: "Explore AYV WRLD projects"
  },
  projects: {
    eyebrow: "AYV WRLD / Projects", title: "Independent projects, built to explore useful ideas.", body: "Kleuro, Rated, and future projects sit directly under AYV WRLD—not inside One Man Army Stack or AYV Automation.",
    detailBody: "This is an independent AYV WRLD project. It is not an automation product and is not part of One Man Army Stack.", all: "All projects"
  },
  stack: {
    eyebrow: "AYV WRLD / AYV Automation / AYV Automation Stack", title: "Six sibling products. One bundle path.", body: "AYV Automation Stack is the commercial bundle containing Avyro, Velto, Rovyn, Orvyn, Nexro, and Ravelo. Each product also remains an independent purchase option.",
    math: "€400 catalog total with a 50% discount: €200 per month, saving €200", truth: "The bundle price is displayed for planning. There is no separate Stripe bundle checkout today; available product subscriptions are purchased individually.", connected: "Connected workflow value", connectedBody: "Use a focused product first, add another later, and keep the customer journey connected across lead follow-up, bookings, quotes, invoices, retention, and reviews.", cta: "Start with an available product"
  },
  product: {
    products: "AYV Automation products", standalone: "Standalone value", connected: "Connected value", connectedBody: "Use this product independently, or connect it with sibling products through the AYV Automation ecosystem as your workflow grows.", open: "Open", notify: "Currently in development", priceNote: "Individual monthly product price.", stackLink: "Compare the Automation Stack", other: "Other individual products"
  },
  about: {
    eyebrow: "AYV WRLD / About", title: "A parent company for focused software and useful experiments.", body: "AYV WRLD independently builds commercial software products, automation systems, and digital projects. The aim is practical: make something clear, useful, and real.",
    hierarchy: "One umbrella. Clear paths.", hierarchyBody: "One Man Army Stack serves software builders. AYV Automation serves businesses through six individual products and a sibling bundle. Kleuro and Rated remain independent projects."
  },
  footer: { body: "AYV WRLD is the parent company building software, automation systems, and independent digital products.", company: "Company", automation: "Automation products", paths: "Product paths", rights: "All rights reserved." },
  metadata: {
    home: ["AYV WRLD — Software, Automation & Digital Products", "AYV WRLD builds practical software, business automation systems, and independent digital products."],
    projects: ["Projects", "Explore Kleuro, Rated, and independent projects built by AYV WRLD."],
    army: ["One Man Army Stack", "A standalone AYV WRLD commercial product path for people building and launching software."],
    automation: ["AYV Automation", "Explore six individual business automation products and the separate AYV Automation Stack bundle."],
    stack: ["AYV Automation Stack", "The six-product AYV Automation bundle, with clear catalog pricing and current availability."],
    about: ["About AYV WRLD", "AYV WRLD is an independent parent company building focused software and digital products."]
  }
} as const;

type Widen<T> = T extends string
  ? string
  : T extends readonly [infer A, infer B]
    ? readonly [Widen<A>, Widen<B>]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

type PublicCopy = Widen<typeof en>;

const copy: Record<AppLocale, PublicCopy> = {
  en,
  fr: {
    ...en, locale: "fr",
    nav: { projects: "Projets", army: "One Man Army", automation: "Automation", products: "Produits", stack: "Automation Stack", about: "À propos", explore: "Explorer AYV WRLD", login: "Connexion", menu: "Ouvrir le menu", close: "Fermer le menu" },
    common: { parent: "Entreprise logicielle indépendante", available: "Disponible", soon: "Bientôt", development: "En développement", learn: "En savoir plus", view: "Voir", back: "Retour", individual: "Produit individuel", bundle: "Offre groupée", project: "Projet indépendant", perMonth: "/ mois", skip: "Aller au contenu", catalogMath: "Calcul du catalogue", availability: "Disponibilité", purchasedSeparately: "Valeur si achetés séparément", plannedPrice: "Prix prévu de l’offre groupée", save: "Économisez", includes: "Six produits inclus", individualNote: "Le paiement groupé n’est pas encore disponible. Les produits disponibles peuvent toujours être achetés séparément.", categories: { Acquire: "Acquérir", Schedule: "Planifier", Convert: "Convertir", Collect: "Encaisser", Retain: "Fidéliser", Reputation: "Réputation" } },
    home: { ...en.home, eyebrow: "AYV WRLD · Société mère", title: "Construire des systèmes. Automatiser le travail. Créer la suite.", body: "AYV WRLD conçoit des logiciels pratiques, des systèmes d’automatisation et des produits numériques indépendants.", projectsCta: "Explorer les projets", stacksCta: "Explorer les produits", whatTitle: "Ce que fait AYV WRLD", buildBody: "Des logiciels ciblés pour transformer des idées en produits réels.", automateBody: "Des systèmes opérationnels qui retirent le travail répétitif aux entreprises.", experimentBody: "Des projets indépendants qui testent des idées utiles.", pathsTitle: "Deux produits. Deux publics distincts.", pathsBody: "One Man Army Stack s’adresse aux créateurs de logiciels. AYV Automation s’adresse aux entreprises. Aucun ne dépend de l’autre.", armyBody: "Un produit commercial autonome pour builders, développeurs, fondateurs, freelances, créateurs et futurs fondateurs SaaS.", armyCta: "Explorer One Man Army", automationBody: "Un écosystème distinct pour les entreprises : choisissez un produit individuel ou explorez l’offre groupée connectée.", automationCta: "Explorer Automation", productsTitle: "Six produits d’automatisation indépendants", productsBody: "Choisissez un produit pour une mission précise, combinez-les ou explorez l’offre AYV Automation Stack.", stackTitle: "Une entreprise. Un système connecté.", stackBody: "Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo sont des produits individuels. AYV Automation Stack est l’offre qui réunit les six.", stackCta: "Explorer l’offre groupée", projectsTitle: "Projets AYV WRLD indépendants", projectsBody: "Kleuro et Rated dépendent directement d’AYV WRLD, hors des deux parcours commerciaux.", aboutTitle: "Indépendant. Expérimental. Pratique.", aboutBody: "AYV WRLD reste proche du travail : construire, apprendre de l’usage réel et améliorer ce qui compte.", aboutCta: "À propos d’AYV WRLD", finalTitle: "Construire. Automatiser. Rendre réel.", finalBody: "Choisissez le parcours adapté à ce que vous créez ou exploitez." },
    automation: { ...en.automation, title: "L’automatisation pensée pour le travail répétitif des entreprises.", body: "AYV Automation est un écosystème pour entreprises. Achetez un produit individuel ou envisagez AYV Automation Stack comme offre groupée séparée.", productsTitle: "Produits individuels", productsBody: "Chaque produit fonctionne seul et reste accessible individuellement.", journeyTitle: "Un parcours d’entreprise connecté", journeyBody: "Acquérir → Planifier → Convertir → Encaisser → Fidéliser → Réputation.", stackTitle: "L’option groupée au même niveau", stackBody: "AYV Automation Stack contient les six produits. C’est une offre dans AYV Automation, pas leur parent.", stackCta: "Voir AYV Automation Stack" },
    army: { ...en.army, title: "Un parcours commercial pour celles et ceux qui créent des logiciels.", body: "One Man Army Stack s’adresse aux builders, fondateurs solo, développeurs, freelances et créateurs. Il est séparé d’AYV Automation.", lifecycle: "De l’idée à un meilleur produit", research: "Rechercher", researchBody: "Comprendre le problème, le public et la direction.", build: "Construire", buildBody: "Transformer une idée ciblée en logiciel fonctionnel.", deploy: "Déployer", deployBody: "Mettre le produit dans le monde.", monetize: "Monétiser", monetizeBody: "Créer un parcours commercial pratique.", improve: "Améliorer", improveBody: "Apprendre de l’usage et renforcer l’essentiel.", status: "En développement", cta: "Explorer les projets AYV WRLD" },
    projects: { ...en.projects, title: "Des projets indépendants pour explorer des idées utiles.", body: "Kleuro, Rated et les futurs projets dépendent directement d’AYV WRLD.", detailBody: "Projet AYV WRLD indépendant, hors AYV Automation et One Man Army Stack.", all: "Tous les projets" },
    stack: { ...en.stack, title: "Six produits au même niveau. Une offre groupée.", body: "AYV Automation Stack réunit Avyro, Velto, Rovyn, Orvyn, Nexro et Ravelo. Chacun reste disponible individuellement.", math: "Total catalogue 400 € avec 50 % de remise : 200 € par mois, soit 200 € économisés", truth: "Le prix groupé est affiché à titre indicatif. Il n’existe pas de paiement Stripe groupé aujourd’hui ; les abonnements disponibles s’achètent séparément.", connected: "Valeur du parcours connecté", connectedBody: "Commencez avec un produit, ajoutez-en un autre et gardez le parcours client connecté.", cta: "Commencer avec un produit disponible" },
    product: { ...en.product, products: "Produits AYV Automation", standalone: "Valeur autonome", connected: "Valeur connectée", connectedBody: "Utilisez ce produit seul ou connectez-le aux produits voisins via AYV Automation.", open: "Ouvrir", notify: "Actuellement en développement", priceNote: "Prix mensuel du produit individuel.", stackLink: "Comparer Automation Stack", other: "Autres produits individuels" },
    about: { ...en.about, title: "Une société mère pour des logiciels ciblés et des expériences utiles.", body: "AYV WRLD développe indépendamment des produits logiciels commerciaux, des systèmes d’automatisation et des projets numériques.", hierarchy: "Une structure. Des parcours clairs.", hierarchyBody: "One Man Army Stack sert les créateurs. AYV Automation sert les entreprises via six produits individuels et une offre groupée. Kleuro et Rated restent indépendants." },
    footer: { body: "AYV WRLD est la société mère qui crée des logiciels, des systèmes d’automatisation et des produits numériques indépendants.", company: "Société", automation: "Produits Automation", paths: "Parcours produits", rights: "Tous droits réservés." },
    metadata: { home: ["AYV WRLD — Logiciels, automatisation et produits numériques", "AYV WRLD crée des logiciels pratiques, des automatisations et des produits numériques indépendants."], projects: ["Projets", "Découvrez Kleuro, Rated et les projets indépendants d’AYV WRLD."], army: ["One Man Army Stack", "Le produit AYV WRLD autonome pour créer et lancer des logiciels."], automation: ["AYV Automation", "Six produits d’automatisation individuels et l’offre groupée AYV Automation Stack."], stack: ["AYV Automation Stack", "L’offre groupée de six produits AYV Automation, avec prix et disponibilité transparents."], about: ["À propos d’AYV WRLD", "AYV WRLD est une société mère indépendante qui crée des logiciels ciblés."] }
  },
  de: {
    ...en, locale: "de",
    nav: { projects: "Projekte", army: "One Man Army", automation: "Automation", products: "Produkte", stack: "Automation Stack", about: "Über uns", explore: "AYV WRLD entdecken", login: "Anmelden", menu: "Menü öffnen", close: "Menü schließen" },
    common: { parent: "Unabhängiges Softwareunternehmen", available: "Verfügbar", soon: "Demnächst", development: "In Entwicklung", learn: "Mehr erfahren", view: "Ansehen", back: "Zurück", individual: "Einzelprodukt", bundle: "Bundle", project: "Unabhängiges Projekt", perMonth: "/ Monat", skip: "Zum Inhalt springen", catalogMath: "Katalogrechnung", availability: "Verfügbarkeit", purchasedSeparately: "Wert beim Einzelkauf", plannedPrice: "Geplanter Bundle-Preis", save: "Spare", includes: "Sechs Produkte enthalten", individualNote: "Ein Bundle-Checkout ist noch nicht verfügbar. Verfügbare Produkte können weiterhin einzeln gekauft werden.", categories: { Acquire: "Gewinnen", Schedule: "Planen", Convert: "Konvertieren", Collect: "Einziehen", Retain: "Binden", Reputation: "Reputation" } },
    home: { ...en.home, eyebrow: "AYV WRLD · Muttermarke", title: "Systeme bauen. Arbeit automatisieren. Neues schaffen.", body: "AYV WRLD entwickelt praktische Software, Automatisierungssysteme und unabhängige digitale Produkte.", projectsCta: "Projekte entdecken", stacksCta: "Produkte entdecken", whatTitle: "Was AYV WRLD macht", buildBody: "Fokussierte Software für Menschen, die Ideen in echte Produkte verwandeln.", automateBody: "Betriebssysteme, die Unternehmen repetitive Arbeit abnehmen.", experimentBody: "Unabhängige Projekte, die nützliche Ideen erproben.", pathsTitle: "Zwei Produkte. Zwei klare Zielgruppen.", pathsBody: "One Man Army Stack ist für Software-Builder. AYV Automation ist für Unternehmen. Beide sind getrennt.", armyBody: "Ein eigenständiges kommerzielles Produkt für Builder, Entwickler, Gründer, Freelancer und angehende SaaS-Gründer.", armyCta: "One Man Army entdecken", automationBody: "Ein separates Business-Ökosystem: Einzelprodukt wählen oder das verbundene Bundle ansehen.", automationCta: "Automation entdecken", productsTitle: "Sechs unabhängige Automatisierungsprodukte", productsBody: "Wählen Sie ein Produkt, kombinieren Sie später oder vergleichen Sie das AYV Automation Stack Bundle.", stackTitle: "Ein Unternehmen. Ein verbundenes System.", stackBody: "Avyro, Velto, Rovyn, Orvyn, Nexro und Ravelo sind Einzelprodukte. AYV Automation Stack bündelt alle sechs.", stackCta: "Bundle entdecken", projectsTitle: "Unabhängige AYV WRLD Projekte", projectsBody: "Kleuro und Rated gehören direkt zu AYV WRLD und nicht zu den kommerziellen Produktpfaden.", aboutTitle: "Unabhängig. Experimentell. Praktisch.", aboutBody: "AYV WRLD baut fokussierte Produkte, lernt aus echter Nutzung und verbessert, was zählt.", aboutCta: "Über AYV WRLD", finalTitle: "Etwas bauen. Etwas automatisieren. Real machen.", finalBody: "Wählen Sie den Pfad für das, was Sie bauen oder betreiben." },
    automation: { ...en.automation, title: "Automatisierung für wiederkehrende Unternehmensarbeit.", body: "AYV Automation ist ein Produktökosystem für Unternehmen: Einzelprodukt kaufen oder das separate Bundle betrachten.", productsTitle: "Einzelprodukte", productsBody: "Jedes Produkt steht für sich und bleibt einzeln zugänglich.", journeyTitle: "Eine verbundene Geschäftsreise", journeyBody: "Gewinnen → Planen → Konvertieren → Einziehen → Binden → Reputation.", stackTitle: "Die gleichrangige Bundle-Option", stackBody: "AYV Automation Stack enthält alle sechs Produkte. Es ist das Bundle, nicht deren Oberkategorie.", stackCta: "AYV Automation Stack ansehen" },
    army: { ...en.army, title: "Ein kommerzieller Produktpfad für Software-Builder.", body: "One Man Army Stack richtet sich an Builder, Solo-Gründer, Entwickler, Freelancer und Kreative. Es ist von AYV Automation getrennt.", lifecycle: "Von der Idee zum besseren Produkt", research: "Forschen", researchBody: "Problem, Zielgruppe und Richtung verstehen.", build: "Bauen", buildBody: "Eine fokussierte Idee in Software verwandeln.", deploy: "Bereitstellen", deployBody: "Das Produkt in die Welt bringen.", monetize: "Monetarisieren", monetizeBody: "Einen praktischen kommerziellen Weg schaffen.", improve: "Verbessern", improveBody: "Aus Nutzung lernen und Wichtiges stärken.", status: "In Entwicklung", cta: "AYV WRLD Projekte entdecken" },
    projects: { ...en.projects, title: "Unabhängige Projekte für nützliche Ideen.", body: "Kleuro, Rated und zukünftige Projekte gehören direkt zu AYV WRLD.", detailBody: "Ein unabhängiges AYV WRLD Projekt außerhalb von Automation und One Man Army Stack.", all: "Alle Projekte" },
    stack: { ...en.stack, title: "Sechs gleichrangige Produkte. Ein Bundle.", body: "AYV Automation Stack bündelt alle sechs Produkte. Jedes bleibt einzeln erhältlich.", math: "400 € Katalogsumme mit 50 % Rabatt: 200 € pro Monat und 200 € Ersparnis", truth: "Der Bundle-Preis dient der Planung. Heute gibt es keinen separaten Stripe-Bundle-Checkout; verfügbare Abos werden einzeln gekauft.", connected: "Verbundener Workflow-Wert", connectedBody: "Mit einem Produkt starten, später erweitern und die Kundenreise verbunden halten.", cta: "Mit einem verfügbaren Produkt starten" },
    product: { ...en.product, products: "AYV Automation Produkte", standalone: "Eigenständiger Wert", connected: "Verbundener Wert", connectedBody: "Allein nutzen oder über AYV Automation mit gleichrangigen Produkten verbinden.", open: "Öffnen", notify: "Derzeit in Entwicklung", priceNote: "Monatspreis des Einzelprodukts.", stackLink: "Automation Stack vergleichen", other: "Weitere Einzelprodukte" },
    about: { ...en.about, title: "Eine Muttermarke für fokussierte Software und nützliche Experimente.", body: "AYV WRLD baut unabhängig kommerzielle Software, Automatisierungssysteme und digitale Projekte.", hierarchy: "Eine Marke. Klare Pfade.", hierarchyBody: "One Man Army Stack dient Buildern. AYV Automation dient Unternehmen mit sechs Einzelprodukten und einem Bundle. Kleuro und Rated bleiben unabhängig." },
    footer: { body: "AYV WRLD ist die Muttermarke für Software, Automatisierungssysteme und unabhängige digitale Produkte.", company: "Unternehmen", automation: "Automation-Produkte", paths: "Produktpfade", rights: "Alle Rechte vorbehalten." },
    metadata: { home: ["AYV WRLD — Software, Automation & digitale Produkte", "AYV WRLD entwickelt praktische Software und unabhängige digitale Produkte."], projects: ["Projekte", "Kleuro, Rated und unabhängige AYV WRLD Projekte."], army: ["One Man Army Stack", "Das eigenständige AYV WRLD Produkt für Software-Builder."], automation: ["AYV Automation", "Sechs einzelne Automatisierungsprodukte und das separate Bundle."], stack: ["AYV Automation Stack", "Das transparente Sechs-Produkte-Bundle von AYV Automation."], about: ["Über AYV WRLD", "AYV WRLD ist eine unabhängige Muttermarke für fokussierte Software."] }
  },
  nl: {
    ...en, locale: "nl",
    nav: { projects: "Projecten", army: "One Man Army", automation: "Automation", products: "Producten", stack: "Automation Stack", about: "Over ons", explore: "Ontdek AYV WRLD", login: "Inloggen", menu: "Menu openen", close: "Menu sluiten" },
    common: { parent: "Onafhankelijk softwarebedrijf", available: "Beschikbaar", soon: "Binnenkort", development: "In ontwikkeling", learn: "Meer informatie", view: "Bekijk", back: "Terug", individual: "Los product", bundle: "Bundel", project: "Onafhankelijk project", perMonth: "/ maand", skip: "Ga naar inhoud", catalogMath: "Catalogusberekening", availability: "Beschikbaarheid", purchasedSeparately: "Waarde bij losse aankoop", plannedPrice: "Geplande bundelprijs", save: "Bespaar", includes: "Zes producten inbegrepen", individualNote: "Een bundelcheckout is nog niet beschikbaar. Beschikbare producten kunnen nog steeds los worden gekocht.", categories: { Acquire: "Werven", Schedule: "Plannen", Convert: "Converteren", Collect: "Innen", Retain: "Behouden", Reputation: "Reputatie" } },
    home: { ...en.home, eyebrow: "AYV WRLD · Moedermerk", title: "Bouw systemen. Automatiseer werk. Maak wat volgt.", body: "AYV WRLD bouwt praktische software, automatiseringssystemen en onafhankelijke digitale producten.", projectsCta: "Bekijk projecten", stacksCta: "Bekijk de producten", whatTitle: "Wat AYV WRLD doet", buildBody: "Gerichte software voor mensen die ideeën echte producten maken.", automateBody: "Operationele systemen die repetitief werk bij bedrijven weghalen.", experimentBody: "Onafhankelijke projecten die nuttige ideeën testen.", pathsTitle: "Twee producten. Twee aparte doelgroepen.", pathsBody: "One Man Army Stack is voor softwarebouwers. AYV Automation is voor bedrijven. Ze zijn onafhankelijk.", armyBody: "Een zelfstandig commercieel product voor builders, developers, oprichters, freelancers en toekomstige SaaS-oprichters.", armyCta: "Ontdek One Man Army", automationBody: "Een apart zakelijk ecosysteem: kies een los product of bekijk de verbonden bundel.", automationCta: "Ontdek Automation", productsTitle: "Zes onafhankelijke automatiseringsproducten", productsBody: "Kies één product, combineer later of bekijk de AYV Automation Stack-bundel.", stackTitle: "Eén bedrijf. Eén verbonden systeem.", stackBody: "Avyro, Velto, Rovyn, Orvyn, Nexro en Ravelo zijn losse producten. AYV Automation Stack bundelt ze alle zes.", stackCta: "Bekijk de bundel", projectsTitle: "Onafhankelijke AYV WRLD-projecten", projectsBody: "Kleuro en Rated vallen direct onder AYV WRLD, buiten de commerciële productpaden.", aboutTitle: "Onafhankelijk. Experimenteel. Praktisch.", aboutBody: "AYV WRLD bouwt gericht, leert van echt gebruik en verbetert wat telt.", aboutCta: "Over AYV WRLD", finalTitle: "Bouw iets. Automatiseer iets. Maak het echt.", finalBody: "Kies het pad dat past bij wat u bouwt of runt." },
    automation: { ...en.automation, title: "Automatisering rond terugkerend bedrijfswerk.", body: "AYV Automation is een productecosysteem voor bedrijven: koop een los product of bekijk de aparte bundel.", productsTitle: "Losse producten", productsBody: "Elk product staat op zichzelf en blijft afzonderlijk toegankelijk.", journeyTitle: "Een verbonden bedrijfsreis", journeyBody: "Werven → Plannen → Converteren → Innen → Behouden → Reputatie.", stackTitle: "De gelijkwaardige bundeloptie", stackBody: "AYV Automation Stack bevat alle zes producten. Het is de bundel, niet hun bovenliggende categorie.", stackCta: "Bekijk AYV Automation Stack" },
    army: { ...en.army, title: "Een commercieel productpad voor softwarebouwers.", body: "One Man Army Stack is voor builders, solo-oprichters, developers, freelancers en makers. Het staat los van AYV Automation.", lifecycle: "Van idee naar beter product", research: "Onderzoeken", researchBody: "Begrijp probleem, doelgroep en richting.", build: "Bouwen", buildBody: "Maak van een gericht idee werkende software.", deploy: "Uitrollen", deployBody: "Breng het product naar buiten.", monetize: "Verdienen", monetizeBody: "Maak een praktisch commercieel pad.", improve: "Verbeteren", improveBody: "Leer van gebruik en versterk wat telt.", status: "In ontwikkeling", cta: "Bekijk AYV WRLD-projecten" },
    projects: { ...en.projects, title: "Onafhankelijke projecten die nuttige ideeën verkennen.", body: "Kleuro, Rated en toekomstige projecten vallen direct onder AYV WRLD.", detailBody: "Een onafhankelijk AYV WRLD-project buiten Automation en One Man Army Stack.", all: "Alle projecten" },
    stack: { ...en.stack, title: "Zes gelijkwaardige producten. Eén bundel.", body: "AYV Automation Stack bundelt alle zes producten. Elk blijft los beschikbaar.", math: "€400 catalogustotaal met 50% korting: €200 per maand en €200 besparing", truth: "De bundelprijs is ter planning. Er is vandaag geen aparte Stripe-bundelcheckout; beschikbare abonnementen worden los gekocht.", connected: "Verbonden workflowwaarde", connectedBody: "Start met één product, voeg later toe en houd de klantreis verbonden.", cta: "Start met een beschikbaar product" },
    product: { ...en.product, products: "AYV Automation-producten", standalone: "Zelfstandige waarde", connected: "Verbonden waarde", connectedBody: "Gebruik dit product los of verbind het met gelijkwaardige producten via AYV Automation.", open: "Open", notify: "Momenteel in ontwikkeling", priceNote: "Maandprijs van het losse product.", stackLink: "Vergelijk Automation Stack", other: "Andere losse producten" },
    about: { ...en.about, title: "Een moedermerk voor gerichte software en nuttige experimenten.", body: "AYV WRLD bouwt onafhankelijk commerciële software, automatiseringssystemen en digitale projecten.", hierarchy: "Eén merk. Duidelijke paden.", hierarchyBody: "One Man Army Stack bedient softwarebouwers. AYV Automation bedient bedrijven met zes losse producten en een bundel. Kleuro en Rated blijven onafhankelijk." },
    footer: { body: "AYV WRLD is het moedermerk voor software, automatiseringssystemen en onafhankelijke digitale producten.", company: "Bedrijf", automation: "Automation-producten", paths: "Productpaden", rights: "Alle rechten voorbehouden." },
    metadata: { home: ["AYV WRLD — Software, automatisering & digitale producten", "AYV WRLD bouwt praktische software en onafhankelijke digitale producten."], projects: ["Projecten", "Ontdek Kleuro, Rated en onafhankelijke AYV WRLD-projecten."], army: ["One Man Army Stack", "Het zelfstandige AYV WRLD-product voor softwarebouwers."], automation: ["AYV Automation", "Zes losse automatiseringsproducten en de aparte bundel."], stack: ["AYV Automation Stack", "De transparante AYV Automation-bundel met zes producten."], about: ["Over AYV WRLD", "AYV WRLD is een onafhankelijk moedermerk voor gerichte software."] }
  }
};

export function getPublicCopy(locale: AppLocale) {
  return copy[locale];
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

const projectDescriptions: Record<AppLocale, Record<Project["slug"], string>> = {
  en: {
    kleuro: "A project for visualizing house exterior colours, with a future path toward painting estimates.",
    rated: "A personal and social project for rating music albums.",
  },
  fr: {
    kleuro: "Un projet pour visualiser les couleurs extérieures d’une maison, avec à terme une estimation de peinture.",
    rated: "Un projet personnel et social pour noter des albums de musique.",
  },
  de: {
    kleuro: "Ein Projekt zur Visualisierung von Hausfassadenfarben, später ergänzt um Kostenschätzungen für Anstriche.",
    rated: "Ein persönliches und soziales Projekt zum Bewerten von Musikalben.",
  },
  nl: {
    kleuro: "Een project om kleuren voor de buitenkant van huizen te visualiseren, later uitgebreid met schildersramingen.",
    rated: "Een persoonlijk en sociaal project om muziekalbums te beoordelen.",
  },
};

export function getProjectDescription(locale: AppLocale, slug: Project["slug"]) {
  return projectDescriptions[locale][slug];
}
