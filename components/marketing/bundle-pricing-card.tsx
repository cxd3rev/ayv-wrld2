import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  BUNDLE_DISCOUNT,
  bundlePricing,
  formatPrice,
  products,
} from "@/config/products";

type BundlePricingCardProps = {
  locale: string;
  labels: {
    bundle: string;
    purchasedSeparately: string;
    plannedPrice: string;
    save: string;
    perMonth: string;
    includes: string;
    individualNote: string;
  };
  cta: {
    href: string;
    label: string;
  };
  className?: string;
};

export function BundlePricingCard({
  locale,
  labels,
  cta,
  className = "",
}: BundlePricingCardProps) {
  const discountPercent = Math.round(BUNDLE_DISCOUNT * 100);
  const fullPrice = formatPrice(bundlePricing.fullMonthly, locale);
  const bundlePrice = formatPrice(bundlePricing.discountedMonthly, locale);
  const savings = formatPrice(bundlePricing.savingsMonthly, locale);

  return (
    <article
      className={`overflow-hidden border border-foreground/20 bg-background ${className}`}
      aria-label="AYV Automation Stack"
    >
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-border p-6 sm:p-8 lg:border-r lg:border-b-0 lg:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {labels.purchasedSeparately}
          </p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
            <del className="display text-3xl text-muted decoration-1 sm:text-4xl">
              {fullPrice}
            </del>
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {labels.perMonth}
            </span>
          </p>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {labels.includes}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <li
                key={product.id}
                className="bg-card px-3 py-3 text-center font-mono text-[10px] uppercase tracking-[0.1em]"
              >
                {product.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="kicker">{labels.bundle}</p>
              <span className="border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                {labels.save} {discountPercent}% · {savings} {labels.perMonth}
              </span>
            </div>
            <h3 className="display mt-6 text-3xl tracking-tight sm:text-4xl">
              AYV Automation Stack
            </h3>
            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              {labels.plannedPrice}
            </p>
            <p className="mt-2 flex flex-wrap items-end gap-x-3">
              <span className="display text-6xl leading-none sm:text-7xl">
                {bundlePrice}
              </span>
              <span className="pb-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                {labels.perMonth}
              </span>
            </p>
          </div>

          <div className="mt-9 border-t border-border pt-6">
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              {labels.individualNote}
            </p>
            <Link href={cta.href} className="button-primary mt-6 w-full sm:w-fit">
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
