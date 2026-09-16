"use client";

import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils";

/**
 * Social login is not enabled yet, but the auth flow already uses the
 * same /auth/callback route. When you turn on a provider in Supabase,
 * call this from a button on the login/signup pages.
 */
export async function signInWithOAuth(provider: "google" | "github" | "apple") {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getAppUrl()}/auth/callback?next=/dashboard`,
    },
  });
}
