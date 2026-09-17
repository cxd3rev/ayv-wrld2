"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signOut, updateAccount, updatePassword } from "@/services/account";
import type { Profile } from "@/types/database";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function AccountSettingsForm({
  profile,
  email,
}: {
  profile: Profile | null;
  email: string | null;
}) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function onAccount(formData: FormData) {
    setError("");
    const result = await updateAccount(formData);
    if (!result.ok) {
      setError(result.error ?? "Could not update account.");
      return;
    }
    toast({ title: result.message ?? "Saved", tone: "success" });
  }

  async function onPassword(formData: FormData) {
    setPasswordError("");
    const result = await updatePassword(formData);
    if (!result.ok) {
      setPasswordError(result.error ?? "Could not update password.");
      return;
    }
    toast({ title: result.message ?? "Password updated", tone: "success" });
  }

  return (
    <div className="max-w-xl space-y-10">
      <form action={onAccount} className="space-y-4">
        <div>
          <Label htmlFor="fullName">{t("name")}</Label>
          <Input id="fullName" name="fullName" defaultValue={profile?.full_name ?? ""} required />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" defaultValue={email ?? ""} required />
        </div>
        <FormError message={error} />
        <Button type="submit">{t("saveAccount")}</Button>
      </form>

      <form action={onPassword} className="space-y-4">
        <div>
          <Label htmlFor="password">{t("newPassword")}</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div>
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
        <FormError message={passwordError} />
        <Button type="submit" variant="secondary">
          {t("updatePassword")}
        </Button>
      </form>

      <div>
        <Button variant="danger" onClick={() => setConfirmLogout(true)}>
          {t("logOut")}
        </Button>
      </div>

      <ConfirmationDialog
        open={confirmLogout}
        title={t("logOutTitle")}
        description={t("logOutBody")}
        confirmLabel={t("logOut")}
        cancelLabel={tCommon("cancel")}
        danger
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => signOut()}
      />
    </div>
  );
}
