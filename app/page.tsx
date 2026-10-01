import { HomePage } from "@/components/home/home-page";
import { getHomeCopy } from "@/components/home/home-copy";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const c = getHomeCopy(resolveLocale(await getLocale()));
  return {
    title: "AYV Stack Automation",
    description: c.subtext,
    alternates: { canonical: "/" },
    openGraph: { title: "AYV Stack Automation", description: c.subtext, url: "/" },
  };
}

export default async function Page() {
  const locale = resolveLocale(await getLocale());
  return <HomePage locale={locale} />;
}
