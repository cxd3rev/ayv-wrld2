"use client";

import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { getInitials } from "@/lib/utils";
import { signOut } from "@/services/account";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function UserMenu({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) {
  const t = useTranslations();
  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-foreground/15 px-2 py-1.5 hover:bg-foreground/5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
            {getInitials(name || email)}
          </span>
          <span className="hidden max-w-32 truncate text-sm sm:block">{name || email}</span>
        </button>
      }
    >
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium">{name || t("common.account")}</p>
        <p className="truncate text-xs text-muted">{email}</p>
      </div>
      <Link href="/dashboard/settings/account" className="block">
        <DropdownItem>{t("dashboard.accountSettings")}</DropdownItem>
      </Link>
      <DropdownItem className="text-danger" onClick={() => signOut()}>
        {t("dashboard.logOut")}
      </DropdownItem>
    </Dropdown>
  );
}
