import { getHomeCopy } from "@/components/home/home-copy";
import type { AppLocale } from "@/i18n/config";
import { ArrowUpRight } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export function Hero({ locale }: { locale: AppLocale }) {
  const c = getHomeCopy(locale);

  return (
    <section className="overflow-hidden px-5 pt-14 text-center sm:px-8 sm:pt-20">
      <h1 className="mx-auto max-w-[1080px] font-[family-name:var(--font-home-display)] text-[clamp(2.15rem,4.5vw,4.35rem)] leading-[0.94] tracking-[-0.04em] text-[#0A0A0A]">
        <span className="block">{c.headline[0]}</span>
        <span className="block">{c.headline[1]}</span>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#3A3A3A] sm:text-base">{c.subtext}</p>
      <a
        href={`mailto:${BUSINESS.email}?subject=Demo`}
        className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[#0A0A0A] px-5 text-sm font-medium text-white"
      >
        {c.demo}
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </a>
      <div className="mx-auto mt-8 aspect-[16/8] w-full max-w-[1180px] overflow-hidden sm:aspect-[16/7]">
        <img
          src="/images/hero-hands.png"
          alt=""
          width={1024}
          height={640}
          className="h-full w-full object-cover object-[center_82%]"
        />
      </div>
    </section>
  );
}
