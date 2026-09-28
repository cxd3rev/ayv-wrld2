import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/auth/session";
import { isCheckoutProductId, isBillableProductId, type BillableProductId } from "@/lib/stripe-catalog";
import { createCheckoutSession } from "@/services/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const workspace = await getWorkspace();
  if (!workspace?.userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!workspace.organization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let product = "";
  let modules: string[] = [];
  try {
    const body = (await request.json()) as { product?: unknown; modules?: unknown };
    product = typeof body.product === "string" ? body.product : "";
    modules = Array.isArray(body.modules) ? body.modules.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!isCheckoutProductId(product)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  const selected = modules.filter((item): item is BillableProductId => isBillableProductId(item));
  const result = await createCheckoutSession(workspace.organization, product, selected);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ url: result.url });
}
