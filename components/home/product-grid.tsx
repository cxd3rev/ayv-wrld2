import { ProductCard } from "@/components/home/product-card";
import { getHomeCopy } from "@/components/home/home-copy";
import { products } from "@/config/products";
import type { AppLocale } from "@/i18n/config";

export function ProductGrid({ locale }: { locale: AppLocale }) {
  const c = getHomeCopy(locale);

  return (
    <section id="products" className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            line={c.lines[product.id]}
            href={product.marketingRoute}
            icon={product.assets.icon}
            learn={c.learn}
          />
        ))}
      </div>
    </section>
  );
}
