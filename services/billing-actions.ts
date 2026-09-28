"use server";

import { requireWorkspace } from "@/lib/auth/session";
import { isBillableProductId, isCheckoutProductId, type BillableProductId } from "@/lib/stripe-catalog";
import { createBillingPortalSession, createCheckoutSession } from "@/services/billing";
import { redirect } from "next/navigation";

export async function startCheckout(product: string, modules: string[] = []) {
  if (!isCheckoutProductId(product)) {
    return { ok: false as const, error: "Unknown product." };
  }

  const { organization } = await requireWorkspace();
  const selected = modules.filter((item): item is BillableProductId => isBillableProductId(item));
  const result = await createCheckoutSession(organization, product, selected);

  if (!result.ok) {
    return result;
  }

  redirect(result.url);
}

export async function openBillingPortal() {
  const { organization } = await requireWorkspace();
  const result = await createBillingPortalSession(organization);

  if (!result.ok) {
    return result;
  }

  redirect(result.url);
}
