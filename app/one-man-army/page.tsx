import { CTASection, PageHero, PublicShell, SectionHeading } from "@/components/marketing/public-site";
import { ecosystems, getPublicCopy } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import Image from "next/image";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  return {
    title: c.metadata.army[0],
    description: c.metadata.army[1],
    alternates: { canonical: "/one-man-army" },
    openGraph: { title: c.metadata.army[0], description: c.metadata.army[1], url: "/one-man-army" },
    icons: { icon: "/brands/one-man-army/icon.png" },
  };
}

export default async function OneManArmyPage() {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  const lifecycle = [
    [c.army.research, c.army.researchBody],
    [c.army.build, c.army.buildBody],
    [c.army.deploy, c.army.deployBody],
    [c.army.monetize, c.army.monetizeBody],
    [c.army.improve, c.army.improveBody],
  ];
  return (
    <PublicShell>
      <main id="main-content">
        <PageHero eyebrow={c.army.eyebrow} title={c.army.title} body={c.army.body}>
          <div className="flex flex-wrap items-center gap-6">
            <Image src={ecosystems.oneManArmy.nameMark} alt="One Man Army" width={829} height={228} sizes="(max-width: 640px) 80vw, 420px" priority className="h-auto w-full max-w-md object-contain" />
            <span className="inline-flex border border-border bg-card px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] text-muted">{c.army.status}</span>
          </div>
        </PageHero>
        <section className="mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <SectionHeading eyebrow="ONE MAN ARMY STACK / LIFECYCLE" title={c.army.lifecycle} />
          <ol className="mt-12 border-l border-t border-border lg:grid lg:grid-cols-5">
            {lifecycle.map(([title, body], index) => (
              <li key={title} className="border-b border-r border-border p-7">
                <span className="font-mono text-xs text-muted">0{index + 1}</span>
                <h2 className="display mt-12 text-2xl">{title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 border border-border bg-card p-7">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Separate audience / separate product</p>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed">{c.home.pathsBody}</p>
          </div>
        </section>
        <CTASection title={c.army.lifecycle} body={c.army.body} links={[
          { label: c.army.cta, href: "/projects", primary: true },
          { label: c.nav.automation, href: "/automation" },
        ]} />
      </main>
    </PublicShell>
  );
}
