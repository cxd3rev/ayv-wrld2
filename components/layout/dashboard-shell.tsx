import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import type { ProductConfig } from "@/config/products";
import type { Notification, Organization, Profile } from "@/types/database";

export function DashboardShell({
  organization,
  profile,
  email,
  product,
  notifications,
  children,
}: {
  organization: Organization;
  profile: Profile | null;
  email: string | null;
  product: ProductConfig;
  notifications: Notification[];
  children: React.ReactNode;
}) {
  return (
    <div className="workspace flex min-h-screen">
      <Sidebar organization={organization} product={product} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          organization={organization}
          profile={profile}
          email={email}
          productId={product.id}
          notifications={notifications}
        />
        <main className="workspace-rise flex-1 px-4 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
