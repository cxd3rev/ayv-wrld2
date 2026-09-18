import { ProductWorkspacePage } from "@/components/product-workspace-page";

export default function VeltoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="velto" searchParams={searchParams} />;
}
