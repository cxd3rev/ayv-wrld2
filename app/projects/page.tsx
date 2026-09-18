import { CTASection, PageHero, ProjectCard, PublicShell } from "@/components/marketing/public-site";
import { getProjectDescription, getPublicCopy, projects } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  return {
    title: c.metadata.projects[0],
    description: c.metadata.projects[1],
    alternates: { canonical: "/projects" },
    openGraph: { title: c.metadata.projects[0], description: c.metadata.projects[1], url: "/projects" },
  };
}

export default async function ProjectsPage() {
  const locale = resolveLocale(await getLocale());
  const c = getPublicCopy(locale);
  return (
    <PublicShell>
      <main id="main-content">
        <PageHero eyebrow={c.projects.eyebrow} title={c.projects.title} body={c.projects.body} />
        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <div className="grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} description={getProjectDescription(locale, project.slug)} status={c.common.development} cta={c.common.view} />
            ))}
          </div>
        </section>
        <CTASection title={c.home.pathsTitle} body={c.home.pathsBody} links={[
          { label: "One Man Army Stack", href: "/one-man-army" },
          { label: "AYV Automation", href: "/automation", primary: true },
        ]} />
      </main>
    </PublicShell>
  );
}
