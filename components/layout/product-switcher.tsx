"use client";

import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { ProductIcon } from "@/components/product-icon";
import { products, type ProductId } from "@/config/products";
import { cn } from "@/lib/utils";
import { switchProduct } from "@/services/product-switch";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

export function ProductSwitcher({
  activeProductId,
  layout = "menu",
  onNavigate,
}: {
  activeProductId: ProductId;
  layout?: "menu" | "list" | "rail";
  onNavigate?: () => void;
}) {
  const t = useTranslations("common");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const routeProduct = products.find(
    (product) => product.status === "active" && (pathname === product.route || pathname.startsWith(`${product.route}/`)),
  );
  const active = routeProduct ?? products.find((product) => product.id === activeProductId) ?? products[0];

  function openProduct(productId: ProductId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    onNavigate?.();
    startTransition(async () => {
      if (product.status === "active") {
        await switchProduct(product.id);
        router.push(product.route);
      } else {
        router.push(`/products/${product.slug}`);
      }
      router.refresh();
    });
  }

  if (layout === "list" || layout === "rail") {
    return (
      <div className={layout === "rail" ? "flex items-center gap-1" : "flex flex-col gap-1"}>
        {products.map((product) => {
          const selected = product.id === active.id && product.status === "active";
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => openProduct(product.id)}
              className={cn(
                "flex items-center gap-2 rounded-full text-sm transition-colors",
                layout === "rail" ? "px-2.5 py-1.5" : "w-full px-3 py-2 text-left",
                selected ? "bg-accent-soft text-foreground" : "text-muted hover:bg-white/5 hover:text-foreground",
              )}
            >
              <ProductIcon product={product} size={20} className="h-5 w-5" />
              <span className={layout === "rail" ? "whitespace-nowrap" : "flex-1"}>{product.name}</span>
              {layout === "list" && product.status === "coming_soon" ? <Badge>{t("comingSoon")}</Badge> : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Dropdown
      align="left"
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-3 py-2 text-sm hover:bg-foreground/5"
        >
          <ProductIcon product={active} size={24} className="h-6 w-6" />
          <span>{active.name}</span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      }
    >
      <div className="px-3 py-2 text-xs tracking-[0.16em] text-muted uppercase">AYV workspace</div>
      {products.map((product) => (
        <DropdownItem key={product.id} onClick={() => openProduct(product.id)}>
          <ProductIcon product={product} size={24} className="h-6 w-6" />
          <span className="flex-1">{product.name}</span>
          {product.status === "coming_soon" ? <Badge>{t("comingSoon")}</Badge> : null}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
