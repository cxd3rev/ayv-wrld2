import { AutomationProductCard, CTASection, PageHero, PublicShell, SectionHeading } from "@/components/marketing/public-site";
import { BundlePricingCard } from "@/components/marketing/bundle-pricing-card";
import { formatPrice, products } from "@/config/products";
import { ecosystems, getPublicCopy } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  return { title: c.metadata.automation[0], description: c.metadata.automation[1], alternates: { canonical: "/automation" }, openGraph: { title: c.metadata.automation[0], description: c.metadata.automation[1], url: "/automation" } };
}

export default async function AutomationPage() {
  const locale = resolveLocale(await getLocale());
  const c = getPublicCopy(locale);
  const t = await getTranslations();
  return (
    <PublicShell>
      <main id="main-content">
        <PageHero eyebrow={c.automation.eyebrow} title={c.automation.title} body={c.automation.body}>
          <Image src={ecosystems.automation.logo} alt="AYV Automation logo" width={320} height={320} sizes="160px" priority className="h-32 w-32 object-contain sm:h-40 sm:w-40" />
        </PageHero>
        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow="AYV AUTOMATION / PRODUCTS" title={c.automation.productsTitle} body={c.automation.productsBody} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <AutomationProductCard key={product.id} product={product} description={t(`catalog.${product.id}.description`)} status={product.status === "active" ? c.common.available : c.common.soon} cta={c.common.view} price={`${formatPrice(product.pricing.monthly ?? 0, locale)} ${c.common.perMonth}`} category={c.common.categories[product.category]} />
            ))}
          </div>
        </section>
        <section className="border-y border-border bg-card">
          <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
            <SectionHeading eyebrow="CONNECTED JOURNEY" title={c.automation.journeyTitle} body={c.automation.journeyBody} />
            <ol className="mt-12 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
              {products.map((product, index) => (
                <li key={product.id} className="bg-background p-5">
                  <span className="font-mono text-[10px] text-muted">0{index + 1}</span>
                  <p className="display mt-8 text-xl">{product.name}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: product.accent }}>{c.common.categories[product.category]}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow={c.common.bundle} title={c.automation.stackTitle} body={c.automation.stackBody} />
          <BundlePricingCard
            locale={locale}
            className="mt-10"
            labels={{ bundle: c.common.bundle, purchasedSeparately: c.common.purchasedSeparately, plannedPrice: c.common.plannedPrice, save: c.common.save, perMonth: c.common.perMonth, includes: c.common.includes, individualNote: c.common.individualNote }}
            cta={{ href: "/automation/stack", label: c.automation.stackCta }}
          />
        </section>
        <CTASection title={c.home.finalTitle} body={c.home.finalBody} links={[{ label: "One Man Army Stack", href: "/one-man-army" }, { label: c.nav.projects, href: "/projects" }]} />
      </main>
    </PublicShell>
  );
}
