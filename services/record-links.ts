"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import {
  getRecordEntity,
  isRecordProduct,
  type RecordProduct,
} from "@/lib/record-entities";
import { createClient } from "@/lib/supabase/server";
import {
  attachRecordLinkSchema,
  deleteRecordLinkSchema,
  firstZodError,
  optionalRecordLinkSchema,
} from "@/lib/validations";
import type { RecordLink } from "@/types/database";

const linkColumns =
  "id, organization_id, from_product, from_id, to_product, to_id, created_at";

async function assertRecordInOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  product: RecordProduct,
  recordId: string,
) {
  const entity = getRecordEntity(product);
  if (!entity) {
    return { ok: false as const, error: "That product cannot be connected yet." };
  }

  const { data } = await supabase
    .from(entity.table)
    .select("id")
    .eq("id", recordId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) {
    return { ok: false as const, error: "That record is not in this workspace." };
  }

  return { ok: true as const };
}

export async function listRecordLinks(): Promise<RecordLink[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("record_links")
    .select(linkColumns)
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as RecordLink[] | null) ?? [];
}

export async function createRecordLink(
  fromProduct: RecordProduct,
  fromId: string,
  toProduct: RecordProduct,
  toId: string,
) {
  if (fromProduct === toProduct && fromId === toId) {
    return { ok: false as const, error: "Choose a different record to connect." };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const fromCheck = await assertRecordInOrg(supabase, organization.id, fromProduct, fromId);
  if (!fromCheck.ok) return fromCheck;
  const toCheck = await assertRecordInOrg(supabase, organization.id, toProduct, toId);
  if (!toCheck.ok) return toCheck;

  const { error } = await supabase.from("record_links").insert({
    organization_id: organization.id,
    from_product: fromProduct,
    from_id: fromId,
    to_product: toProduct,
    to_id: toId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true as const, message: "Already connected." };
    }
    if (error.code === "23514") {
      return { ok: false as const, error: "Those records must belong to the same workspace." };
    }
    return { ok: false as const, error: "Could not connect those records." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true as const, message: "Records connected." };
}

export async function createRecordLinkFromForm(formData: FormData) {
  const parsed = attachRecordLinkSchema.safeParse({
    fromProduct: formData.get("fromProduct"),
    fromId: formData.get("fromId"),
    toProduct: formData.get("toProduct"),
    toId: formData.get("toId"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: firstZodError(parsed.error) };
  }

  return createRecordLink(
    parsed.data.fromProduct,
    parsed.data.fromId,
    parsed.data.toProduct,
    parsed.data.toId,
  );
}

export async function deleteRecordLink(linkId: string) {
  const parsed = deleteRecordLinkSchema.safeParse({ linkId });
  if (!parsed.success) {
    return { ok: false as const, error: firstZodError(parsed.error) };
  }

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("record_links")
    .delete()
    .eq("id", parsed.data.linkId)
    .eq("organization_id", organization.id);

  if (error) {
    return { ok: false as const, error: "Could not unlink those records." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true as const, message: "Connection removed." };
}

export async function linkCreatedRecord(
  formData: FormData,
  createdProduct: RecordProduct,
  createdId: string,
) {
  const parsed = optionalRecordLinkSchema.safeParse({
    linkProduct: formData.get("linkProduct"),
    linkId: formData.get("linkId"),
  });

  if (!parsed.success || !parsed.data.linkProduct || !parsed.data.linkId) {
    return { ok: true as const };
  }

  if (!isRecordProduct(parsed.data.linkProduct)) {
    return { ok: false as const, error: "That product cannot be connected yet." };
  }

  return createRecordLink(
    createdProduct,
    createdId,
    parsed.data.linkProduct,
    parsed.data.linkId,
  );
}
