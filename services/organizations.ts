"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireWorkspace } from "@/lib/auth/session";
import { firstZodError, inviteSchema, onboardingSchema, organizationSettingsSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { sendEmail, teamInviteEmail } from "@/services/email";
import { getAppUrl } from "@/lib/utils";
import { createNotification } from "@/services/notifications";
import type { MemberRole, MemberWithProfile } from "@/types/database";

export async function completeOnboarding(formData: FormData) {
  const { supabase, user } = await requireUser();

  const parsed = onboardingSchema.safeParse({
    businessName: formData.get("businessName"),
    industry: formData.get("industry"),
    website: formData.get("website"),
    businessEmail: formData.get("businessEmail"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const website = parsed.data.website
    ? parsed.data.website.startsWith("http")
      ? parsed.data.website
      : `https://${parsed.data.website}`
    : "";

  const { data, error } = await supabase.rpc("create_organization", {
    org_name: parsed.data.businessName,
    org_slug: slugify(parsed.data.businessName),
    org_industry: parsed.data.industry,
    org_website: website || null,
    org_email: parsed.data.businessEmail,
    org_phone: parsed.data.phone || null,
  });

  if (error || !data) {
    return { ok: false, error: "Could not create your workspace. Please try again." };
  }

  const organization = Array.isArray(data) ? data[0] : data;

  await supabase
    .from("profiles")
    .update({
      email: user.email,
      full_name: user.user_metadata?.full_name ?? null,
    })
    .eq("id", user.id);

  if (organization?.id) {
    await createNotification({
      organizationId: organization.id,
      userId: user.id,
      title: "Welcome to AYV WRLD",
      message: "Your workspace is ready. Avyro is the first product that will be built here.",
      type: "success",
    });
  }

  redirect("/dashboard");
}

export async function updateOrganizationSettings(formData: FormData) {
  const { organization, role } = await requireWorkspace();
  if (role === "member") {
    return { ok: false, error: "Only owners and admins can update business settings." };
  }

  const parsed = organizationSettingsSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    website: formData.get("website"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      industry: parsed.data.industry,
      website: parsed.data.website || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
    })
    .eq("id", organization.id);

  if (error) {
    return { ok: false, error: "Could not save settings." };
  }

  return { ok: true, message: "Business settings saved." };
}

export async function listMembers(): Promise<MemberWithProfile[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();

  const { data } = await supabase
    .from("organization_members")
    .select("id, organization_id, user_id, role, created_at, profiles(full_name, email)")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: true });

  return (data as MemberWithProfile[] | null) ?? [];
}

export async function updateMemberRole(memberId: string, role: MemberRole) {
  const { organization, role: currentRole } = await requireWorkspace();
  if (currentRole !== "owner") {
    return { ok: false, error: "Only the owner can change roles." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .update({ role })
    .eq("id", memberId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not update the member role." };
  }

  return { ok: true, message: "Role updated." };
}

export async function inviteMember(formData: FormData) {
  const { organization, userId, role } = await requireWorkspace();
  if (role === "member") {
    return { ok: false, error: "Only owners and admins can invite teammates." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("organization_invites").insert({
    organization_id: organization.id,
    email: parsed.data.email.toLowerCase(),
    role: parsed.data.role,
    invited_by: userId,
  });

  if (error) {
    return { ok: false, error: "Could not create the invite. They may already be invited." };
  }

  await sendEmail({
    to: parsed.data.email,
    subject: `You were invited to ${organization.name} on AYV WRLD`,
    html: teamInviteEmail({
      organizationName: organization.name,
      inviteUrl: `${getAppUrl()}/signup`,
    }),
    template: "team_invite",
    organizationId: organization.id,
    userId,
  });

  return { ok: true, message: "Invite sent." };
}
