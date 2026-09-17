import { GeneralSettingsForm } from "@/components/settings/general-form";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireWorkspace } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function GeneralSettingsPage() {
  const { organization } = await requireWorkspace();
  const t = await getTranslations("settings");

  return (
    <SettingsPage title={t("title")} description={t("description")}>
      <GeneralSettingsForm organization={organization} />
    </SettingsPage>
  );
}
