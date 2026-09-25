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

export function ProductSwitcher({ activeProductId }: { activeProductId: ProductId }) {
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
    if (!product || product.id === active.id) return;
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

  return (
    <Dropdown
      align="left"
      className="w-64 p-1.5"
      trigger={
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3 text-sm hover:bg-white/10"
        >
          <ProductIcon product={active} size={22} className="h-6 w-6" />
          <span className="font-medium">{active.name}</span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      }
    >
      {products.map((product) => {
        const selected = product.id === active.id;
        return (
          <DropdownItem
            key={product.id}
            onClick={() => openProduct(product.id)}
            className={cn("min-h-11 rounded-xl px-3", selected && "bg-white/10 text-foreground")}
          >
            <ProductIcon product={product} size={22} className="h-6 w-6" />
            <span className="flex-1">{product.name}</span>
            {product.status === "coming_soon" ? <Badge>{t("comingSoon")}</Badge> : null}
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
}
