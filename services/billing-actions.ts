"use server";

import { requireWorkspace } from "@/lib/auth/session";
import { isBillableProductId } from "@/lib/stripe-catalog";
import { createBillingPortalSession, createCheckoutSession } from "@/services/billing";
import { redirect } from "next/navigation";

export async function startCheckout(product: string) {
  if (!isBillableProductId(product)) {
    return { ok: false as const, error: "Unknown product." };
  }

  const { organization } = await requireWorkspace();
  const result = await createCheckoutSession(organization, product);

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
