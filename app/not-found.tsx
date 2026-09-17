import { Atmosphere } from "@/components/atmosphere";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <Atmosphere>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="kicker">404</p>
        <h1 className="display mt-4 text-5xl tracking-tight">{t("notFoundTitle")}</h1>
        <p className="mt-4 text-sm text-muted">{t("notFoundBody")}</p>
        <Link
          href="/"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90"
        >
          {t("backHome")}
        </Link>
      </div>
    </Atmosphere>
  );
}
