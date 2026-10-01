import { getHomeCopy } from "@/components/home/home-copy";
import { products } from "@/config/products";
import type { AppLocale } from "@/i18n/config";

export function TrustLogos({ locale }: { locale: AppLocale }) {
  const c = getHomeCopy(locale);

  return (
    <section className="px-6 pb-16 pt-2 text-center">
      <p className="text-sm text-[#6A6A6A]">{c.trust}</p>
      <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {products.map((product) => (
          <li key={product.id} className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[#1A1A1A]">
            <img src={product.assets.icon} alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain brightness-0" />
            {product.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
