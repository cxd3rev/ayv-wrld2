import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function ProductCard({
  name,
  line,
  href,
  icon,
  learn,
}: {
  name: string;
  line: string;
  href: string;
  icon: string;
  learn: string;
}) {
  return (
    <article className="flex flex-col rounded-3xl border border-black/10 bg-white/55 p-6">
      <img src={icon} alt="" width={36} height={36} className="h-9 w-9 object-contain brightness-0" />
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5E5E5E]">{line}</p>
      <Link href={href} className="mt-6 inline-flex h-10 w-fit items-center gap-1.5 rounded-full bg-[#0A0A0A] px-4 text-sm font-medium text-white">
        {learn}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </article>
  );
}
