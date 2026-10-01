import { LegalPage } from "@/components/marketing/legal-page";
import { legacyModulesEnabled } from "@/config/features";
import { getLegalCopy, legalContact } from "@/config/legal";
import { ONDERHOUD_TRIAL_DAYS } from "@/config/onderhoud";
import { PRODUCT_NAME } from "@/config/site";
import { resolveLocale } from "@/i18n/config";
import { BUSINESS } from "@/lib/business";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

function productTerms() {
  return {
    updated: "2 oktober 2026",
    title: "Voorwaarden",
    description: `Voorwaarden voor ${PRODUCT_NAME}.`,
    intro: `${PRODUCT_NAME} is software voor verwarmingsinstallateurs in Vlaanderen. ${BUSINESS.owner} voert de dienst vanuit België. Vragen: ${legalContact}.`,
    sections: [
      {
        title: "De dienst",
        paragraphs: [
          `${PRODUCT_NAME} bewaart klanten, adressen, ketels, berekende onderhoudsdatums, afspraken en attesten voor één installatiebedrijf.`,
        ],
      },
      {
        title: "Prijs",
        paragraphs: [
          `Het maandbedrag is nog niet vastgelegd. Zodra betalen aanstaat, krijgt het eerste abonnement ${ONDERHOUD_TRIAL_DAYS} dagen proef.`,
        ],
      },
    ],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const document = legacyModulesEnabled ? getLegalCopy(resolveLocale(await getLocale())).terms : productTerms();
  return {
    title: document.title,
    description: document.description,
    alternates: { canonical: "/terms" },
    openGraph: { title: document.title, description: document.description, url: "/terms" },
  };
}

export default async function TermsPage() {
  const document = legacyModulesEnabled ? getLegalCopy(resolveLocale(await getLocale())).terms : productTerms();
  return <LegalPage document={document} />;
}
