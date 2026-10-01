"use server";

import { revalidatePath } from "next/cache";
import { localDateOnly } from "@/lib/calendar";
import { requireWorkspace } from "@/lib/auth/session";
import { assertCanCreate } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";
import { ensureClient, flagChurn, getModuleSettings, isQuiet } from "@/services/journey";
import type { ChurnWatch, ModuleSettings } from "@/types/database";

const columns =
  "id, organization_id, client_id, frequency_days, last_activity_on, status, origin, created_at, updated_at, clients(name, email, phone)";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function listChurnWatches(): Promise<ChurnWatch[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase.from("churn_watches").select(columns).eq("organization_id", organization.id).order("updated_at", { ascending: false });
  return (data as ChurnWatch[] | null) ?? [];
}

export async function rovynSettings(): Promise<ModuleSettings> {
  const { organization } = await requireWorkspace();
  return getModuleSettings(await createClient(), organization.id, "rovyn");
}

export async function saveRovynSettings(formData: FormData) {
  const days = Number(text(formData.get("marginDays")));
  if (!Number.isInteger(days) || days < 0 || days > 180) {
    return { ok: false as const, error: "Choose a margin between 0 and 180 days." };
  }
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  await getModuleSettings(supabase, organization.id, "rovyn");
  const { error } = await supabase
    .from("module_settings")
    .update({ churn_margin_days: days })
    .eq("organization_id", organization.id)
    .eq("product", "rovyn");
  if (error) return { ok: false as const, error: "Could not save these settings." };
  revalidatePath("/dashboard/rovyn");
  return { ok: true as const, message: "Settings saved." };
}

export async function createChurnWatch(formData: FormData) {
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  const phone = text(formData.get("phone"));
  const frequency = Number(text(formData.get("frequencyDays")));
  const lastActivity = text(formData.get("lastActivityOn"));
  if (!name) return { ok: false as const, error: "Add the client's name." };
  if (!Number.isInteger(frequency) || frequency < 1 || frequency > 365) {
    return { ok: false as const, error: "Add how many days usually pass between visits." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastActivity)) return { ok: false as const, error: "Add the last visit or purchase date." };
  const { organization } = await requireWorkspace();
  const gate = await assertCanCreate(organization, "rovyn");
  if (!gate.ok) return gate;
  const supabase = await createClient();
  const settings = await getModuleSettings(supabase, organization.id, "rovyn");
  const clientId = await ensureClient(supabase, organization.id, { name, email, phone });
  if (!clientId) return { ok: false as const, error: "Could not save this client." };
  await supabase.from("clients").update({ last_activity_on: lastActivity }).eq("id", clientId);
  const quiet = isQuiet(lastActivity, frequency, settings.churn_margin_days, localDateOnly());
  if (quiet) {
    await flagChurn(supabase, {
      organizationId: organization.id,
      clientId,
      name,
      email: email || null,
      phone: phone || null,
      lastActivityOn: lastActivity,
      frequencyDays: frequency,
      origin: "manual",
    });
  } else {
    const { data: existing } = await supabase
      .from("churn_watches")
      .select("id")
      .eq("organization_id", organization.id)
      .eq("client_id", clientId)
      .maybeSingle();
    if (existing?.id) {
      await supabase
        .from("churn_watches")
        .update({ frequency_days: frequency, last_activity_on: lastActivity, status: "watching" })
        .eq("id", existing.id);
    } else {
      await supabase.from("churn_watches").insert({
        organization_id: organization.id,
        client_id: clientId,
        frequency_days: frequency,
        last_activity_on: lastActivity,
        status: "watching",
        origin: "manual",
      });
    }
    await supabase.from("clients").update({ churn_status: "none" }).eq("id", clientId);
  }
  revalidatePath("/dashboard/rovyn");
  revalidatePath("/dashboard/nexro");
  return { ok: true as const, message: quiet ? "Client flagged and a Nexro win-back was created." : "Client is being watched." };
}

export async function deleteChurnWatch(id: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("churn_watches").delete().eq("id", id).eq("organization_id", organization.id);
  if (error) return { ok: false as const, error: "Could not remove this client." };
  revalidatePath("/dashboard/rovyn");
  return { ok: true as const, message: "Removed." };
}
