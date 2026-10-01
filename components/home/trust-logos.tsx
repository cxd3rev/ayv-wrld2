import { getHomeCopy } from "@/components/home/home-copy";
import type { AppLocale } from "@/i18n/config";

const marks = ["North", "Linen", "Field", "Halo", "Arc", "Studio", "Keen", "Bolt"];

export function TrustLogos({ locale }: { locale: AppLocale }) {
  const c = getHomeCopy(locale);

  return (
    <section className="px-6 pb-20 pt-4 text-center">
      <p className="text-sm text-[#6A6A6A]">{c.trust}</p>
      <ul className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-5">
        {marks.map((mark) => (
          <li key={mark} className="text-[13px] font-semibold tracking-[0.18em] text-[#1A1A1A] uppercase">
            {mark}
          </li>
        ))}
      </ul>
    </section>
  );
}
