"use client";

import { Box, CalendarDays, CreditCard, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dashboardNav } from "@/config/navigation";
import { Logo } from "@/components/logo";
import { ProductIcon } from "@/components/product-icon";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/database";
import { products, type ProductConfig } from "@/config/products";

const icons = {
  layout: LayoutDashboard,
  calendar: CalendarDays,
  box: Box,
  settings: Settings,
  card: CreditCard,
};

const navKeys: Record<
  string,
  "navOverview" | "navCalendar" | "navProduct" | "navSettings" | "navBilling"
> = {
  "/dashboard": "navOverview",
  "/dashboard/calendar": "navCalendar",
  "/dashboard/product": "navProduct",
  "/dashboard/settings": "navSettings",
  "/dashboard/billing": "navBilling",
};

export function Sidebar({
  organization,
  product,
}: {
  organization: Organization;
  product: ProductConfig;
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const activeProduct = products.find((item) => pathname === item.route) ?? product;

  return (
    <>
      <button
        type="button"
        className="workspace-card fixed top-4 left-4 z-40 p-2 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label={t("common.openMenu")}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          aria-label={t("common.closeMenu")}
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#121212] p-5 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            className="p-1 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label={t("common.closeMenu")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="kicker mb-6">{organization.name}</p>

        <nav className="flex flex-1 flex-col gap-1">
          {dashboardNav.map((item) => {
            const Icon = icons[item.icon];
            const href = item.href === "/dashboard/product" ? activeProduct.route : item.href;
            const productLabel =
              item.href === "/dashboard/product" ? t(`catalog.${activeProduct.id}.nav`) : t(`dashboard.${navKeys[item.href]}`);
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-accent-soft text-foreground"
                    : "text-muted hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-accent")} />
                {productLabel}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/10 pt-5">
          <ProductIcon product={activeProduct} size={32} className="h-8 w-8" />
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{t("common.currentProduct")}</p>
            <p className="mt-1 text-sm font-medium" style={{ color: activeProduct.accent }}>
              {activeProduct.name}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
