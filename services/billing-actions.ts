"use server";

import { requireWorkspace } from "@/lib/auth/session";
import { createBillingPortalSession, createCheckoutSession } from "@/services/billing";
import { redirect } from "next/navigation";

export async function startCheckout(priceId?: string) {
  const { organization } = await requireWorkspace();
  const result = await createCheckoutSession(organization, priceId);

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
