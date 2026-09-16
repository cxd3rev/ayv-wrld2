"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { accountSchema, firstZodError, passwordSchema } from "@/lib/validations";

export async function updateAccount(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = accountSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { error: authError } = await supabase.auth.updateUser({
    email: parsed.data.email,
    data: { full_name: parsed.data.fullName },
  });

  if (authError) {
    return { ok: false, error: "Could not update your account." };
  }

  await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
    })
    .eq("id", user.id);

  return { ok: true, message: "Account updated." };
}

export async function updatePassword(formData: FormData) {
  await requireUser();
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: "Could not update your password." };
  }

  return { ok: true, message: "Password updated." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
