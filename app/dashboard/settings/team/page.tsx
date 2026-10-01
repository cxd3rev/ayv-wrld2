import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings/settings-page";
import { TeamSettings } from "@/components/settings/team-settings";
import { requireWorkspace } from "@/lib/auth/session";
import { listInvites, listMembers } from "@/services/organizations";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/settings/team" } };

export default async function TeamSettingsPage() {
  const { role } = await requireWorkspace();
  const t = await getTranslations("settings");
  const [members, invites] = await Promise.all([listMembers(), listInvites()]);

  return (
    <SettingsPage title={t("team")} description={t("teamDescription")}>
      <TeamSettings
        members={members}
        invites={invites}
        canInvite={role === "owner" || role === "admin"}
        canChangeRoles={role === "owner"}
      />
    </SettingsPage>
  );
}
