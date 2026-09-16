"use client";

import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { getInitials } from "@/lib/utils";
import { signOut } from "@/services/account";
import Link from "next/link";

export function UserMenu({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) {
  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-border px-2 py-1.5 hover:bg-white/5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold text-accent">
            {getInitials(name || email)}
          </span>
          <span className="hidden max-w-32 truncate text-sm sm:block">{name || email}</span>
        </button>
      }
    >
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium">{name || "Account"}</p>
        <p className="truncate text-xs text-muted">{email}</p>
      </div>
      <Link href="/dashboard/settings/account" className="block">
        <DropdownItem>Account settings</DropdownItem>
      </Link>
      <DropdownItem className="text-danger" onClick={() => signOut()}>
        Log out
      </DropdownItem>
    </Dropdown>
  );
}
