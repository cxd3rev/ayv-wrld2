import { Badge } from "@/components/ui/badge";
import { ProductLogo } from "@/components/product-icon";
import type { ProductConfig } from "@/config/products";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function ProductCard({
  product,
  index,
}: {
  product: ProductConfig;
  index: number;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-7 transition-colors duration-300 hover:border-accent/50 hover:bg-card-hover"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(90% 60% at 80% 0%, rgba(216,173,85,0.1), transparent 70%)",
        }}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-background">
          <ProductLogo
            product={product}
            size={32}
            className="mark-invert h-8 w-8"
          />
        </div>
        <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="relative mt-8">
        <div className="flex items-center gap-3">
          <h3 className="display text-2xl tracking-tight">{product.name}</h3>
          <Badge tone={product.status === "active" ? "accent" : "neutral"}>
            {product.marketingStatus}
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors group-hover:text-accent">
          View product
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
