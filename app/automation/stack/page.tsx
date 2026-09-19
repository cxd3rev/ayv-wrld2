import { AutomationProductCard, Breadcrumbs, CTASection, PublicShell, SectionHeading } from "@/components/marketing/public-site";
import { BundlePricingCard } from "@/components/marketing/bundle-pricing-card";
import { formatPrice, products } from "@/config/products";
import { getPublicCopy } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  return { title: c.metadata.stack[0], description: c.metadata.stack[1], alternates: { canonical: "/automation/stack" }, openGraph: { title: c.metadata.stack[0], description: c.metadata.stack[1], url: "/automation/stack" } };
}

export default async function AutomationStackPage() {
  const locale = resolveLocale(await getLocale());
  const c = getPublicCopy(locale);
  const t = await getTranslations();
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "AYV Automation Stack",
    description: c.metadata.stack[1],
    brand: { "@type": "Brand", name: "AYV WRLD" },
    category: "Business automation software bundle",
  };
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
      <main id="main-content">
        <section className="relative border-b border-border">
          <div className="technical-grid" aria-hidden />
          <div className="relative mx-auto w-full max-w-[1400px] px-6 py-16 lg:px-12 lg:py-24">
            <Breadcrumbs items={[{ label: "AYV WRLD", href: "/" }, { label: "AYV Automation", href: "/automation" }, { label: "AYV Automation Stack" }]} />
            <p className="kicker mt-16">{c.common.bundle}</p>
            <h1 className="display mt-7 max-w-5xl text-[clamp(3.5rem,9vw,8rem)] leading-[0.92] text-balance">{c.stack.title}</h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted sm:text-xl">{c.stack.body}</p>
          </div>
        </section>
        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <BundlePricingCard
            locale={locale}
            labels={{ bundle: c.common.bundle, purchasedSeparately: c.common.purchasedSeparately, plannedPrice: c.common.plannedPrice, save: c.common.save, perMonth: c.common.perMonth, includes: c.common.includes, individualNote: c.stack.truth }}
            cta={{ href: "/automation", label: c.stack.cta }}
          />
        </section>
        <section className="border-y border-border bg-card">
          <div id="included-products" className="mx-auto w-full max-w-[1400px] scroll-mt-24 px-6 py-20 lg:px-12 lg:py-28">
            <SectionHeading eyebrow="AYV AUTOMATION STACK" title={c.stack.connected} body={c.stack.connectedBody} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <AutomationProductCard key={product.id} product={product} description={t(`catalog.${product.id}.description`)} status={product.status === "active" ? c.common.available : c.common.soon} cta={c.common.view} price={`${formatPrice(product.pricing.monthly ?? 0, locale)} ${c.common.perMonth}`} category={c.common.categories[product.category]} />
              ))}
            </div>
          </div>
        </section>
        <CTASection title={c.stack.cta} body={c.stack.truth} links={products.filter((product) => product.status === "active").map((product, index) => ({ label: `${c.product.open} ${product.name}`, href: product.route, primary: index === 0 }))} />
      </main>
    </PublicShell>
  );
}
