import { Badge } from "@/components/ui/badge";
import { ProductLogo } from "@/components/product-icon";
import type { ProductConfig } from "@/config/products";
import Link from "next/link";

export function ProductCard({
  product,
  index,
}: {
  product: ProductConfig;
  index: number;
}) {
  return (
    <article className="group border-b border-foreground/10">
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:gap-16 lg:py-16"
      >
        <span className="font-mono text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
        <ProductLogo product={product} size={72} className="h-[72px] w-[72px]" />
        <div className="flex-1">
          <h3 className="display text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
            {product.name}
          </h3>
          <p className="mt-2 text-lg leading-relaxed text-muted">{product.tagline}</p>
        </div>
        <Badge tone={product.status === "active" ? "accent" : "neutral"}>
          {product.marketingStatus}
        </Badge>
        <span className="text-sm text-foreground/70 transition-colors group-hover:text-foreground">
          Product page →
        </span>
      </Link>
    </article>
  );
}
