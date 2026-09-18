import { ProductWorkspacePage } from "@/components/product-workspace-page";

export default function RovynPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="rovyn" searchParams={searchParams} />;
}
