"use client";

import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { markAllNotificationsRead, markNotificationRead } from "@/services/notifications";
import type { Notification } from "@/types/database";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export function NotificationsMenu({ notifications }: { notifications: Notification[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="relative rounded-full border border-foreground/15 p-2 hover:bg-foreground/5"
          aria-label={t("dashboard.notifications")}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
              {unread}
            </span>
          ) : null}
        </button>
      }
      className="w-80 p-2"
    >
      <div className="mb-2 flex items-center justify-between px-2">
        <p className="text-sm font-medium">{t("dashboard.notifications")}</p>
        {unread > 0 ? (
          <button
            type="button"
            className="text-xs text-accent"
            onClick={async () => {
              await markAllNotificationsRead();
              router.refresh();
            }}
          >
            {t("dashboard.markAllRead")}
          </button>
        ) : null}
      </div>
      {notifications.length === 0 ? (
        <p className="px-2 py-6 text-center text-sm text-muted">{t("dashboard.noNotifications")}</p>
      ) : (
        notifications.map((item) => (
          <DropdownItem
            key={item.id}
            className="flex-col items-start gap-1"
            onClick={async () => {
              if (!item.read) {
                await markNotificationRead(item.id);
                router.refresh();
              }
            }}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="font-medium">{item.title}</span>
              {!item.read ? <Badge tone="accent">{t("common.new")}</Badge> : null}
            </span>
            <span className="text-xs text-muted">{item.message}</span>
            <span className="text-xs text-muted">{formatDate(item.created_at, locale)}</span>
          </DropdownItem>
        ))
      )}
    </Dropdown>
  );
}
