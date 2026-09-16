"use client";

import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { ProductIcon } from "@/components/product-icon";
import { products, type ProductId } from "@/config/products";
import { switchProduct } from "@/services/product-switch";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ProductSwitcher({ activeProductId }: { activeProductId: ProductId }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const active = products.find((product) => product.id === activeProductId) ?? products[0];

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
      <div className="px-3 py-2 text-xs tracking-[0.16em] text-muted uppercase">AYV WRLD</div>
      {products.map((product) => (
        <DropdownItem
          key={product.id}
          onClick={() => {
            startTransition(async () => {
              await switchProduct(product.id);
              router.push("/dashboard/product");
              router.refresh();
            });
          }}
        >
          <ProductIcon product={product} size={24} className="h-6 w-6" />
          <span className="flex-1">{product.name}</span>
          {product.status === "coming_soon" ? (
            <Badge>Coming soon</Badge>
          ) : (
            <Badge tone="accent">Ready</Badge>
          )}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
