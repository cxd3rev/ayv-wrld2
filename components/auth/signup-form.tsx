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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
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
      setError("Supabase is not configured yet. Add your keys to .env.local.");
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
        title="Check your email"
        description={`We sent a verification link to ${emailSentTo}.`}
        action={
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm hover:bg-white/5"
          >
            Go to login →
          </Link>
        }
      />
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="mb-2 text-center">
        <h1 className="display text-4xl">Create an AYV WRLD account</h1>
        <p className="mt-3 text-sm text-muted">Start with a workspace. Avyro will plug in later.</p>
      </div>
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </div>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
