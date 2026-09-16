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
      <h1 className="display text-4xl sm:text-5xl">
        Have a great day{firstName ? `, ${firstName}` : ""}.
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        {organization.name} is ready. This overview is shared across every AYV WRLD product.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Link
          href="/dashboard/product"
          className="flex min-h-44 flex-col justify-between rounded-[28px] border border-white/8 bg-white/[0.03] p-6 hover:bg-white/[0.05]"
        >
          <p className="text-sm text-muted">Start here</p>
          <div>
            <h2 className="display text-3xl">Open Avyro</h2>
            <p className="mt-2 text-sm text-muted">The first product workspace is waiting.</p>
          </div>
        </Link>
        <Link
          href="/dashboard/settings/team"
          className="flex min-h-44 flex-col justify-between rounded-[28px] border border-white/8 bg-white/[0.03] p-6 hover:bg-white/[0.05]"
        >
          <p className="text-sm text-muted">Team</p>
          <div>
            <h2 className="display text-3xl">Invite a teammate</h2>
            <p className="mt-2 text-sm text-muted">Share this workspace when you are ready.</p>
          </div>
        </Link>
      </div>

      <section className="mt-6 rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-medium">Get the most out of AYV WRLD</h2>
          <p className="text-xs text-muted">Foundation setup</p>
        </div>
        <ol className="divide-y divide-white/8">
          {[
            { href: "/dashboard/settings", label: "Complete business profile", done: Boolean(organization.industry) },
            { href: "/dashboard/product", label: "Open the Avyro workspace", done: false },
            { href: "/dashboard/settings/team", label: "Invite teammates", done: false },
            { href: "/dashboard/billing", label: "Review billing", done: Boolean(subscription) },
          ].map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="flex items-center gap-3 py-4 text-sm hover:text-accent">
                <CheckCircle2 className={item.done ? "h-4 w-4 text-accent" : "h-4 w-4 text-muted/40"} />
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        {products.map((product) => (
          <span
            key={product.id}
            className="rounded-full border border-white/8 px-3 py-1 text-xs text-muted"
          >
            {product.name}
          </span>
        ))}
      </div>
    </div>
  );
}
