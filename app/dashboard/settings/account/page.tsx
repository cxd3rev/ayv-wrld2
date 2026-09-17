import { AccountSettingsForm } from "@/components/settings/account-form";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function AccountSettingsPage() {
  const { profile, email } = await requireWorkspace();
  const t = await getTranslations("settings");

  return (
    <SettingsPage title={t("account")} description={t("accountDescription")}>
      <AccountSettingsForm profile={profile} email={email} />
    </SettingsPage>
  );
}
