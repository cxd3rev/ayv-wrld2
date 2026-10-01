"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { assertCanCreate } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";
import { ensureClient, flagChurn, getModuleSettings, noteActivity, reminderDate } from "@/services/journey";
import type { ModuleSettings, Renewal } from "@/types/database";

const columns =
  "id, organization_id, client_id, plan_name, renews_on, reminder_on, status, created_at, updated_at, clients(name, email, phone)";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function listRenewals(): Promise<Renewal[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase.from("renewals").select(columns).eq("organization_id", organization.id).order("renews_on", { ascending: true });
  return (data as Renewal[] | null) ?? [];
}

export async function veltoSettings(): Promise<ModuleSettings> {
  const { organization } = await requireWorkspace();
  return getModuleSettings(await createClient(), organization.id, "velto");
}

export async function saveVeltoSettings(formData: FormData) {
  const days = Number(text(formData.get("leadDays")));
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    return { ok: false as const, error: "Choose a lead time between 1 and 90 days." };
  }
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  await getModuleSettings(supabase, organization.id, "velto");
  const { error } = await supabase
    .from("module_settings")
    .update({ renewal_lead_days: days })
    .eq("organization_id", organization.id)
    .eq("product", "velto");
  if (error) return { ok: false as const, error: "Could not save these settings." };
  revalidatePath("/dashboard/velto");
  return { ok: true as const, message: "Settings saved." };
}

export async function createRenewal(formData: FormData) {
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  const phone = text(formData.get("phone"));
  const planName = text(formData.get("planName"));
  const renewsOn = text(formData.get("renewsOn"));
  if (!name || !planName) return { ok: false as const, error: "Add the client and the plan." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(renewsOn)) return { ok: false as const, error: "Add the renewal date." };
  const { organization } = await requireWorkspace();
  const gate = await assertCanCreate(organization, "velto");
  if (!gate.ok) return gate;
  const supabase = await createClient();
  const settings = await getModuleSettings(supabase, organization.id, "velto");
  const clientId = await ensureClient(supabase, organization.id, { name, email, phone });
  if (!clientId) return { ok: false as const, error: "Could not save this client." };
  const { error } = await supabase.from("renewals").insert({
    organization_id: organization.id,
    client_id: clientId,
    plan_name: planName,
    renews_on: renewsOn,
    reminder_on: reminderDate(renewsOn, settings.renewal_lead_days),
    status: "scheduled",
  });
  if (error) return { ok: false as const, error: "Could not add this renewal." };
  revalidatePath("/dashboard/velto");
  return { ok: true as const, message: "Renewal added." };
}

export async function confirmRenewal(id: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("renewals")
    .select("id, client_id, renews_on")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .maybeSingle();
  if (!data) return { ok: false as const, error: "Could not find this renewal." };
  await supabase.from("renewals").update({ status: "renewed" }).eq("id", id);
  await noteActivity(supabase, data.client_id, data.renews_on, 0);
  revalidatePath("/dashboard/velto");
  return { ok: true as const, message: "Renewal confirmed." };
}

export async function lapseRenewal(id: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("renewals")
    .select("id, client_id, renews_on, clients(name, email, phone)")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .maybeSingle();
  if (!data) return { ok: false as const, error: "Could not find this renewal." };
  const client = Array.isArray(data.clients) ? data.clients[0] : data.clients;
  await supabase.from("renewals").update({ status: "lapsed" }).eq("id", id);
  await flagChurn(supabase, {
    organizationId: organization.id,
    clientId: data.client_id,
    name: client?.name || "Client",
    email: client?.email ?? null,
    phone: client?.phone ?? null,
    lastActivityOn: data.renews_on,
    frequencyDays: 30,
    origin: "velto",
  });
  revalidatePath("/dashboard/velto");
  revalidatePath("/dashboard/rovyn");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: "Marked as lapsed and flagged in Rovyn." };
}

export async function deleteRenewal(id: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("renewals").delete().eq("id", id).eq("organization_id", organization.id);
  if (error) return { ok: false as const, error: "Could not remove this renewal." };
  revalidatePath("/dashboard/velto");
  return { ok: true as const, message: "Renewal removed." };
}
