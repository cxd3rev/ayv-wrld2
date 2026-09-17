import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { ProductCard } from "@/components/marketing/product-card";
import { BundleOffer, Features, FinalCta, HowItWorks } from "@/components/marketing/sections";
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

      <section className="relative overflow-hidden border-b border-border">
        <div className="dot-field" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1080px] flex-col items-center px-6 pt-20 pb-16 text-center lg:pt-28">
          <div className="flex flex-wrap items-center justify-center gap-2 rise-in">
            {["One login for everything", "Live in minutes", "Cancel anytime"].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {chip}
              </span>
            ))}
          </div>
          <h1 className="display mt-9 max-w-[15ch] text-[clamp(2.75rem,9vw,7rem)] leading-[0.9] rise-in-2 text-balance">
            Turn everyday work into <span className="text-accent">revenue.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted lg:text-xl text-pretty rise-in-3">
            {siteConfig.description}
          </p>
          <div className="mt-10 flex flex-col gap-3 rise-in-3 sm:flex-row">
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

        <div className="relative z-10 border-t border-border">
          <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-center gap-x-9 gap-y-3 px-6 py-6">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted">The suite</span>
            {products.map((product) => (
              <span
                key={product.id}
                className="font-mono text-xs uppercase tracking-[0.18em] text-foreground/70"
              >
                {product.name}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-border">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`px-6 py-8 text-center lg:px-12 ${index % 2 === 1 ? "border-l border-border" : ""} ${
                  index > 0 ? "md:border-l md:border-border" : ""
                } ${index >= 2 ? "border-t border-border md:border-t-0" : ""}`}
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
        <BundleOffer />
      </section>

      <FinalCta />

      <MarketingFooter />
    </Atmosphere>
  );
}
