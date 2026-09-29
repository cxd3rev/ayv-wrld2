import type { Metadata } from "next";
import { ProductWorkspacePage } from "@/components/product-workspace-page";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/ravelo" } };

export default function RaveloPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="ravelo" searchParams={searchParams} />;
}
