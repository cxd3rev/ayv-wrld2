import { Hero } from "@/components/home/hero";
import { Navbar } from "@/components/home/navbar";
import { ProductGrid } from "@/components/home/product-grid";
import { TrustLogos } from "@/components/home/trust-logos";
import { ayvBrand } from "@/config/brands";
import { formatPrice } from "@/config/products";
import { getStackCopy } from "@/config/stack-marketing";
import type { AppLocale } from "@/i18n/config";
import { BUSINESS } from "@/lib/business";
import { Archivo, Archivo_Black } from "next/font/google";
import Link from "next/link";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-home",
});

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-home-display",
});

function Halftone() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(circle, #0A0A0A 0.65px, transparent 0.8px)",
        backgroundSize: "4px 4px",
        maskImage: "radial-gradient(ellipse at center, transparent 18%, #000 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, transparent 18%, #000 80%)",
        opacity: 0.45,
      }}
    />
  );
}

export function HomePage({ locale }: { locale: AppLocale }) {
  const c = getStackCopy(locale);
  const tiers = [
    { name: c.pricing.starter, body: c.pricing.starterBody, price: formatPrice(39, locale), features: c.pricing.starterFeatures, href: "/dashboard/billing", cta: c.pricing.starterCta },
    { name: c.pricing.growth, body: c.pricing.growthBody, price: formatPrice(79, locale), features: c.pricing.growthFeatures, href: "/dashboard/billing#growth", cta: c.pricing.growthCta },
    { name: c.pricing.stack, body: c.pricing.stackBody, price: formatPrice(149, locale), features: c.pricing.stackFeatures, href: "/dashboard/billing#full-stack", cta: c.pricing.stackCta },
  ];

  return (
    <div className={`${archivo.variable} ${display.variable} relative min-h-screen bg-[#F3F2EF] text-[#0A0A0A] [font-family:var(--font-home),sans-serif]`}>
      <Halftone />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="relative z-10">
        <Navbar />
        <main id="main-content">
          <Hero locale={locale} />
          <TrustLogos locale={locale} />
          <ProductGrid locale={locale} />
          <section id="how" className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8">
            <h2 className="font-[family-name:var(--font-home-display)] text-4xl leading-none tracking-[-0.03em] sm:text-5xl">{c.how.title}</h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {c.how.steps.map((step, index) => (
                <li key={step.title} className="rounded-3xl border border-black/10 bg-white/55 p-6">
                  <p className="text-xs tracking-[0.16em] text-[#6A6A6A]">0{index + 1}</p>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5E5E5E]">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>
          <section id="pricing" className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8">
            <h2 className="font-[family-name:var(--font-home-display)] text-4xl leading-none tracking-[-0.03em] sm:text-5xl">{c.pricing.title}</h2>
            <p className="mt-4 max-w-xl text-sm text-[#5E5E5E]">{c.pricing.body}</p>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {tiers.map((tier) => (
                <article key={tier.name} className="flex flex-col rounded-3xl border border-black/10 bg-white/55 p-6">
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="mt-2 text-sm text-[#5E5E5E]">{tier.body}</p>
                  <p className="mt-6 font-[family-name:var(--font-home-display)] text-4xl tracking-[-0.03em]">
                    {tier.price}
                    <span className="font-[family-name:var(--font-home)] text-sm font-normal text-[#5E5E5E]"> {c.pricing.month}</span>
                  </p>
                  <p className="mt-1 text-xs text-[#6A6A6A]">{c.pricing.excludingTax}</p>
                  <ul className="mt-6 flex-1 space-y-2 text-sm text-[#3A3A3A]">
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link href={tier.href} className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#0A0A0A] text-sm font-medium text-white">
                    {tier.cta}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </main>
        <footer className="border-t border-black/10 px-5 py-10">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-[#3A3A3A]">
            <p>© {new Date().getFullYear()} {BUSINESS.name}. {c.footer.rights}</p>
            <a href={`mailto:${BUSINESS.email}`} className="hover:text-black">{BUSINESS.email}</a>
            <a href="https://www.ayvwrld.com" className="inline-flex items-center gap-2 hover:text-black">
              <img src={ayvBrand.logo} alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain grayscale" />
              made by ayvwrld
            </a>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-black">{c.footer.terms}</Link>
              <Link href="/privacy" className="hover:text-black">{c.footer.privacy}</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
