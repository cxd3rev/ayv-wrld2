import { legacyModulesEnabled } from "@/config/features";
import { PRODUCT_NAME } from "@/config/site";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { alternates: { canonical: "/login" } };

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <AuthShell title={legacyModulesEnabled ? t("loginTitle") : "Welkom terug"} description={legacyModulesEnabled ? t("loginDescription") : `Log in op ${PRODUCT_NAME}.`}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
