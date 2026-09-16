import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { HeroSculpture } from "@/components/marketing/hero-sculpture";
import { ProductCard } from "@/components/marketing/product-card";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function HomePage() {
  return (
    <Atmosphere>
      <MarketingHeader />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
        <div>
          <p className="text-xs tracking-[0.32em] text-accent uppercase">AYV WRLD</p>
          <h1 className="display mt-6 max-w-2xl text-5xl leading-[1.08] sm:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted sm:text-lg">
            {siteConfig.description} Each product does one job well. The foundation they share lives here.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full bg-accent px-6 font-medium text-accent-foreground"
            >
              Get started
            </Link>
            <Link
              href="#products"
              className="inline-flex h-12 items-center rounded-full border border-white/15 px-6 font-medium hover:bg-white/5"
            >
              See products
            </Link>
          </div>
        </div>
        <HeroSculpture />
      </section>

      <section id="products" className="mx-auto max-w-6xl px-4 pt-8 pb-24">
        <p className="text-xs tracking-[0.28em] text-accent uppercase">Products</p>
        <h2 className="display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
          Six focused tools. One ecosystem.
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          None of these products are fully built yet. Avyro is first. The rest will connect
          to this same workspace when they are ready.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <MarketingFooter />
    </Atmosphere>
  );
}
