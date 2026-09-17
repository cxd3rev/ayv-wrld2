"use client";

import { Atmosphere } from "@/components/atmosphere";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  return (
    <Atmosphere>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="kicker">{t("errorKicker")}</p>
        <h1 className="display mt-4 text-5xl tracking-tight">{t("errorTitle")}</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted">{t("errorBody")}</p>
        <div className="mt-10 flex gap-3">
          <Button onClick={reset} size="lg">
            {t("tryAgain")}
          </Button>
          <Link
            href="/"
            className="inline-flex h-14 items-center rounded-full border border-foreground/20 px-8 text-base hover:bg-foreground/5"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </Atmosphere>
  );
}
