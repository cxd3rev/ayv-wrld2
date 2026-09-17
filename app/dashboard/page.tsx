import { DashboardCard } from "@/components/ui/dashboard-card";
import { products } from "@/config/products";
import { requireWorkspace } from "@/lib/auth/session";
import { getOrganizationSubscription } from "@/services/billing";
import { listNotifications } from "@/services/notifications";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const { organization, profile } = await requireWorkspace();
  const [subscription, notifications] = await Promise.all([
    getOrganizationSubscription(organization.id),
    listNotifications(),
  ]);
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div>
      <p className="kicker">Overview</p>
      <h1 className="display mt-4 text-4xl tracking-tight sm:text-6xl">
        Have a great day{firstName ? `, ${firstName}` : ""}.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        {organization.name} is ready. This overview is shared across every AYV WRLD product.
      </p>

      <div className="mt-12 grid gap-0 border-t border-foreground/10 sm:grid-cols-3 sm:gap-10">
        <DashboardCard title="Workspace" value={organization.name} hint={organization.industry ?? "Business"} />
        <DashboardCard
          title="Subscription"
          value={subscription?.status ?? "None"}
          hint="Billed per organization"
        />
        <DashboardCard
          title="Unread"
          value={String(notifications.filter((item) => !item.read).length)}
          hint="Notifications"
        />
      </div>

      <div className="mt-4 grid gap-0 border-t border-foreground/10 lg:grid-cols-2">
        <Link
          href="/dashboard/product"
          className="group flex min-h-44 flex-col justify-between border-b border-foreground/10 py-8 pr-6 lg:border-r lg:border-b-0 lg:pr-10"
        >
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Start here</p>
          <div>
            <h2 className="display text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
              Open Avyro
            </h2>
            <p className="mt-2 text-sm text-muted">Follow up with new leads so conversations become customers.</p>
          </div>
        </Link>
        <Link
          href="/dashboard/settings/team"
          className="group flex min-h-44 flex-col justify-between py-8 lg:pl-10"
        >
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Team</p>
          <div>
            <h2 className="display text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 lg:text-4xl">
              Invite a teammate
            </h2>
            <p className="mt-2 text-sm text-muted">Share this workspace when you are ready.</p>
          </div>
        </Link>
      </div>

      <section className="mt-4 border-t border-foreground/10 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="display text-3xl tracking-tight">Get the most out of AYV WRLD</h2>
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Foundation setup</p>
        </div>
        <ol className="divide-y divide-foreground/10 border-y border-foreground/10">
          {[
            { href: "/dashboard/settings", label: "Complete business profile", done: Boolean(organization.industry) },
            { href: "/dashboard/product", label: "Open the Avyro workspace", done: false },
            { href: "/dashboard/settings/team", label: "Invite teammates", done: false },
            { href: "/dashboard/billing", label: "Review billing", done: Boolean(subscription) },
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
        {products.map((product) => (
          <span key={product.id} className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
            {product.name}
          </span>
        ))}
      </div>
    </div>
  );
}
