"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { settingsNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const keys: Record<string, "general" | "team" | "billing" | "account"> = {
  "/dashboard/settings": "general",
  "/dashboard/settings/team": "team",
  "/dashboard/settings/billing": "billing",
  "/dashboard/settings/account": "account",
};

export function SettingsNav() {
  const pathname = usePathname();
  const t = useTranslations("settings");

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {settingsNav.map((item) => {
        const active =
          item.href === "/dashboard/settings"
            ? pathname === "/dashboard/settings"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/15 text-muted hover:text-foreground",
            )}
          >
            {t(keys[item.href])}
          </Link>
        );
      })}
    </div>
  );
}
