"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { settingsNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function SettingsNav() {
  const pathname = usePathname();

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
              "rounded-full border px-4 py-2 text-sm",
              active
                ? "border-accent/30 bg-accent-soft text-accent"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
