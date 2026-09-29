import type { Metadata } from "next";
import { ProductWorkspacePage } from "@/components/product-workspace-page";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/orvyn" } };

export default function OrvynPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="orvyn" searchParams={searchParams} />;
}
