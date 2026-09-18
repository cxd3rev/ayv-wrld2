import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { Badge } from "@/components/ui/badge";
import { ProductLogo } from "@/components/product-icon";
import { bundlePricing, formatPrice, getProduct, products } from "@/config/products";
import { openProductWorkspace } from "@/services/product-switch";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations();
  const locale = await getLocale();
  const isActive = product.status === "active";
  const productNumber = String(products.findIndex((p) => p.id === product.id) + 1).padStart(2, "0");
  const others = products.filter((p) => p.id !== product.id).slice(0, 3);
  const highlights = [
    t(`catalog.${product.id}.highlight1`),
    t(`catalog.${product.id}.highlight2`),
    t(`catalog.${product.id}.highlight3`),
  ];

  return (
    <Atmosphere>
      <MarketingHeader />
      <main className="relative">
        <section className="relative overflow-hidden border-b border-border">
          <div className="dot-field" />
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pt-10 pb-20 lg:px-12 lg:pt-14 lg:pb-28">
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("productPage.allProducts")}
            </Link>

            <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
              <div>
                <div className="flex items-center gap-3">
                  <p className="kicker">{t(`catalog.${product.id}.tagline`)}</p>
                  <Badge tone={isActive ? "accent" : "neutral"}>
                    {product.marketingStatus === "Coming soon"
                      ? t("common.comingSoon")
                      : t("common.inDevelopment")}
                  </Badge>
                </div>
                <h1 className="display mt-7 text-6xl tracking-tight lg:text-8xl">{product.name}</h1>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted text-pretty lg:text-xl">
                  {t(`catalog.${product.id}.longDescription`)}
                </p>

                <div className="mt-10 flex flex-wrap items-end gap-x-8 gap-y-4">
                  {product.pricing.monthly != null ? (
                    <p className="flex items-baseline gap-2">
                      <span className="display text-5xl tracking-tight">
                        {formatPrice(product.pricing.monthly, locale)}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                        {t("common.perMonth")}
                      </span>
                    </p>
                  ) : (
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
                      {t("common.comingSoon")}
                    </p>
                  )}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  {isActive ? (
                    <form action={openProductWorkspace}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button
                        type="submit"
                        className="group inline-flex h-14 items-center rounded-full bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                      >
                        {t("productPage.openProduct", { name: product.name })}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/signup"
                      className="group inline-flex h-14 items-center rounded-full bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                    >
                      {t("productPage.getNotified")}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                  <Link
                    href="/signup"
                    className="inline-flex h-14 items-center rounded-full border border-border bg-card px-8 text-base font-medium transition-colors hover:bg-card-hover"
                  >
                    {t("productPage.createAccount")}
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div
                  className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-card"
                  style={{
                    backgroundImage: `radial-gradient(120% 120% at 50% 0%, ${product.accent}1f, transparent 60%)`,
                  }}
                >
                  <span className="absolute left-6 top-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    {productNumber}
                  </span>
                  <span
                    className="absolute right-6 top-6 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: isActive ? product.accent : "var(--border)" }}
                  />
                  <ProductLogo product={product} size={220} className="mark-invert h-40 w-40 lg:h-52 lg:w-52" />
                  <span className="absolute bottom-6 left-6 right-6 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                    {t(`catalog.${product.id}.description`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="kicker">{t("productPage.whatItDoes")}</p>
              <h2 className="display mt-6 max-w-md text-3xl leading-tight tracking-tight lg:text-5xl text-balance">
                {t("productPage.builtForOneJob")}
              </h2>
            </div>
            <ul className="flex flex-col">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-5 border-t border-border py-6 last:border-b"
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border"
                    style={{ backgroundColor: `${product.accent}14` }}
                  >
                    <Check className="h-4 w-4" style={{ color: product.accent }} strokeWidth={2.5} />
                  </span>
                  <span className="text-lg leading-relaxed text-foreground/90 text-pretty">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-6 pb-20 lg:px-12 lg:pb-28">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 lg:p-10">
              <div>
                <p className="kicker">{t("productPage.plan", { name: product.name })}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  {product.pricing.monthly != null ? (
                    <>
                      <span className="display text-5xl tracking-tight">
                        {formatPrice(product.pricing.monthly, locale)}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                        {t("common.perMonth")}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-sm uppercase tracking-[0.14em] text-muted">
                      {t("common.comingSoon")}
                    </span>
                  )}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{t("productPage.planBody")}</p>
              </div>
              <Link
                href="/signup"
                className="group mt-8 inline-flex h-12 w-fit items-center rounded-full border border-border bg-background px-7 text-sm font-medium transition-colors hover:bg-card-hover"
              >
                {t("productPage.startWith", { name: product.name })}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-accent/30 bg-accent-soft p-8 lg:p-10">
              <div>
                <div className="flex items-center gap-3">
                  <p className="kicker">{t("bundle.kicker")}</p>
                  <Badge tone="accent">{t("common.save50")}</Badge>
                </div>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="display text-5xl tracking-tight">
                    {formatPrice(bundlePricing.discountedMonthly, locale)}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    {t("common.perMonth")}
                  </span>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {t("bundle.productBody", { name: product.name })}
                </p>
              </div>
              <Link
                href="/signup"
                className="group mt-8 inline-flex h-12 w-fit items-center rounded-full bg-accent px-7 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                {t("bundle.cta")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-24">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="kicker">{t("productPage.keepExploring")}</p>
                <h2 className="display mt-6 text-3xl tracking-tight lg:text-4xl">{t("productPage.otherTools")}</h2>
              </div>
              <Link
                href="/#products"
                className="hidden shrink-0 items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground sm:inline-flex"
              >
                {t("common.viewAll")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/products/${other.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-7 transition-colors duration-300 hover:border-accent/40 hover:bg-card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background">
                      <ProductLogo product={other} size={28} className="mark-invert h-7 w-7" />
                    </div>
                    <Badge tone={other.status === "active" ? "accent" : "neutral"}>
                      {other.marketingStatus === "Coming soon"
                        ? t("common.comingSoon")
                        : t("common.inDevelopment")}
                    </Badge>
                  </div>
                  <div className="mt-8">
                    <h3 className="display text-xl tracking-tight">{other.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{t(`catalog.${other.id}.description`)}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors group-hover:text-accent">
                      {t("common.viewProduct")}
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </Atmosphere>
  );
}
