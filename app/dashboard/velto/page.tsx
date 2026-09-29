import type { Metadata } from "next";
import { ProductWorkspacePage } from "@/components/product-workspace-page";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/velto" } };

export default function VeltoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="velto" searchParams={searchParams} />;
}
