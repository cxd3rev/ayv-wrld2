import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <AuthShell title={t("loginTitle")} description={t("loginDescription")}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
