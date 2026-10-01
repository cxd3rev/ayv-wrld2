import { LegalPage } from "@/components/marketing/legal-page";
import { legacyModulesEnabled } from "@/config/features";
import { getLegalCopy, legalContact } from "@/config/legal";
import { PRODUCT_NAME } from "@/config/site";
import { resolveLocale } from "@/i18n/config";
import { BUSINESS } from "@/lib/business";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

function productPrivacy() {
  return {
    updated: "2 oktober 2026",
    title: "Privacy",
    description: `Welke gegevens ${PRODUCT_NAME} bewaart.`,
    intro: `${PRODUCT_NAME} wordt gevoerd door ${BUSINESS.owner} vanuit België. Vragen: ${legalContact}.`,
    sections: [
      {
        title: "Wat we bewaren",
        paragraphs: [
          "Account, bedrijfsgegevens, klanten, adressen, ketels, afspraken, attesten en de e-mails die de herinnering verstuurt.",
        ],
      },
      {
        title: "Wie ze verwerkt",
        paragraphs: [
          "De database en bestanden staan bij Supabase. Betalingen, zodra die aanstaan, lopen via Stripe. E-mail loopt via Resend. De site draait op Vercel.",
        ],
      },
    ],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const document = legacyModulesEnabled ? getLegalCopy(resolveLocale(await getLocale())).privacy : productPrivacy();
  return {
    title: document.title,
    description: document.description,
    alternates: { canonical: "/privacy" },
    openGraph: { title: document.title, description: document.description, url: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const document = legacyModulesEnabled ? getLegalCopy(resolveLocale(await getLocale())).privacy : productPrivacy();
  return <LegalPage document={document} />;
}
