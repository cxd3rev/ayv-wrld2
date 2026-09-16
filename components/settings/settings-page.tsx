import { PageHeader } from "@/components/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";

export function SettingsPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <SettingsNav />
      {children}
    </div>
  );
}
