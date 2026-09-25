import { ayvBrand } from "@/config/brands";
import { products, formatPrice } from "@/config/products";
import { getPublicCopy, projects } from "@/config/public-site";
import { ecosystems } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import {
  AutomationProductCard,
  CTASection,
  ProjectCard,
  PublicShell,
  SectionHeading,
} from "@/components/marketing/public-site";
import { BundlePricingCard } from "@/components/marketing/bundle-pricing-card";
import { ArrowRight, Boxes, FlaskConical, Workflow } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  return {
    title: c.metadata.home[0],
    description: c.metadata.home[1],
    alternates: { canonical: "/" },
    openGraph: { title: c.metadata.home[0], description: c.metadata.home[1], url: "/", type: "website" },
  };
}

export default async function HomePage() {
  const locale = resolveLocale(await getLocale());
  const c = getPublicCopy(locale);
  const t = await getTranslations();
  const disciplines = [
    { title: c.home.build, body: c.home.buildBody, icon: Boxes },
    { title: c.home.automate, body: c.home.automateBody, icon: Workflow },
    { title: c.home.experiment, body: c.home.experimentBody, icon: FlaskConical },
  ];
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AYV WRLD",
    url: "https://ayv-wrld2.vercel.app",
    description: c.metadata.home[1],
    logo: `https://ayv-wrld2.vercel.app${ayvBrand.logo}`,
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
      <main id="main-content">
        <section className="relative overflow-hidden border-b border-border">
          <div className="technical-grid" aria-hidden />
          <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_0.72fr] lg:px-12 lg:py-28">
          <div>
              <p className="kicker rise-in">{c.home.eyebrow}</p>
              <h1 className="display mt-8 max-w-[12ch] text-[clamp(3.5rem,8vw,7.6rem)] leading-[0.9] rise-in-2 text-balance">{c.home.title}</h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl rise-in-3">{c.home.body}</p>
              <div className="mt-10 flex flex-wrap gap-3 rise-in-3">
                <Link href="/projects" className="button-primary">{c.home.projectsCta}<ArrowRight className="h-4 w-4" /></Link>
                <Link href="#paths" className="button-secondary">{c.home.stacksCta}</Link>
              </div>
            </div>
            <div className="hero-frame relative mx-auto flex aspect-square w-full max-w-[430px] items-center justify-center p-12 rise-in-3">
              <div className="absolute inset-[12%] border border-border" />
              <div className="absolute inset-[27%] rotate-45 border border-border" />
              <Image src={ayvBrand.icon} alt="AYV WRLD" width={512} height={512} priority sizes="(max-width: 1024px) 70vw, 360px" className="relative h-auto w-3/5 object-contain" />
              <span className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Build / Automate / Experiment</span>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow="01 / BUILD · AUTOMATE · EXPERIMENT" title={c.home.whatTitle} />
          <div className="mt-12 grid border-l border-t border-border md:grid-cols-3">
            {disciplines.map(({ title, body, icon: Icon }, index) => (
              <article key={title} className="border-b border-r border-border p-7 lg:p-9">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-muted">0{index + 1}</span>
                </div>
                <h3 className="display mt-16 text-2xl">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="paths" className="border-y border-border bg-card">
          <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
            <SectionHeading eyebrow="02 / PRODUCT PATHS" title={c.home.pathsTitle} body={c.home.pathsBody} />
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="flex min-h-[390px] flex-col justify-between border border-border bg-background p-8 lg:p-10">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">AYV WRLD → {c.common.individual}</p>
                <div>
                  <Image src={ecosystems.oneManArmy.logo} alt="One Man Army Stack logo" width={240} height={240} sizes="160px" className="mb-8 h-24 w-24 object-contain" />
                  <h3 className="display text-4xl lg:text-5xl">{c.home.armyTitle}</h3>
                  <p className="mt-5 max-w-lg leading-relaxed text-muted">{c.home.armyBody}</p>
                  <Link href="/one-man-army" className="button-secondary mt-8">{c.home.armyCta}<ArrowRight className="h-4 w-4" /></Link>
                </div>
              </article>
              <article className="flex min-h-[390px] flex-col justify-between border border-border bg-background p-8 lg:p-10">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">AYV WRLD → {c.nav.automation}</p>
                <div>
                  <h3 className="display text-4xl lg:text-5xl">{c.home.automationTitle}</h3>
                  <p className="mt-5 max-w-lg leading-relaxed text-muted">{c.home.automationBody}</p>
                  <Link href="/automation" className="button-primary mt-8">{c.home.automationCta}<ArrowRight className="h-4 w-4" /></Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="automation-products" className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow="03 / AYV AUTOMATION / PRODUCTS" title={c.home.productsTitle} body={c.home.productsBody} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <AutomationProductCard key={product.id} product={product} description={t(`catalog.${product.id}.description`)} status={product.status === "active" ? c.common.available : c.common.soon} cta={c.common.view} price={`${formatPrice(product.pricing.monthly ?? 0, locale)} ${c.common.perMonth}`} category={c.common.categories[product.category]} />
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid w-full max-w-[1400px] gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-28">
            <SectionHeading eyebrow="04 / AYV AUTOMATION STACK / BUNDLE" title={c.home.stackTitle} body={c.home.stackBody} />
            <BundlePricingCard
              locale={locale}
              labels={{ bundle: c.common.bundle, purchasedSeparately: c.common.purchasedSeparately, plannedPrice: c.common.plannedPrice, save: c.common.save, perMonth: c.common.perMonth, includes: c.common.includes, individualNote: c.common.individualNote }}
              cta={{ href: "/automation/stack", label: c.home.stackCta }}
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow="05 / AYV WRLD / PROJECTS" title={c.home.projectsTitle} body={c.home.projectsBody} />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {projects.map((project) => <ProjectCard key={project.slug} project={project} status={c.common.development} cta={c.common.view} />)}
          </div>
        </section>

        <section className="border-y border-border">
          <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-20 lg:grid-cols-2 lg:px-12 lg:py-28">
            <SectionHeading eyebrow="06 / ONE MAN ARMY STACK" title={c.home.armyTitle} body={c.home.armyBody} />
            <div className="grid gap-px border border-border bg-border sm:grid-cols-[0.65fr_1fr]">
              <div className="flex min-h-64 items-center justify-center bg-background p-8">
                <Image src={ecosystems.oneManArmy.logo} alt="One Man Army Stack logo" width={320} height={320} sizes="(max-width: 640px) 180px, 240px" className="h-44 w-44 object-contain sm:h-52 sm:w-52" />
              </div>
              <div className="grid grid-cols-2 gap-px bg-border">
                {["Research", "Build", "Deploy", "Monetize", "Improve"].map((step, index) => <div key={step} className="bg-background p-5 font-mono text-xs uppercase tracking-[0.14em]"><span className="text-muted">0{index + 1} / </span>{step}</div>)}
                <Link href="/one-man-army" className="flex items-center justify-between bg-foreground p-5 text-sm font-medium text-background">{c.home.armyCta}<ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow="07 / ABOUT AYV WRLD" title={c.home.aboutTitle} body={c.home.aboutBody} />
          <Link href="/about" className="button-secondary mt-9">{c.home.aboutCta}<ArrowRight className="h-4 w-4" /></Link>
        </section>

        <CTASection title={c.home.finalTitle} body={c.home.finalBody} links={[
          { label: c.nav.projects, href: "/projects" },
          { label: "One Man Army Stack", href: "/one-man-army" },
          { label: "AYV Automation", href: "/automation", primary: true },
        ]} />
      </main>
    </PublicShell>
  );
}
