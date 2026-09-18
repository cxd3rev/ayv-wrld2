import { CTASection, PageHero, PublicShell, SectionHeading } from "@/components/marketing/public-site";
import { getPublicCopy } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  return { title: c.metadata.about[0], description: c.metadata.about[1], alternates: { canonical: "/about" }, openGraph: { title: c.metadata.about[0], description: c.metadata.about[1], url: "/about" } };
}

export default async function AboutPage() {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  const paths = [
    ["01", "One Man Army Stack", c.home.armyBody],
    ["02", "AYV Automation", c.home.automationBody],
    ["03", `${c.nav.projects} / Kleuro + Rated`, c.home.projectsBody],
  ];
  return (
    <PublicShell>
      <main id="main-content">
        <PageHero eyebrow={c.about.eyebrow} title={c.about.title} body={c.about.body} />
        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow="AYV WRLD / STRUCTURE" title={c.about.hierarchy} body={c.about.hierarchyBody} />
          <div className="mt-12 border-l border-t border-border">
            {paths.map(([number, title, body]) => (
              <article key={number} className="grid gap-5 border-b border-r border-border p-7 sm:grid-cols-[4rem_1fr_1.2fr] lg:p-9">
                <span className="font-mono text-xs text-muted">{number}</span>
                <h2 className="display text-2xl">{title}</h2>
                <p className="text-sm leading-relaxed text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>
        <CTASection title={c.home.finalTitle} body={c.home.finalBody} links={[
          { label: c.nav.projects, href: "/projects" },
          { label: "One Man Army Stack", href: "/one-man-army" },
          { label: "AYV Automation", href: "/automation", primary: true },
        ]} />
      </main>
    </PublicShell>
  );
}
