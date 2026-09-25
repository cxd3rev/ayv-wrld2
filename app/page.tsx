import { StackHome } from "@/components/marketing/stack-home";
import { PublicShell } from "@/components/marketing/public-site";
import { getStackCopy } from "@/config/stack-marketing";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const c = getStackCopy(resolveLocale(await getLocale()));
  return {
    title: c.hero.eyebrow,
    description: c.hero.body,
    alternates: { canonical: "/" },
    openGraph: { title: c.hero.eyebrow, description: c.hero.body, url: "/" },
  };
}

export default async function HomePage() {
  const locale = resolveLocale(await getLocale());
  return (
    <PublicShell>
      <StackHome locale={locale} />
    </PublicShell>
  );
}
