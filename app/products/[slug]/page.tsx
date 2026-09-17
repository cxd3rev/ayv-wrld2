import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { Badge } from "@/components/ui/badge";
import { ProductLogo } from "@/components/product-icon";
import { getProduct, products } from "@/config/products";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <Atmosphere>
      <MarketingHeader />
      <main className="relative mx-auto max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
        <div className="arch-grid opacity-30" />
        <Link href="/#products" className="relative text-sm text-foreground/50 hover:text-foreground">
          ← All products
        </Link>
        <div className="relative mt-16 max-w-2xl">
          <p className="kicker">{product.tagline}</p>
          <ProductLogo product={product} size={200} className="mt-8 h-44 w-44 sm:h-52 sm:w-52" />
          <h1 className="display mt-8 text-5xl tracking-tight lg:text-7xl">{product.name}</h1>
          <div className="mt-8">
            <Badge tone={product.status === "active" ? "accent" : "neutral"}>
              {product.marketingStatus}
            </Badge>
          </div>
          <p className="mt-10 text-xl leading-relaxed text-muted lg:text-2xl">{product.longDescription}</p>
          <p className="mt-4 font-mono text-xs tracking-[0.16em] text-muted uppercase">{product.pricing.label}</p>
          {product.status === "active" ? (
            <Link
              href="/signup"
              className="group mt-12 inline-flex h-14 items-center rounded-full bg-foreground px-8 text-base font-medium text-background hover:bg-foreground/90"
            >
              Join the foundation
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <p className="mt-12 text-sm text-muted">
              This product is not available yet. Create an AYV WRLD account to be ready when it launches.
            </p>
          )}
        </div>
      </main>
      <MarketingFooter />
    </Atmosphere>
  );
}
