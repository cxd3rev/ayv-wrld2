import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import type { ProductConfig } from "@/config/products";
import type { WorkspaceChoice } from "@/lib/auth/session";
import type { Notification, Organization, Profile } from "@/types/database";

export function DashboardShell({
  organization,
  profile,
  email,
  product,
  notifications,
  workspaces,
  children,
}: {
  organization: Organization;
  profile: Profile | null;
  email: string | null;
  product: ProductConfig;
  notifications: Notification[];
  workspaces: WorkspaceChoice[];
  children: React.ReactNode;
}) {
  return (
    <div className="workspace flex min-h-screen">
      <Sidebar organization={organization} product={product} workspaces={workspaces} />
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
