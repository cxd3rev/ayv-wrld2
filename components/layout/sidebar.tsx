"use client";

import { Box, CalendarDays, CreditCard, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { automationBrand } from "@/config/brands";
import { dashboardNav } from "@/config/navigation";
import { ProductIcon } from "@/components/product-icon";
import Image from "next/image";
import { setActiveOrganization } from "@/lib/org-cookie";
import { cn } from "@/lib/utils";
import type { WorkspaceChoice } from "@/lib/auth/session";
import type { Organization } from "@/types/database";
import { legacyModulesEnabled } from "@/config/features";
import { products, type ProductConfig } from "@/config/products";
import { useRouter } from "next/navigation";

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
  workspaces,
}: {
  organization: Organization;
  product: ProductConfig;
  workspaces: WorkspaceChoice[];
}) {
  const pathname = usePathname();
  const router = useRouter();
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
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#121212] p-5 transition-transform lg:sticky lg:top-0 lg:bottom-auto lg:left-auto lg:z-30 lg:h-screen lg:self-start lg:overflow-y-auto lg:translate-x-0",
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
          {(legacyModulesEnabled
            ? dashboardNav.map((item) => ({
                href: item.href === "/dashboard/product" ? activeProduct.route : item.href,
                icon: item.icon,
                label:
                  item.href === "/dashboard/product"
                    ? t(`catalog.${activeProduct.id}.nav`)
                    : t(`dashboard.${navKeys[item.href]}`),
              }))
            : [
                { href: "/dashboard", icon: "layout" as const, label: "Overzicht" },
                { href: "/dashboard/klanten", icon: "box" as const, label: "Klanten" },
                { href: "/dashboard/afspraken", icon: "calendar" as const, label: "Afspraken" },
                { href: "/dashboard/settings", icon: "settings" as const, label: "Instellingen" },
                { href: "/dashboard/billing", icon: "card" as const, label: "Facturatie" },
              ]
          ).map((item) => {
            const Icon = icons[item.icon];
            const href = item.href;
            const productLabel = item.label;
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

        {workspaces.length > 1 ? (
          <label className="mb-4 block">
            <span className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
              {t("settings.switchWorkspace")}
            </span>
            <select
              className="mt-2 w-full rounded-lg border border-white/15 bg-transparent px-2 py-2 text-sm"
              value={organization.id}
              onChange={async (event) => {
                await setActiveOrganization(event.target.value);
                setOpen(false);
                router.refresh();
              }}
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex items-center gap-3 border-t border-white/10 pt-5">
          <ProductIcon product={activeProduct} size={32} className="h-8 w-8" />
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{t("common.currentProduct")}</p>
            <p className="mt-1 text-sm font-medium">{activeProduct.name}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
