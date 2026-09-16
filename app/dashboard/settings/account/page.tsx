import { AccountSettingsForm } from "@/components/settings/account-form";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";

export default async function AccountSettingsPage() {
  const { profile, email } = await requireWorkspace();

  return (
    <SettingsPage title="Account" description="Your personal login details.">
      <AccountSettingsForm profile={profile} email={email} />
    </SettingsPage>
  );
}
