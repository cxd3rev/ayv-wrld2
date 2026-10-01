"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "ayv_active_organization";

export async function getActiveOrganizationId() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setActiveOrganization(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, organizationId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
