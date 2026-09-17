import { Atmosphere } from "@/components/atmosphere";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");

  return (
    <Atmosphere>
      <Link
        href="/"
        className="absolute top-8 left-6 z-20 text-sm text-foreground/55 hover:text-foreground lg:left-12"
      >
        {t("backHome")}
      </Link>
      <div className="absolute top-8 right-6 z-20 lg:right-12">
        <LanguageSwitcher />
      </div>
      <div className="arch-grid opacity-40" />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-[420px] text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          {title ? (
            <>
              <p className="kicker mx-auto mt-12">{tAuth("kicker")}</p>
              <h1 className="display mt-4 text-5xl leading-tight tracking-tight lg:text-6xl">{title}</h1>
            </>
          ) : null}
          {description ? <p className="mt-4 text-sm leading-6 text-muted">{description}</p> : null}
          <div className="mt-10 border-t border-foreground/10 pt-8 text-left">{children}</div>
        </div>
      </div>
    </Atmosphere>
  );
}

export function AuthMessage({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const t = useTranslations("auth");
  return (
    <div className="text-center">
      <p className="kicker mx-auto">{t("checkInbox")}</p>
      <h1 className="display mt-4 text-4xl tracking-tight lg:text-5xl">{title}</h1>
      <p className="mt-4 text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
