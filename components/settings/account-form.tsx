"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signOut, updateAccount, updatePassword } from "@/services/account";
import type { Profile } from "@/types/database";
import { useState } from "react";

export function AccountSettingsForm({
  profile,
  email,
}: {
  profile: Profile | null;
  email: string | null;
}) {
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
          <Label htmlFor="fullName">Name</Label>
          <Input id="fullName" name="fullName" defaultValue={profile?.full_name ?? ""} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={email ?? ""} required />
        </div>
        <FormError message={error} />
        <Button type="submit">Save account</Button>
      </form>

      <form action={onPassword} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
        <FormError message={passwordError} />
        <Button type="submit" variant="secondary">
          Update password
        </Button>
      </form>

      <div>
        <Button variant="danger" onClick={() => setConfirmLogout(true)}>
          Log out
        </Button>
      </div>

      <ConfirmationDialog
        open={confirmLogout}
        title="Log out?"
        description="You will need to sign in again to access your workspace."
        confirmLabel="Log out"
        danger
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => signOut()}
      />
    </div>
  );
}
