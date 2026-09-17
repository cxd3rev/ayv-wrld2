"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toUserError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl, isSupabaseConfigured } from "@/lib/utils";
import { emailSchema, firstZodError } from "@/lib/validations";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setMessage("");
    const parsed = emailSchema.safeParse({ email: formData.get("email") });
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${getAppUrl()}/auth/callback?next=/reset-password`,
      });
      if (resetError) {
        setError(toUserError(resetError));
        return;
      }
      setMessage(t("resetSent"));
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
        <Input id="email" name="email" type="email" required />
      </div>
      <FormError message={error} />
      {message ? <p className="text-sm text-success">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("sending") : t("sendReset")}
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
