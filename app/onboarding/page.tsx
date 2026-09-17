import { Atmosphere } from "@/components/atmosphere";
import { LanguageSwitcher } from "@/components/language-switcher";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Logo } from "@/components/logo";
import { getWorkspace } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.organization) redirect("/dashboard");
  const t = await getTranslations();

  return (
    <Atmosphere>
      <Link href="/" className="absolute top-8 left-6 z-20 text-sm text-foreground/55 hover:text-foreground lg:left-12">
        {t("common.backHome")}
      </Link>
      <div className="absolute top-8 right-6 z-20 lg:right-12">
        <LanguageSwitcher />
      </div>
      <div className="arch-grid opacity-40" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-24">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="kicker mx-auto mt-12">{t("onboarding.kicker")}</p>
        <h1 className="display mt-4 text-center text-4xl tracking-tight lg:text-5xl">{t("onboarding.title")}</h1>
        <p className="mt-4 mb-10 text-center text-sm leading-6 text-muted">{t("onboarding.body")}</p>
        <OnboardingForm />
      </div>
    </Atmosphere>
  );
}
