import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { ProductCard } from "@/components/marketing/product-card";
import { Features, FinalCta, HowItWorks } from "@/components/marketing/sections";
import { ayvBrand } from "@/config/brands";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <Atmosphere>
      <MarketingHeader />

      <section className="relative flex min-h-[calc(100vh-5rem)] flex-col justify-center overflow-hidden">
        <div className="hero-burst" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-6 pt-16 pb-24 text-center lg:pt-20">
          <div className="mark-glow rise-in mb-10 flex items-center justify-center">
            <Image
              src={ayvBrand.logo}
              alt={ayvBrand.name}
              width={200}
              height={200}
              className="mark-invert relative z-10 h-20 w-20 object-contain sm:h-24 sm:w-24"
              priority
            />
          </div>
          <p className="kicker rise-in">Software for modern businesses</p>
          <h1 className="display mt-7 text-[clamp(2.75rem,8vw,7rem)] leading-[0.95] tracking-tight rise-in-2 text-balance">
            Turn everyday work into revenue.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted lg:text-2xl text-pretty rise-in-3">
            {siteConfig.description}
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 rise-in-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex h-14 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Get started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#products"
              className="inline-flex h-14 items-center justify-center rounded-full border border-border px-8 text-base font-medium hover:bg-card-hover"
            >
              See products
            </Link>
          </div>
        </div>

        <div className="relative z-10 pb-10">
          <div className="marquee-wrap">
            <div className="marquee-track px-6">
              {[0, 1].map((copy) => (
                <div key={copy}>
                  {products.map((product) => (
                    <div key={`${copy}-${product.id}`} className="flex items-baseline gap-4 whitespace-nowrap">
                      <span className="display text-4xl text-foreground/40 lg:text-5xl">{product.name}</span>
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

      <Features />

      <HowItWorks />

      <section id="products" className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <p className="kicker">The products</p>
        <h2 className="display mt-6 max-w-3xl text-4xl leading-[1.05] tracking-tight lg:text-6xl text-balance">
          Six focused tools.
          <span className="mt-1 block text-muted">One for every job.</span>
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
