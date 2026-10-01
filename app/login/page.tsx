import { legacyModulesEnabled } from "@/config/features";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/config/site";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { alternates: { canonical: "/login" } };

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <AuthShell title={legacyModulesEnabled ? t("loginTitle") : PRODUCT_NAME} description={legacyModulesEnabled ? t("loginDescription") : PRODUCT_TAGLINE}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
