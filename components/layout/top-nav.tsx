import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { ProductSwitcher } from "@/components/layout/product-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import type { ProductId } from "@/config/products";
import type { Notification, Organization, Profile } from "@/types/database";

export function TopNav({
  organization,
  profile,
  email,
  productId,
  notifications,
}: {
  organization: Organization;
  profile: Profile | null;
  email: string | null;
  productId: ProductId;
  notifications: Notification[];
}) {
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-white/8 px-4 pl-14 lg:px-8 lg:pl-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-medium">{organization.name}</p>
          <p className="text-xs text-muted">Workspace</p>
        </div>
        <ProductSwitcher activeProductId={productId} />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsMenu notifications={notifications} />
        <UserMenu name={profile?.full_name ?? null} email={email} />
      </div>
    </header>
  );
}
