"use client";

import { AuthMessage } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toUserError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl, isSupabaseConfigured } from "@/lib/utils";
import { firstZodError, signupSchema } from "@/lib/validations";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState("");
  const [emailSentTo, setEmailSentTo] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    const parsed = signupSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setError(firstZodError(parsed.error));
      return;
    }

    if (!isSupabaseConfigured()) {
      setError(t("supabaseMissing"));
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.fullName },
          emailRedirectTo: `${getAppUrl()}/auth/callback?next=/onboarding`,
        },
      });

      if (signUpError) {
        setError(toUserError(signUpError));
        return;
      }

      if (!data.session) {
        setEmailSentTo(parsed.data.email);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch (caught) {
      setError(toUserError(caught));
    } finally {
      setPending(false);
    }
  }

  if (emailSentTo) {
    return (
      <AuthMessage
        title={t("checkEmailTitle")}
        description={t("checkEmailBody", { email: emailSentTo })}
        action={
          <Link
            href="/login"
            className="inline-flex h-14 items-center rounded-full border border-foreground/20 px-6 text-sm hover:bg-foreground/5"
          >
            {t("goToLogin")}
          </Link>
        }
      />
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="mb-2 text-center">
        <h1 className="display text-5xl tracking-tight">{t("signupTitle")}</h1>
        <p className="mt-3 text-sm text-muted">{t("signupDescription")}</p>
      </div>
      <div>
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </div>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("creatingAccount") : t("createAccount")}
      </Button>
      <p className="text-center text-sm text-muted">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-accent hover:underline">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
