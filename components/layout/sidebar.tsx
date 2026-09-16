"use client";

import { Box, CreditCard, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dashboardNav } from "@/config/navigation";
import { Logo } from "@/components/logo";
import { ProductIcon } from "@/components/product-icon";
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
        className="fixed top-4 left-4 z-40 border border-foreground/10 bg-background p-2 lg:hidden"
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-foreground/10 bg-background p-6 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            className="p-1 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="kicker mb-6">{organization.name}</p>

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
                  "flex items-center gap-3 border-l px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:border-foreground/20 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-foreground/10 pt-5">
          <ProductIcon product={product} size={32} className="h-8 w-8" />
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Current product</p>
            <p className="mt-1 text-sm font-medium" style={{ color: product.accent }}>
              {product.name}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
