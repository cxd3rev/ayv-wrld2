import { AutomationProductCard, CTASection, PageHero, PublicShell, SectionHeading } from "@/components/marketing/public-site";
import { formatPrice, products } from "@/config/products";
import { getPublicCopy } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";

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
        <PageHero eyebrow={c.automation.eyebrow} title={c.automation.title} body={c.automation.body} />
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
          <div className="grid gap-8 border border-border bg-card p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
            <div>
              <p className="kicker">{c.common.bundle}</p>
              <h2 className="display mt-6 text-4xl lg:text-6xl">{c.automation.stackTitle}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{c.automation.stackBody}</p>
              <p className="mt-5 font-mono text-sm">€534 → €267</p>
            </div>
            <Link href="/automation/stack" className="button-primary">{c.automation.stackCta}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
        <CTASection title={c.home.finalTitle} body={c.home.finalBody} links={[{ label: "One Man Army Stack", href: "/one-man-army" }, { label: c.nav.projects, href: "/projects" }]} />
      </main>
    </PublicShell>
  );
}
