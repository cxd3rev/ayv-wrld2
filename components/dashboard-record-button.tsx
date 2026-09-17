"use client";

import { openLinkedWorkspace } from "@/services/product-switch";
import type { RecordProduct } from "@/types/database";
import { ArrowUpRight } from "lucide-react";

const focusParams: Record<RecordProduct, string> = {
  avyro: "lead",
  velto: "booking",
  rovyn: "quote",
  orvyn: "invoice",
};

export function DashboardRecordButton({
  product,
  recordId,
  children,
}: {
  product: RecordProduct;
  recordId: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => openLinkedWorkspace(product, { [focusParams[product]]: recordId })}
      className="inline-flex items-center gap-1 text-left text-sm font-medium hover:text-accent"
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </button>
  );
}
