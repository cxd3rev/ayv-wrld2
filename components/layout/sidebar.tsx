"use client";

import { Box, CalendarDays, CreditCard, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { automationBrand } from "@/config/brands";
import { dashboardNav } from "@/config/navigation";
import { ProductSwitcher } from "@/components/layout/product-switcher";
import Image from "next/image";
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
          <Link href="/dashboard" className="inline-flex items-center gap-2.5">
            <Image src={automationBrand.logo} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="text-sm font-semibold tracking-tight">AYV workspace</span>
          </Link>
          <button
            type="button"
            className="p-1 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label={t("common.closeMenu")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {dashboardNav
            .filter((item) => item.href === "/dashboard" || item.href === "/dashboard/calendar")
            .map((item) => {
              const Icon = icons[item.icon];
              const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-accent-soft text-foreground" : "text-muted hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active && "text-accent")} />
                  {t(`dashboard.${navKeys[item.href]}`)}
                </Link>
              );
            })}
          <div className="my-3 border-t border-white/10" />
          <ProductSwitcher activeProductId={activeProduct.id} layout="list" onNavigate={() => setOpen(false)} />
          <div className="my-3 border-t border-white/10" />
          {dashboardNav
            .filter((item) => item.href === "/dashboard/settings" || item.href === "/dashboard/billing")
            .map((item) => {
              const Icon = icons[item.icon];
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-accent-soft text-foreground" : "text-muted hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active && "text-accent")} />
                  {t(`dashboard.${navKeys[item.href]}`)}
                </Link>
              );
            })}
        </nav>
      </aside>
    </>
  );
}
