import { LegalPage } from "@/components/marketing/legal-page";
import { legacyModulesEnabled } from "@/config/features";
import { getLegalCopy, productLegal } from "@/config/legal";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const document = legacyModulesEnabled ? getLegalCopy(resolveLocale(await getLocale())).privacy : productLegal().privacy;
  return {
    title: document.title,
    description: document.description,
    alternates: { canonical: "/privacy" },
    openGraph: { title: document.title, description: document.description, url: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const document = legacyModulesEnabled ? getLegalCopy(resolveLocale(await getLocale())).privacy : productLegal().privacy;
  return <LegalPage document={document} draft={!legacyModulesEnabled} />;
}
