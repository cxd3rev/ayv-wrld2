import type { Metadata } from "next";
import { legacyModulesEnabled } from "@/config/features";
import { ReminderSettingsForm } from "@/components/onderhoud/reminder-settings-form";
import { GeneralSettingsForm } from "@/components/settings/general-form";
import { SettingsPage } from "@/components/settings/settings-page";
import { getReminderLeadDays } from "@/lib/onderhoud/data";
import { requireWorkspace } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/settings" } };

export default async function GeneralSettingsPage() {
  const { organization } = await requireWorkspace();
  const t = await getTranslations("settings");

  return (
    <SettingsPage
      title={legacyModulesEnabled ? t("title") : "Instellingen"}
      description={legacyModulesEnabled ? t("description") : "Bedrijfsgegevens, en hoeveel dagen op voorhand een klant een herinnering krijgt."}
    >
      <GeneralSettingsForm organization={organization} />
      {legacyModulesEnabled ? null : <ReminderSettingsForm days={await getReminderLeadDays(organization.id)} />}
    </SettingsPage>
  );
}
