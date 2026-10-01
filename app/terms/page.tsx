import { LegalPage } from "@/components/marketing/legal-page";
import { legacyModulesEnabled } from "@/config/features";
import { getLegalCopy, productLegal } from "@/config/legal";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const document = legacyModulesEnabled ? getLegalCopy(resolveLocale(await getLocale())).terms : productLegal().terms;
  return {
    title: document.title,
    description: document.description,
    alternates: { canonical: legacyModulesEnabled ? "/terms" : "/voorwaarden" },
    openGraph: { title: document.title, description: document.description, url: legacyModulesEnabled ? "/terms" : "/voorwaarden" },
  };
}

export default async function TermsPage() {
  if (!legacyModulesEnabled) redirect("/voorwaarden");
  const document = getLegalCopy(resolveLocale(await getLocale())).terms;
  return <LegalPage document={document} />;
}
