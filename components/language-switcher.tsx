"use client";

import { setLocaleAction } from "@/i18n/actions";
import { locales, resolveLocale, type AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = resolveLocale(useLocale());
  const t = useTranslations("language");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: AppLocale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("label")}
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-[#1a1a1a] px-3 text-sm font-medium text-[#ededed] hover:border-white/45 disabled:opacity-60"
      >
        {t(locale)}
        <ChevronDown className={cn("h-4 w-4 text-[#ededed] transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/15 bg-[#141414] py-1 text-[#ededed] shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
        >
          {locales.map((code) => {
            const selected = code === locale;
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#ededed]",
                    selected ? "bg-[#2a3358]" : "hover:bg-white/10",
                  )}
                >
                  {t(code)}
                  {selected ? <Check className="h-4 w-4 text-[#b3c0ff]" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
