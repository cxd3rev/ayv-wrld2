import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { ProductCard } from "@/components/marketing/product-card";
import { BetterTogether, BundleOffer, Features, FinalCta, HowItWorks } from "@/components/marketing/sections";
import { products } from "@/config/products";
import { ayvBrand } from "@/config/brands";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const t = await getTranslations("home");
  const stats = [
    { value: "6", label: t("statTools") },
    { value: "1", label: t("statLogin") },
    { value: "0", label: t("statStitch") },
    { value: "∞", label: t("statAutomations") },
  ];

  return (
    <Atmosphere>
      <MarketingHeader />

      <section className="relative overflow-hidden">
        <div className="dot-field" />
        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-12 px-6 pt-16 pb-16 lg:grid-cols-[1fr_0.95fr] lg:gap-8 lg:px-12 lg:pt-24">
          <div>
            <p className="kicker rise-in">{t("kicker")}</p>
            <h1 className="display mt-8 max-w-[12ch] text-[clamp(3rem,9vw,7rem)] leading-[0.95] rise-in-2 text-balance">
              {t.rich("headline", {
                muted: (chunks) => <span className="text-muted">{chunks}</span>,
              })}
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted lg:text-xl text-pretty rise-in-3">
              {(await getTranslations("meta"))("description")}
            </p>
            <div className="mt-10 flex flex-col items-start gap-3 rise-in-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="group inline-flex h-14 items-center justify-center rounded-full bg-card px-7 text-base font-medium text-foreground ring-1 ring-border transition-colors hover:bg-card-hover"
              >
                {t("startFree")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#products"
                className="inline-flex h-14 items-center justify-center rounded-full px-5 text-base font-medium text-muted transition-colors hover:text-foreground"
              >
                {t("seeProducts")}
              </Link>
            </div>
          </div>

          <div className="relative rise-in-3">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
            <Image
              src={ayvBrand.icon}
              alt=""
              width={900}
              height={900}
              priority
              className="mark-invert mx-auto h-auto w-full max-w-[420px] select-none object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 border-t border-border">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`px-6 py-8 lg:px-12 ${index > 0 ? "border-l border-border" : ""} ${
                  index === 2 ? "border-t border-border md:border-t-0" : ""
                } ${index === 3 ? "border-t border-border md:border-t-0" : ""}`}
              >
                <p className="display text-5xl leading-none tracking-tight lg:text-6xl">{stat.value}</p>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Features />

      <BetterTogether />

      <HowItWorks />

      <section id="products" className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <p className="kicker">{t("productsKicker")}</p>
        <h2 className="display mt-7 max-w-3xl text-4xl leading-[1.02] lg:text-6xl text-balance">
          {t.rich("productsTitle", {
            muted: (chunks) => <span className="text-muted">{chunks}</span>,
          })}
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">{t("productsBody")}</p>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        <BundleOffer />
      </section>

      <FinalCta />

      <MarketingFooter />
    </Atmosphere>
  );
}
