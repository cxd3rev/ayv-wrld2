import { StackHome } from "@/components/marketing/stack-home";
import { InstallerHome } from "@/components/marketing/installer-home";
import { PublicShell } from "@/components/marketing/public-site";
import { legacyModulesEnabled } from "@/config/features";
import { PRODUCT_DESCRIPTION, PRODUCT_TITLE } from "@/config/site";
import { getStackCopy } from "@/config/stack-marketing";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  if (!legacyModulesEnabled) {
    return {
      title: { absolute: PRODUCT_TITLE },
      description: PRODUCT_DESCRIPTION,
      alternates: { canonical: "/" },
      openGraph: { title: PRODUCT_TITLE, description: PRODUCT_DESCRIPTION, url: "/" },
    };
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
        <InstallerHome />
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
