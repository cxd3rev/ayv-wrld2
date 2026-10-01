import { Check, type LucideIcon } from "lucide-react";
import Link from "next/link";

export function ModuleCard({
  name,
  line,
  features,
  href,
  learn,
  icon: Icon,
}: {
  name: string;
  line: string;
  features: string[];
  href: string;
  learn: string;
  icon: LucideIcon;
}) {
  return (
    <article className="glass-card flex h-full flex-col rounded-3xl p-8 transition duration-300 hover:-translate-y-1">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold leading-none">{name}</h3>
      <p className="mt-4 min-h-16 text-sm leading-relaxed text-white/65">{line}</p>
      <ul className="mt-6 flex-1 space-y-3 text-sm leading-6 text-white/75">
        {features.slice(0, 3).map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-1 h-4 w-4 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href={href} className="button-secondary mt-8 w-full">
        {learn}
      </Link>
    </article>
  );
}
