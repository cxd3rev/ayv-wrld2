import type { Metadata } from "next";
import { ProductWorkspacePage } from "@/components/product-workspace-page";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/rovyn" } };

export default function RovynPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="rovyn" searchParams={searchParams} />;
}
