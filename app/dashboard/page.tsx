import { DashboardCard } from "@/components/ui/dashboard-card";
import { getProduct, products } from "@/config/products";
import { requireWorkspace } from "@/lib/auth/session";
import { getOrganizationSubscriptions, paidProductSlugs } from "@/services/billing";
import { listNotifications } from "@/services/notifications";
import { openProductWorkspace } from "@/services/product-switch";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function DashboardPage() {
  const { organization, profile } = await requireWorkspace();
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const tIndustries = await getTranslations("industries");
  const [subscriptions, notifications] = await Promise.all([
    getOrganizationSubscriptions(organization.id),
    listNotifications(),
  ]);
  const paid = paidProductSlugs(subscriptions);
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div>
      <p className="kicker">{t("overview")}</p>
      <h1 className="display mt-4 text-4xl tracking-tight sm:text-6xl">
        {firstName ? t("greetingNamed", { name: firstName }) : t("greeting")}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("ready", { name: organization.name })}</p>

      <div className="mt-12 grid gap-0 border-t border-foreground/10 sm:grid-cols-3 sm:gap-10">
        <DashboardCard
          title={t("workspace")}
          value={organization.name}
          hint={
            organization.industry
              ? tIndustries(organization.industry as Parameters<typeof tIndustries>[0])
              : t("workspace")
          }
        />
        <DashboardCard
          title={t("subscription")}
          value={
            paid.length
              ? paid.map((slug) => getProduct(slug)?.name ?? slug).join(" + ")
              : tCommon("none")
          }
          hint={t("billedPerOrg")}
        />
        <DashboardCard
          title={t("unread")}
          value={String(notifications.filter((item) => !item.read).length)}
          hint={t("notifications")}
        />
      </div>

      <div className="mt-4 grid gap-0 border-t border-foreground/10 lg:grid-cols-3">
        <form
          action={openProductWorkspace}
          className="border-b border-foreground/10 lg:border-r lg:border-b-0"
        >
          <input type="hidden" name="productId" value="avyro" />
          <button
            type="submit"
            className="group flex min-h-44 w-full flex-col justify-between py-8 pr-6 text-left lg:pr-8"
          >
            <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("startHere")}</p>
            <div>
              <h2 className="display text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
                {t("openAvyro")}
              </h2>
              <p className="mt-2 text-sm text-muted">{t("openAvyroBody")}</p>
            </div>
          </button>
        </form>
        <form
          action={openProductWorkspace}
          className="border-b border-foreground/10 lg:border-r lg:border-b-0"
        >
          <input type="hidden" name="productId" value="velto" />
          <button
            type="submit"
            className="group flex min-h-44 w-full flex-col justify-between py-8 text-left lg:px-8"
          >
            <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("bookings")}</p>
            <div>
              <h2 className="display text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
                {t("openVelto")}
              </h2>
              <p className="mt-2 text-sm text-muted">{t("openVeltoBody")}</p>
            </div>
          </button>
        </form>
        <form action={openProductWorkspace}>
          <input type="hidden" name="productId" value="rovyn" />
          <button
            type="submit"
            className="group flex min-h-44 w-full flex-col justify-between py-8 text-left lg:pl-8"
          >
            <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("quotes")}</p>
            <div>
              <h2 className="display text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
                {t("openRovyn")}
              </h2>
              <p className="mt-2 text-sm text-muted">{t("openRovynBody")}</p>
            </div>
          </button>
        </form>
      </div>

      <section className="mt-4 border-t border-foreground/10 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="display text-3xl tracking-tight">{t("getMost")}</h2>
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">{t("foundationSetup")}</p>
        </div>
        <ol className="divide-y divide-foreground/10 border-y border-foreground/10">
          {[
            { href: "/dashboard/settings", label: t("completeProfile"), done: Boolean(organization.industry) },
            { href: "/dashboard/settings/team", label: t("inviteTeammates"), done: false },
            { href: "/dashboard/billing", label: t("reviewBilling"), done: paid.length > 0 },
          ].map((item, index) => (
            <li key={item.label}>
              <Link href={item.href} className="flex items-center gap-4 py-5 text-sm hover:text-accent">
                <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
                <CheckCircle2 className={item.done ? "h-4 w-4 text-accent" : "h-4 w-4 text-muted/40"} />
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
        {products.map((product) =>
          product.status === "active" ? (
            <form key={product.id} action={openProductWorkspace}>
              <input type="hidden" name="productId" value={product.id} />
              <button
                type="submit"
                className="font-mono text-xs tracking-[0.14em] text-muted uppercase hover:text-foreground"
              >
                {product.name}
              </button>
            </form>
          ) : (
            <span key={product.id} className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
              {product.name}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
