"use client";

import { setLocaleAction } from "@/i18n/actions";
import { locales, type AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className={cn("inline-flex items-center", className)}>
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        value={locale}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value as AppLocale;
          startTransition(async () => {
            await setLocaleAction(next);
            router.refresh();
          });
        }}
        className="h-10 cursor-pointer rounded-full border border-border bg-transparent px-3 text-sm text-foreground outline-none transition-colors hover:border-foreground/30 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 disabled:opacity-60"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {t(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
