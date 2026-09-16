import { Badge } from "@/components/ui/badge";
import { ProductIcon } from "@/components/product-icon";
import type { ProductConfig } from "@/config/products";
import Link from "next/link";

export function ProductCard({ product }: { product: ProductConfig }) {
  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/8 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.05]">
      <div className="mb-8 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
          <ProductIcon product={product} className="h-5 w-5" />
        </span>
        <Badge tone={product.status === "active" ? "accent" : "neutral"}>
          {product.marketingStatus}
        </Badge>
      </div>
      <h3 className="display text-3xl">{product.name}</h3>
      <p className="mt-2 flex-1 text-sm text-muted">{product.tagline}</p>
      <Link
        href={`/products/${product.slug}`}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-white/10 text-sm hover:bg-white/5"
      >
        Product page
      </Link>
    </article>
  );
}
