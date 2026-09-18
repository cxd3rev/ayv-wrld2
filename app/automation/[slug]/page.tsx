import { AutomationProductCard, Breadcrumbs, CTASection, PublicShell, SectionHeading } from "@/components/marketing/public-site";
import { ProductLogo } from "@/components/product-icon";
import { formatPrice, getProduct, products } from "@/config/products";
import { getPublicCopy } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  const t = await getTranslations();
  const title = `${product.name} — ${t(`catalog.${product.id}.tagline`)}`;
  const description = t(`catalog.${product.id}.longDescription`);
  return {
    title,
    description,
    alternates: { canonical: product.marketingRoute },
    openGraph: { title, description, url: product.marketingRoute, images: [{ url: product.assets.logo, alt: product.name }] },
  };
}

export default async function AutomationProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const locale = resolveLocale(await getLocale());
  const c = getPublicCopy(locale);
  const t = await getTranslations();
  const highlights = ([1, 2, 3] as const).map((number) => t(`catalog.${product.id}.highlight${number}`));
  const others = products.filter((item) => item.id !== product.id).slice(0, 3);
  const active = product.status === "active";
  const description = t(`catalog.${product.id}.longDescription`);
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description,
    applicationCategory: "BusinessApplication",
    brand: { "@type": "Brand", name: "AYV WRLD" },
    ...(active ? { offers: { "@type": "Offer", price: product.pricing.monthly, priceCurrency: "EUR", availability: "https://schema.org/InStock" } } : {}),
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
      <main id="main-content">
        <section className="relative overflow-hidden border-b border-border">
          <div className="technical-grid" aria-hidden />
          <div className="relative mx-auto w-full max-w-[1400px] px-6 py-16 lg:px-12 lg:py-24">
            <Breadcrumbs items={[{ label: "AYV WRLD", href: "/" }, { label: "AYV Automation", href: "/automation" }, { label: product.name }]} />
            <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="kicker">{c.common.categories[product.category]} · {c.common.individual}</p>
                  <span className="border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{active ? c.common.available : c.common.soon}</span>
                </div>
                <h1 className="display mt-7 text-[clamp(4rem,10vw,8.5rem)] leading-none">{product.name}</h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{description}</p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <p className="display text-5xl">{formatPrice(product.pricing.monthly ?? 0, locale)}<span className="ml-2 font-mono text-xs font-normal uppercase tracking-[0.12em] text-muted">{c.common.perMonth}</span></p>
                  {active ? (
                    <Link href={product.route} className="button-primary">{c.product.open} {product.name}<ArrowRight className="h-4 w-4" /></Link>
                  ) : (
                    <span className="button-secondary cursor-default" aria-label={`${product.name}: ${c.product.notify}`}>{c.product.notify}</span>
                  )}
                </div>
                <p className="mt-4 text-xs text-muted">{c.product.priceNote}</p>
              </div>
              <div className="hero-frame relative flex aspect-square items-center justify-center p-12">
                <div className="absolute inset-[18%] border border-border" style={{ boxShadow: `0 0 90px ${product.accent}1f` }} />
                <ProductLogo product={product} size={420} className="mark-invert relative h-auto w-3/5 object-contain" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1400px] gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-28">
          <SectionHeading eyebrow={c.product.standalone} title={t(`catalog.${product.id}.tagline`)} body={description} />
          <ul className="border-t border-border">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-4 border-b border-border py-6 text-lg">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border" style={{ color: product.accent }}><Check className="h-4 w-4" /></span>
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-16 lg:grid-cols-2 lg:px-12 lg:py-20">
            <SectionHeading eyebrow={c.product.connected} title={`${product.name} + AYV Automation`} body={c.product.connectedBody} />
            <Link href="/automation/stack" className="flex min-h-56 flex-col justify-between border border-border bg-background p-7 transition hover:border-foreground/30">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{c.common.bundle}</span>
              <span className="display text-3xl">AYV Automation Stack</span>
              <span className="inline-flex items-center gap-2 text-sm">{c.product.stackLink}<ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow="AYV AUTOMATION" title={c.product.other} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <AutomationProductCard key={other.id} product={other} description={t(`catalog.${other.id}.description`)} status={other.status === "active" ? c.common.available : c.common.soon} cta={c.common.view} price={`${formatPrice(other.pricing.monthly ?? 0, locale)} ${c.common.perMonth}`} category={c.common.categories[other.category]} />
            ))}
          </div>
        </section>
        <CTASection title={active ? `${c.product.open} ${product.name}` : c.product.notify} body={description} links={active ? [{ label: `${c.product.open} ${product.name}`, href: product.route, primary: true }, { label: c.nav.automation, href: "/automation" }] : [{ label: c.nav.automation, href: "/automation", primary: true }]} />
      </main>
    </PublicShell>
  );
}
