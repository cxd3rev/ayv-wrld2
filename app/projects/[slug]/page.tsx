import { Breadcrumbs, CTASection, PublicShell } from "@/components/marketing/public-site";
import { getProject, getProjectDescription, getPublicCopy, projects } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const locale = resolveLocale(await getLocale());
  const description = getProjectDescription(locale, project.slug);
  return {
    title: project.name,
    description,
    alternates: { canonical: project.route },
    openGraph: { title: `${project.name} · AYV WRLD Projects`, description, url: project.route },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const locale = resolveLocale(await getLocale());
  const c = getPublicCopy(locale);
  const description = getProjectDescription(locale, project.slug);
  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description,
    creator: { "@type": "Organization", name: "AYV WRLD" },
    url: `https://ayv-wrld2.vercel.app${project.route}`,
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
      <main id="main-content">
        <section className="relative border-b border-border">
          <div className="technical-grid" aria-hidden />
          <div className="relative mx-auto w-full max-w-[1400px] px-6 py-16 lg:px-12 lg:py-24">
            <Breadcrumbs items={[{ label: "AYV WRLD", href: "/" }, { label: c.nav.projects, href: "/projects" }, { label: project.name }]} />
            <div className="mt-16 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div>
                <p className="kicker">{c.common.project}</p>
                <h1 className="display mt-7 text-[clamp(4rem,12vw,9rem)] leading-none">{project.name}</h1>
              </div>
              <span className="w-fit border border-border bg-card px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">{c.common.development}</span>
            </div>
          </div>
        </section>
        <section className="mx-auto grid w-full max-w-[1400px] gap-12 px-6 py-20 lg:grid-cols-2 lg:px-12 lg:py-28">
          <h2 className="display max-w-xl text-4xl leading-tight sm:text-5xl">{description}</h2>
          <div className="border-l border-border pl-7">
            <p className="text-lg leading-relaxed text-muted">{c.projects.detailBody}</p>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-muted">{c.common.development}</p>
          </div>
        </section>
        <CTASection title={c.projects.title} body={c.projects.body} links={[{ label: c.projects.all, href: "/projects", primary: true }]} />
      </main>
    </PublicShell>
  );
}
