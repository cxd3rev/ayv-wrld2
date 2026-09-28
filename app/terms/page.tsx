import { LegalPage } from "@/components/marketing/legal-page";
import { getLegalCopy } from "@/config/legal";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const document = getLegalCopy(resolveLocale(await getLocale())).terms;
  return {
    title: document.title,
    description: document.description,
    alternates: { canonical: "/terms" },
    openGraph: { title: document.title, description: document.description, url: "/terms" },
  };
}

export default async function TermsPage() {
  const document = getLegalCopy(resolveLocale(await getLocale())).terms;
  return <LegalPage document={document} />;
}
