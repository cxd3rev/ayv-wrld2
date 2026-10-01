import { StackHome } from "@/components/marketing/stack-home";
import { OnderhoudHome } from "@/components/marketing/onderhoud-home";
import { PublicShell } from "@/components/marketing/public-site";
import { legacyModulesEnabled } from "@/config/features";
import { getStackCopy } from "@/config/stack-marketing";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  if (!legacyModulesEnabled) {
    const title = "AYV Onderhoud";
    const description = "Onderhoudsdatums voor verwarmingsinstallateurs in Vlaanderen, berekend per ketel.";
    return { title, description, alternates: { canonical: "/" }, openGraph: { title, description, url: "/" } };
  }
  const c = getStackCopy(resolveLocale(await getLocale()));
  return {
    title: c.hero.eyebrow,
    description: c.hero.body,
    alternates: { canonical: "/" },
    openGraph: { title: c.hero.eyebrow, description: c.hero.body, url: "/" },
  };
}

export default async function HomePage() {
  if (!legacyModulesEnabled) {
    return (
      <PublicShell>
        <OnderhoudHome />
      </PublicShell>
    );
  }
  const locale = resolveLocale(await getLocale());
  return (
    <PublicShell>
      <StackHome locale={locale} />
    </PublicShell>
  );
}
