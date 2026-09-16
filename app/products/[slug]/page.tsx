import { Atmosphere } from "@/components/atmosphere";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import { Badge } from "@/components/ui/badge";
import { ProductIcon } from "@/components/product-icon";
import { getProduct, products } from "@/config/products";
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
      <main className="mx-auto max-w-2xl px-4 py-20">
        <Link href="/#products" className="text-sm text-white/50 hover:text-foreground">
          ← All products
        </Link>
        <div className="mt-10 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <ProductIcon product={product} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="display text-5xl">{product.name}</h1>
            <p className="text-muted">{product.tagline}</p>
          </div>
        </div>
        <div className="mt-6">
          <Badge tone={product.status === "active" ? "accent" : "neutral"}>
            {product.marketingStatus}
          </Badge>
        </div>
        <p className="mt-8 text-lg leading-8 text-muted">{product.longDescription}</p>
        <p className="mt-4 text-sm text-muted">{product.pricing.label}</p>
        {product.status === "active" ? (
          <Link
            href="/signup"
            className="mt-10 inline-flex h-12 items-center rounded-full bg-accent px-6 font-medium text-accent-foreground"
          >
            Join the foundation
          </Link>
        ) : (
          <p className="mt-10 text-sm text-muted">
            This product is not available yet. Create an AYV WRLD account to be ready when it launches.
          </p>
        )}
      </main>
      <MarketingFooter />
    </Atmosphere>
  );
}
