import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { ProductSwitcher } from "@/components/layout/product-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import type { ProductId } from "@/config/products";
import type { Notification, Organization, Profile } from "@/types/database";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("common");

  return (
    <header className="flex h-20 items-center justify-between gap-3 border-b border-foreground/10 px-4 pl-14 lg:px-12 lg:pl-12">
      <div className="flex min-w-0 items-center gap-4">
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-medium">{organization.name}</p>
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{t("workspace")}</p>
        </div>
        <ProductSwitcher activeProductId={productId} />
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <NotificationsMenu notifications={notifications} />
        <UserMenu name={profile?.full_name ?? null} email={email} />
      </div>
    </header>
  );
}
