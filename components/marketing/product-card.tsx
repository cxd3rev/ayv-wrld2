import { Badge } from "@/components/ui/badge";
import { ProductLogo } from "@/components/product-icon";
import { formatPrice, type ProductConfig } from "@/config/products";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export function ProductCard({
  product,
  index,
}: {
  product: ProductConfig;
  index: number;
}) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-7 transition-colors duration-300 hover:border-accent/40 hover:bg-card-hover"
    >
      <div className="relative flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-background">
          <ProductLogo product={product} size={32} className="mark-invert h-8 w-8" />
        </div>
        <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="relative mt-8">
        <div className="flex items-center gap-3">
          <h3 className="display text-2xl tracking-tight text-foreground">{product.name}</h3>
          <Badge tone={product.status === "active" ? "accent" : "neutral"}>
            {product.status === "active" ? t("common.ready") : t("common.comingSoon")}
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t(`catalog.${product.id}.description`)}</p>
        {product.pricing.monthly != null && (
          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="display text-xl tracking-tight text-foreground">
              {formatPrice(product.pricing.monthly, locale)}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              {t("common.perMonthShort")}
            </span>
          </p>
        )}
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors group-hover:text-accent">
          {t("common.viewProduct")}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
