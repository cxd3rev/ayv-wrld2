"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toUserError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { firstZodError, loginSchema } from "@/lib/validations";
import { isSupabaseConfigured } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get("error") ? t("signInError") : "");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    const parsed = loginSchema.safeParse({
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
      const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
      if (signInError) {
        setError(toUserError(signInError));
        return;
      }
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch (caught) {
      setError(toUserError(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="password" className="mb-0">
            {t("password")}
          </Label>
          <Link href="/forgot-password" className="text-xs text-accent hover:underline">
            {t("forgotPassword")}
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("signingIn") : t("login")}
      </Button>
      <p className="text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/signup" className="text-accent hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </form>
  );
}
