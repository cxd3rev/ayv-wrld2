"use client";

import { Box, CreditCard, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dashboardNav } from "@/config/navigation";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/database";
import type { ProductConfig } from "@/config/products";

const icons = {
  layout: LayoutDashboard,
  box: Box,
  settings: Settings,
  card: CreditCard,
};

export function Sidebar({
  organization,
  product,
}: {
  organization: Organization;
  product: ProductConfig;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed top-3 left-3 z-40 rounded-full border border-white/10 bg-card p-2 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/8 bg-[#0a0a0c] p-4 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <Logo />
          <button
            type="button"
            className="rounded-lg p-1 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 px-3 text-[11px] tracking-[0.18em] text-muted uppercase">
          {organization.name}
        </p>

        <nav className="flex flex-1 flex-col gap-1">
          {dashboardNav.map((item) => {
            const Icon = icons[item.icon];
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/8 text-foreground"
                    : "text-muted hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-white/8 p-3">
          <p className="text-xs text-muted">Current product</p>
          <p className="mt-1 text-sm font-medium" style={{ color: product.accent }}>
            {product.name}
          </p>
        </div>
      </aside>
    </>
  );
}
