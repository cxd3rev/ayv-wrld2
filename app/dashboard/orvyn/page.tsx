import { ProductWorkspacePage } from "@/components/product-workspace-page";

export default function OrvynPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="orvyn" searchParams={searchParams} />;
}
