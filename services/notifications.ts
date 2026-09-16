"use server";

import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/auth/session";
import type { Notification } from "@/types/database";

export async function listNotifications(): Promise<Notification[]> {
  const { organization, userId } = await requireWorkspace();
  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("organization_id", organization.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data as Notification[] | null) ?? [];
}

export async function markNotificationRead(id: string) {
  const { userId } = await requireWorkspace();
  const supabase = await createClient();

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", userId);
}

export async function markAllNotificationsRead() {
  const { organization, userId } = await requireWorkspace();
  const supabase = await createClient();

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("organization_id", organization.id)
    .eq("user_id", userId)
    .eq("read", false);
}

export async function createNotification(input: {
  organizationId: string;
  userId: string;
  title: string;
  message: string;
  type?: Notification["type"];
}) {
  const supabase = await createClient();
  await supabase.from("notifications").insert({
    organization_id: input.organizationId,
    user_id: input.userId,
    title: input.title,
    message: input.message,
    type: input.type ?? "info",
  });
}
