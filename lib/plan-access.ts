import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isPaidStatus } from "@/lib/billing-status";
import { BILLABLE_PRODUCTS, isBillableProductId, type BillableProductId } from "@/lib/stripe-catalog";
import { getOrganizationSubscriptions } from "@/services/billing";
import type { Organization } from "@/types/database";

const CONTACT_TABLES = ["check_ins", "renewals", "churn_watches", "loyalty_records", "reactivations", "reviews"] as const;

export async function getPlanAccess(organization: Organization) {
  const subscriptions = await getOrganizationSubscriptions(organization.id);
  const paid = subscriptions.filter((item) => item.product_slug && isPaidStatus(item.status));
  const fullStack = paid.some((item) => item.product_slug === "full_stack");
  const growth = paid.some((item) => item.product_slug === "growth");
  const purchased = new Set(
    paid.flatMap((item) => (item.product_slug && isBillableProductId(item.product_slug) ? [item.product_slug] : [])),
  );

  const growthModules = new Set<BillableProductId>();
  if (growth) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("organization_products")
      .select("enabled, products(slug)")
      .eq("organization_id", organization.id);
    for (const row of data ?? []) {
      const related = Array.isArray(row.products) ? row.products[0] : row.products;
      const slug = related && typeof related === "object" && "slug" in related ? String(related.slug) : "";
      if (row.enabled && isBillableProductId(slug)) growthModules.add(slug);
    }
  }

  const trial = paid.some((item) => item.status === "trialing");
  const contactLimit = fullStack ? null : growth ? 1000 : 200;

  function canUse(product: BillableProductId) {
    if (fullStack || purchased.has(product)) return true;
    return growth && growthModules.has(product);
  }

  return { trial, fullStack, growth, contactLimit, canUse };
}

export async function assertCanCreate(organization: Organization, product: BillableProductId) {
  const access = await getPlanAccess(organization);
  if (!access.canUse(product)) {
    return { ok: false as const, error: "Add a card to start the 7-day trial." };
  }
  if (access.contactLimit == null) return { ok: true as const };

  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const counts = await Promise.all(
    CONTACT_TABLES.map(async (table) => {
      const { count } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .gte("created_at", monthStart.toISOString());
      return count ?? 0;
    }),
  );
  const used = counts.reduce((sum, count) => sum + count, 0);
  if (used >= access.contactLimit) {
    return {
      ok: false as const,
      error: `This plan includes ${access.contactLimit} new contacts per month.`,
    };
  }
  return { ok: true as const };
}

export const sellableProducts = BILLABLE_PRODUCTS;
