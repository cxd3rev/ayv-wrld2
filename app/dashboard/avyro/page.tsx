import type { Metadata } from "next";
import { ProductWorkspacePage } from "@/components/product-workspace-page";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/avyro" } };

export default function AvyroPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="avyro" searchParams={searchParams} />;
}
