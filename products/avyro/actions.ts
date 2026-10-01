"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { assertCanCreate } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";
import {
  applyLoyalty,
  ensureClient,
  getModuleSettings,
  noteActivity,
  reminderDate,
} from "@/services/journey";
import type { CheckIn, ModuleSettings } from "@/types/database";

const columns =
  "id, organization_id, client_id, served_on, check_in_on, status, reply_token, created_at, updated_at, clients(name, email, phone, visit_count, loyalty_status, churn_status)";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function listCheckIns(): Promise<CheckIn[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("check_ins")
    .select(columns)
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });
  return (data as CheckIn[] | null) ?? [];
}

export async function avyroSettings(): Promise<ModuleSettings> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  return getModuleSettings(supabase, organization.id, "avyro");
}

export async function saveAvyroSettings(formData: FormData) {
  const days = Number(text(formData.get("delayDays")));
  if (!Number.isInteger(days) || days < 0 || days > 60) {
    return { ok: false as const, error: "Choose a delay between 0 and 60 days." };
  }
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  await getModuleSettings(supabase, organization.id, "avyro");
  const { error } = await supabase
    .from("module_settings")
    .update({ check_in_delay_days: days })
    .eq("organization_id", organization.id)
    .eq("product", "avyro");
  if (error) return { ok: false as const, error: "Could not save these settings." };
  revalidatePath("/dashboard/avyro");
  return { ok: true as const, message: "Settings saved." };
}

export async function createCheckIn(formData: FormData) {
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  const phone = text(formData.get("phone"));
  const servedOn = text(formData.get("servedOn"));
  if (!name) return { ok: false as const, error: "Add the client's name." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(servedOn)) return { ok: false as const, error: "Add the date of the visit." };

  const { organization } = await requireWorkspace();
  const gate = await assertCanCreate(organization, "avyro");
  if (!gate.ok) return gate;

  const supabase = await createClient();
  const settings = await getModuleSettings(supabase, organization.id, "avyro");
  const loyalty = await getModuleSettings(supabase, organization.id, "orvyn");
  const clientId = await ensureClient(supabase, organization.id, { name, email, phone });
  if (!clientId) return { ok: false as const, error: "Could not save this client." };
  const noted = await noteActivity(supabase, clientId, servedOn, 1);
  await applyLoyalty(supabase, {
    organizationId: organization.id,
    clientId,
    name,
    email: email || null,
    phone: phone || null,
    visitCount: noted.visitCount,
    threshold: loyalty.loyalty_threshold,
    sendThankYou: loyalty.send_thank_you,
    organizationName: organization.name,
    origin: "avyro",
  });
  const { error } = await supabase.from("check_ins").insert({
    organization_id: organization.id,
    client_id: clientId,
    served_on: servedOn,
    check_in_on: reminderDate(servedOn, -settings.check_in_delay_days),
    status: "scheduled",
  });
  if (error) return { ok: false as const, error: "Could not add this check-in." };
  revalidatePath("/dashboard/avyro");
  revalidatePath("/dashboard/orvyn");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: "Check-in scheduled." };
}

export async function deleteCheckIn(id: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("check_ins").delete().eq("id", id).eq("organization_id", organization.id);
  if (error) return { ok: false as const, error: "Could not remove this check-in." };
  revalidatePath("/dashboard/avyro");
  return { ok: true as const, message: "Check-in removed." };
}
