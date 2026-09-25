import { EcosystemExplorer, type EcosystemItem, type StackProduct } from "@/components/marketing/ecosystem-explorer";
import { PageHero, PublicShell } from "@/components/marketing/public-site";
import { ayvBrand, oneManArmyBrand } from "@/config/brands";
import { products } from "@/config/products";
import { ecosystems, getProjectDescription, getPublicCopy, projects } from "@/config/public-site";
import { resolveLocale } from "@/i18n/config";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

const stackAngles = [-90, -30, 30, 90, 150, 210];

export async function generateMetadata(): Promise<Metadata> {
  const c = getPublicCopy(resolveLocale(await getLocale()));
  return {
    title: c.metadata.projects[0],
    description: c.ecosystem.body,
    alternates: { canonical: "/projects" },
    openGraph: { title: c.metadata.projects[0], description: c.ecosystem.body, url: "/projects" },
  };
}

export default async function ProjectsPage() {
  const locale = resolveLocale(await getLocale());
  const c = getPublicCopy(locale);
  const catalog = await getTranslations({ locale, namespace: "catalog" });
  const kleuro = projects[0];
  const rated = projects[1];

  const center: EcosystemItem = {
    id: "ayv",
    name: "AYV WRLD",
    typeLabel: c.ecosystem.parent,
    logo: ayvBrand.logo,
    description: c.home.body,
    does: c.home.whatTitle,
    problem: c.about.body,
    route: "/",
  };

  const nodes: EcosystemItem[] = [
    {
      id: "kleuro",
      name: kleuro.name,
      typeLabel: c.common.project,
      logo: kleuro.logo,
      description: getProjectDescription(locale, "kleuro"),
      does: getProjectDescription(locale, "kleuro"),
      problem: c.projects.detailBody,
      route: kleuro.route,
    },
    {
      id: "rated",
      name: rated.name,
      typeLabel: c.common.project,
      logo: rated.logo,
      description: getProjectDescription(locale, "rated"),
      does: getProjectDescription(locale, "rated"),
      problem: c.projects.detailBody,
      route: rated.route,
    },
    {
      id: "one-man-army",
      name: ecosystems.oneManArmy.name,
      typeLabel: c.common.individual,
      logo: oneManArmyBrand.logo,
      description: c.home.armyBody,
      does: c.army.body,
      problem: c.home.pathsBody,
      route: ecosystems.oneManArmy.route,
    },
    {
      id: "automation",
      name: ecosystems.automation.name,
      typeLabel: c.ecosystem.ecosystemType,
      description: c.automation.body,
      does: c.automation.productsBody,
      problem: c.home.pathsBody,
      route: ecosystems.automation.route,
    },
    {
      id: "stack",
      name: ecosystems.automationStack.name,
      typeLabel: c.common.bundle,
      description: c.stack.body,
      does: c.stack.connectedBody,
      problem: c.stack.truth,
      route: ecosystems.automationStack.route,
    },
  ];

  const stackProducts: StackProduct[] = products.map((product, index) => ({
    id: product.id,
    name: product.name,
    typeLabel: c.common.individual,
    logo: product.assets.logo,
    description: catalog(`${product.id}.description`),
    does: catalog(`${product.id}.longDescription`),
    problem: catalog(`${product.id}.highlight1`),
    route: product.marketingRoute,
    angle: stackAngles[index] ?? -90,
  }));

  return (
    <PublicShell>
      <main id="main-content">
        <PageHero eyebrow={c.ecosystem.eyebrow} title={c.ecosystem.title} body={c.ecosystem.body} />
        <section className="mx-auto w-full max-w-[1400px] px-6 py-16 lg:px-12 lg:py-20">
          <EcosystemExplorer center={center} nodes={nodes} stackProducts={stackProducts} labels={c.ecosystem} />
        </section>
      </main>
    </PublicShell>
  );
}
