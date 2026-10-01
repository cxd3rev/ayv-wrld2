"use server";

import { legacyModulesEnabled } from "@/config/features";
import { PRODUCT_NAME } from "@/config/site";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, requireWorkspace } from "@/lib/auth/session";
import { firstZodError, installerOnboardingSchema, inviteSchema, onboardingSchema, organizationSettingsSchema } from "@/lib/validations";
import { setActiveOrganization } from "@/lib/org-cookie";
import { getAppUrl, slugify } from "@/lib/utils";
import { sendEmail, teamInviteEmail } from "@/services/email";
import { createNotification } from "@/services/notifications";
import type { MemberRole, MemberWithProfile, OrganizationInvite } from "@/types/database";

export async function completeOnboarding(formData: FormData) {
  const { supabase, user } = await requireUser();
  const installer = !legacyModulesEnabled;

  const parsed = installer
    ? installerOnboardingSchema.safeParse({
        businessName: formData.get("businessName"),
        vatNumber: formData.get("vatNumber"),
        municipality: formData.get("municipality"),
        serviceMunicipalities: formData.getAll("serviceMunicipalities").map((value) => String(value).trim()).filter(Boolean),
        businessEmail: formData.get("businessEmail"),
        phone: formData.get("phone"),
      })
    : onboardingSchema.safeParse({
        businessName: formData.get("businessName"),
        industry: formData.get("industry"),
        website: formData.get("website"),
        businessEmail: formData.get("businessEmail"),
        phone: formData.get("phone"),
      });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const websiteValue = "website" in parsed.data ? parsed.data.website : "";
  const website = websiteValue
    ? websiteValue.startsWith("http")
      ? websiteValue
      : `https://${websiteValue}`
    : "";

  const { data, error } = await supabase.rpc("create_organization", {
    org_name: parsed.data.businessName,
    org_slug: slugify(parsed.data.businessName),
    org_industry: "industry" in parsed.data ? parsed.data.industry : "Other",
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

  if (installer && organization?.id && "municipality" in parsed.data) {
    await supabase
      .from("organizations")
      .update({
        vat_number: parsed.data.vatNumber || null,
        municipality: parsed.data.municipality,
        service_municipalities: parsed.data.serviceMunicipalities,
      })
      .eq("id", organization.id);
  }

  if (organization?.id) {
    await createNotification({
      organizationId: organization.id,
      userId: user.id,
      title: `Welkom bij ${PRODUCT_NAME}`,
      message: "Uw workspace is klaar.",
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
  const municipality = formData.get("municipality");
  const places = String(formData.get("serviceMunicipalities") ?? "")
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      industry: parsed.data.industry,
      website: parsed.data.website || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      ...(typeof municipality === "string"
        ? {
            vat_number: String(formData.get("vatNumber") ?? "").trim() || null,
            municipality: municipality.trim(),
            service_municipalities: places,
          }
        : {}),
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

export async function listInvites(): Promise<OrganizationInvite[]> {
  const { organization, role } = await requireWorkspace();
  if (role === "member") return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_invites")
    .select("id, organization_id, email, role, token, invited_by, created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return (data as OrganizationInvite[] | null) ?? [];
}

async function deliverInvite(input: {
  email: string;
  token: string;
  organizationId: string;
  organizationName: string;
  userId: string;
}) {
  const inviteUrl = `${getAppUrl()}/invite/${input.token}`;
  const emailed = await sendEmail({
    to: input.email,
    subject: `Uitnodiging voor ${input.organizationName} op ${PRODUCT_NAME}`,
    html: teamInviteEmail({
      organizationName: input.organizationName,
      inviteUrl,
    }),
    template: "team_invite",
    organizationId: input.organizationId,
    userId: input.userId,
  });

  return { inviteUrl, emailed: emailed.ok };
}

export async function inviteMember(formData: FormData) {
  const { organization, userId, role } = await requireWorkspace();
  if (role === "member") {
    return { ok: false as const, error: "Only owners and admins can invite teammates." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: firstZodError(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase();
  const members = await listMembers();
  if (members.some((member) => member.profiles?.email?.toLowerCase() === email)) {
    return { ok: false as const, error: "That person is already in this workspace." };
  }

  const supabase = await createClient();
  if (!legacyModulesEnabled) {
    const { data: pending } = await supabase.from("organization_invites").select("email").eq("organization_id", organization.id);
    const alreadyInvited = (pending ?? []).some((invite) => invite.email?.toLowerCase() === email);
    if (!alreadyInvited && members.length + (pending?.length ?? 0) >= 3) {
      return { ok: false as const, error: "Dit plan heeft plaats voor 3 gebruikers." };
    }
  }
  const { data, error } = await supabase
    .from("organization_invites")
    .insert({
      organization_id: organization.id,
      email,
      role: parsed.data.role,
      invited_by: userId,
    })
    .select("token")
    .single();

  let token = data?.token ?? null;
  if (error?.code === "23505") {
    const { data: existing } = await supabase
      .from("organization_invites")
      .select("token")
      .eq("organization_id", organization.id)
      .eq("email", email)
      .maybeSingle();
    token = existing?.token ?? null;
  } else if (error || !token) {
    return { ok: false as const, error: "Could not create the invite. They may already be invited." };
  }

  if (!token) {
    return { ok: false as const, error: "Could not create the invite. They may already be invited." };
  }

  const delivery = await deliverInvite({
    email,
    token,
    organizationId: organization.id,
    organizationName: organization.name,
    userId,
  });

  return { ok: true as const, emailed: delivery.emailed, inviteUrl: delivery.inviteUrl };
}

export async function revokeInvite(inviteId: string) {
  const { organization, role } = await requireWorkspace();
  if (role === "member") {
    return { ok: false, error: "Only owners and admins can revoke invites." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_invites")
    .delete()
    .eq("id", inviteId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false, error: "Could not revoke this invite." };
  }

  return { ok: true };
}

export async function acceptInvite(token: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("accept_organization_invite", {
    invite_token: token,
  });

  if (error || typeof data !== "string") {
    const message = error?.message ?? "";
    if (message.includes("invite_email_mismatch")) {
      return { ok: false as const, error: "mismatch" as const };
    }
    return { ok: false as const, error: "missing" as const };
  }

  await setActiveOrganization(data);
  redirect("/dashboard");
}
