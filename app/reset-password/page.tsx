import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getTranslations } from "next-intl/server";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");
  return (
    <AuthShell title={t("resetTitle")} description={t("resetDescription")}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
