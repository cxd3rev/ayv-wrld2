import { SettingsPage } from "@/components/settings/settings-page";
import { TeamSettings } from "@/components/settings/team-settings";
import { requireWorkspace } from "@/lib/auth/session";
import { listMembers } from "@/services/organizations";
import { getTranslations } from "next-intl/server";

export default async function TeamSettingsPage() {
  const { role } = await requireWorkspace();
  const t = await getTranslations("settings");
  const members = await listMembers();

  return (
    <SettingsPage title={t("team")} description={t("teamDescription")}>
      <TeamSettings
        members={members}
        canInvite={role === "owner" || role === "admin"}
        canChangeRoles={role === "owner"}
      />
    </SettingsPage>
  );
}
