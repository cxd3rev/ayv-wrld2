import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { HeroSculpture } from "@/components/marketing/hero-sculpture";
import { ProductCard } from "@/components/marketing/product-card";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <Atmosphere>
      <MarketingHeader />
      <section className="relative flex min-h-[calc(100vh-5rem)] flex-col justify-center overflow-hidden">
        <div className="arch-grid" />
        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-12 px-6 pt-16 pb-32 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:pt-20">
          <div>
            <p className="kicker rise-in">The platform for modern teams</p>
            <h1 className="display mt-8 text-[clamp(2.75rem,8vw,7.5rem)] leading-[0.9] tracking-tight">
              <span className="block">Software that</span>
              <span className="block">turns work into</span>
              <span className="headline-mark">revenue.</span>
            </h1>
            <div className="mt-12 max-w-xl">
              <p className="text-xl leading-relaxed text-muted lg:text-2xl">
                {siteConfig.description} Each product does one job well. The foundation they share lives here.
              </p>
              <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex h-14 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#products"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-foreground/20 px-8 text-base font-medium hover:bg-foreground/5"
                >
                  See products
                </Link>
              </div>
            </div>
          </div>
          <HeroSculpture />
        </div>
        <div className="relative z-10 pb-10">
          <div className="marquee-wrap">
            <div className="marquee-track px-6">
              {[0, 1].map((copy) => (
                <div key={copy}>
                  {products.map((product) => (
                    <div key={`${copy}-${product.id}`} className="flex items-baseline gap-4 whitespace-nowrap">
                      <span className="display text-4xl lg:text-5xl">{product.name}</span>
                      <span className="text-sm text-muted">
                        {product.tagline}
                        <span className="mt-1 block font-mono text-xs uppercase">{product.marketingStatus}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <p className="kicker">Capabilities</p>
        <h2 className="display mt-6 max-w-3xl text-4xl leading-[1.05] tracking-tight lg:text-6xl">
          Six focused tools.
          <span className="mt-1 block text-muted">Nothing you don&apos;t need.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          None of these products are fully built yet. Avyro is first. The rest will connect
          to this same workspace when they are ready.
        </p>
        <div className="mt-16">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>
      <MarketingFooter />
    </Atmosphere>
  );
}
