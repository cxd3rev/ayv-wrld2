import { Atmosphere } from "@/components/atmosphere";
import { ProductLogo } from "@/components/product-icon";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/header";
import type { ProductConfig } from "@/config/products";
import type { Project } from "@/config/public-site";
import { getPublicCopy } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import Link from "next/link";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  return (
    <Atmosphere>
      <a href="#main-content" className="skip-link">{c.common.skip}</a>
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </Atmosphere>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? <Link href={item.href} className="transition-colors hover:text-foreground">{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="kicker">{eyebrow}</p>
      <h2 className="display mt-6 text-4xl leading-[1.02] text-balance sm:text-5xl lg:text-6xl">{title}</h2>
      {body ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{body}</p> : null}
    </div>
  );
}

export function AutomationProductCard({
  product,
  description,
  status,
  cta,
  price,
  category,
}: {
  product: ProductConfig;
  description: string;
  status: string;
  cta: string;
  price: string;
  category?: string;
}) {
  return (
    <article className="group flex min-h-[330px] flex-col justify-between border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-foreground/30 sm:p-7">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-13 w-13 items-center justify-center border border-border bg-background">
            <ProductLogo product={product} size={34} className="mark-invert h-8 w-8 object-contain" />
          </div>
          <span className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{status}</span>
        </div>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: product.accent }}>{category ?? product.category}</p>
        <h3 className="display mt-2 text-2xl">{product.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <div className="mt-7 flex items-end justify-between gap-4">
        <p className="display text-xl">{price}</p>
        <Link href={product.marketingRoute} className="inline-flex items-center gap-1.5 text-sm font-medium">
          {cta}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function ProjectCard({
  project,
  description,
  status,
  cta,
}: {
  project: Project;
  description?: string;
  status: string;
  cta: string;
}) {
  return (
    <article className="group flex min-h-[280px] flex-col justify-between border border-border bg-card p-7 transition duration-300 hover:-translate-y-1 hover:border-foreground/30">
      <div className="flex items-start justify-between gap-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">AYV WRLD / Project</span>
        <span className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{status}</span>
      </div>
      <div className="mt-14">
        <h3 className="display text-3xl">{project.name}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{description ?? project.description}</p>
        <Link href={project.route} className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium">
          {cta}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function CTASection({
  title,
  body,
  links,
}: {
  title: string;
  body: string;
  links: { label: string; href: string; primary?: boolean }[];
}) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
        <div className="border border-border bg-card p-8 sm:p-12 lg:p-16">
          <h2 className="display max-w-4xl text-4xl leading-[1.02] text-balance sm:text-5xl lg:text-7xl">{title}</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{body}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={link.primary ? "button-primary" : "button-secondary"}>
                {link.label}<ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="technical-grid" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
        <p className="kicker">{eyebrow}</p>
        <h1 className="display mt-7 max-w-5xl text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] text-balance">{title}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl">{body}</p>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
