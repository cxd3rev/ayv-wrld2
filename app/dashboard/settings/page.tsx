import { GeneralSettingsForm } from "@/components/settings/general-form";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";

export default async function GeneralSettingsPage() {
  const { organization } = await requireWorkspace();

  return (
    <SettingsPage title="Settings" description="Business details used by every AYV WRLD product.">
      <GeneralSettingsForm organization={organization} />
    </SettingsPage>
  );
}
