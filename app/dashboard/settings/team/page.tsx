import { SettingsPage } from "@/components/settings/settings-page";
import { TeamSettings } from "@/components/settings/team-settings";
import { requireWorkspace } from "@/lib/auth/session";
import { listMembers } from "@/services/organizations";

export default async function TeamSettingsPage() {
  const { role } = await requireWorkspace();
  const members = await listMembers();

  return (
    <SettingsPage title="Team" description="People who can access this organization.">
      <TeamSettings
        members={members}
        canInvite={role === "owner" || role === "admin"}
        canChangeRoles={role === "owner"}
      />
    </SettingsPage>
  );
}
