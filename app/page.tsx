import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { ProductCard } from "@/components/marketing/product-card";
import { Features, FinalCta, HowItWorks } from "@/components/marketing/sections";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "6", label: "Focused tools" },
  { value: "1", label: "Unified login" },
  { value: "0", label: "Tools to stitch together" },
  { value: "∞", label: "Automations once set" },
];

export default function HomePage() {
  return (
    <Atmosphere>
      <MarketingHeader />

      <section className="relative overflow-hidden">
        <div className="dot-field" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pt-20 pb-16 lg:px-12 lg:pt-28">
          <p className="kicker rise-in">The platform for modern business</p>
          <h1 className="display mt-8 max-w-[13ch] text-[clamp(3rem,11vw,9rem)] leading-[0.9] rise-in-2 text-balance">
            Turn everyday work into <span className="text-muted">revenue.</span>
          </h1>
          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-xl text-lg leading-relaxed text-muted lg:text-xl text-pretty rise-in-3">
              {siteConfig.description}
            </p>
            <div className="flex flex-col gap-3 rise-in-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex h-14 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#products"
                className="inline-flex h-14 items-center justify-center rounded-full border border-border bg-card px-8 text-base font-medium transition-colors hover:bg-card-hover"
              >
                See products
              </Link>
            </div>
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

      <HowItWorks />

      <section id="products" className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <p className="kicker">The products</p>
        <h2 className="display mt-7 max-w-3xl text-4xl leading-[1.02] lg:text-6xl text-balance">
          Six focused tools. <span className="text-muted">One for every job.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">
          Each product does one thing well. Avyro is first — the rest connect to this same
          workspace as they launch.
        </p>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <FinalCta />

      <MarketingFooter />
    </Atmosphere>
  );
}
