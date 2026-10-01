import { getHomeCopy } from "@/components/home/home-copy";
import type { AppLocale } from "@/i18n/config";
import { ArrowUpRight } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export function Hero({ locale }: { locale: AppLocale }) {
  const c = getHomeCopy(locale);

  return (
    <section className="px-4 pt-16 text-center sm:px-6 sm:pt-20">
      <div className="relative z-10">
        <h1 className="mx-auto max-w-[1200px] font-[family-name:var(--font-home-display)] text-[clamp(1.85rem,3.15vw,3.35rem)] leading-[0.96] tracking-[-0.04em] text-[#0A0A0A]">
          <span className="block md:whitespace-nowrap">{c.headline[0]}</span>
          <span className="block md:whitespace-nowrap">{c.headline[1]}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#5E5E5E] sm:text-base">{c.subtext}</p>
        <a
          href={`mailto:${BUSINESS.email}?subject=Demo`}
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-[#0A0A0A] px-5 text-sm font-medium text-white"
        >
          {c.demo}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
      <img
        src="/images/hero-hands.png"
        alt=""
        width={1024}
        height={640}
        className="relative z-0 mx-auto -mt-28 h-auto w-full max-w-[1400px] sm:-mt-40"
      />
    </section>
  );
}
