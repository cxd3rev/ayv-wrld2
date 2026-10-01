"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { assertCanCreate } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";
import { applyLoyalty, ensureClient, getModuleSettings } from "@/services/journey";
import type { LoyaltyRecord, ModuleSettings } from "@/types/database";

const columns =
  "id, organization_id, client_id, visit_count, status, origin, thank_you_on, created_at, updated_at, clients(name, email, phone)";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function listLoyalty(): Promise<LoyaltyRecord[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase.from("loyalty_records").select(columns).eq("organization_id", organization.id).order("visit_count", { ascending: false });
  return (data as LoyaltyRecord[] | null) ?? [];
}

export async function orvynSettings(): Promise<ModuleSettings> {
  const { organization } = await requireWorkspace();
  return getModuleSettings(await createClient(), organization.id, "orvyn");
}

export async function saveOrvynSettings(formData: FormData) {
  const threshold = Number(text(formData.get("threshold")));
  const sendThankYou = formData.get("sendThankYou") === "on";
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 100) {
    return { ok: false as const, error: "Choose a threshold between 1 and 100." };
  }
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  await getModuleSettings(supabase, organization.id, "orvyn");
  const { error } = await supabase
    .from("module_settings")
    .update({ loyalty_threshold: threshold, send_thank_you: sendThankYou })
    .eq("organization_id", organization.id)
    .eq("product", "orvyn");
  if (error) return { ok: false as const, error: "Could not save these settings." };
  revalidatePath("/dashboard/orvyn");
  return { ok: true as const, message: "Settings saved." };
}

export async function saveLoyalty(formData: FormData) {
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  const phone = text(formData.get("phone"));
  const visitCount = Number(text(formData.get("visitCount")));
  if (!name) return { ok: false as const, error: "Add the client's name." };
  if (!Number.isInteger(visitCount) || visitCount < 0) return { ok: false as const, error: "Add a visit count." };
  const { organization } = await requireWorkspace();
  const gate = await assertCanCreate(organization, "orvyn");
  if (!gate.ok) return gate;
  const supabase = await createClient();
  const settings = await getModuleSettings(supabase, organization.id, "orvyn");
  const clientId = await ensureClient(supabase, organization.id, { name, email, phone });
  if (!clientId) return { ok: false as const, error: "Could not save this client." };
  const loyal = await applyLoyalty(supabase, {
    organizationId: organization.id,
    clientId,
    name,
    email: email || null,
    phone: phone || null,
    visitCount,
    threshold: settings.loyalty_threshold,
    sendThankYou: settings.send_thank_you,
    organizationName: organization.name,
    origin: "manual",
  });
  revalidatePath("/dashboard/orvyn");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: loyal ? "Marked loyal and a Nexro referral was created." : "Visit count saved." };
}

export async function deleteLoyalty(id: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("loyalty_records").delete().eq("id", id).eq("organization_id", organization.id);
  if (error) return { ok: false as const, error: "Could not remove this client." };
  revalidatePath("/dashboard/orvyn");
  return { ok: true as const, message: "Removed." };
}
