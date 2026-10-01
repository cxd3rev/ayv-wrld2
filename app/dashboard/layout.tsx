import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProduct } from "@/config/products";
import { listMyWorkspaces, requireWorkspace } from "@/lib/auth/session";
import { getActiveProductId } from "@/lib/product-cookie";
import { listNotifications } from "@/services/notifications";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const workspace = await requireWorkspace();
  const productId = await getActiveProductId();
  const product = getProduct(productId)!;
  const [notifications, workspaces] = await Promise.all([
    listNotifications(),
    listMyWorkspaces(),
  ]);

  return (
    <DashboardShell
      organization={workspace.organization}
      profile={workspace.profile}
      email={workspace.email}
      product={product}
      notifications={notifications}
      workspaces={workspaces}
    >
      {children}
    </DashboardShell>
  );
}
