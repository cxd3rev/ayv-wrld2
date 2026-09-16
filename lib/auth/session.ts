import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Organization, Profile } from "@/types/database";
import type { MemberRole } from "@/types/database";

export type CurrentWorkspace = {
  userId: string;
  email: string | null;
  profile: Profile | null;
  organization: Organization;
  role: MemberRole;
};

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Used on public pages so a missing Supabase setup does not crash the site. */
export async function getOptionalUser() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }
    const { user } = await getUser();
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getWorkspace() {
  const { supabase, user } = await getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role, organization_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return {
      userId: user.id,
      email: user.email ?? profile?.email ?? null,
      profile: profile as Profile | null,
      organization: null,
      role: null,
    };
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (!organization) {
    return {
      userId: user.id,
      email: user.email ?? profile?.email ?? null,
      profile: profile as Profile | null,
      organization: null,
      role: null,
    };
  }

  return {
    userId: user.id,
    email: user.email ?? profile?.email ?? null,
    profile: profile as Profile | null,
    organization: organization as Organization,
    role: membership.role as MemberRole,
  };
}

export async function requireWorkspace(): Promise<CurrentWorkspace> {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/login");
  if (!workspace.organization || !workspace.role) redirect("/onboarding");
  return workspace as CurrentWorkspace;
}
