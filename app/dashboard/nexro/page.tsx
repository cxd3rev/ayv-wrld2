import { ProductWorkspacePage } from "@/components/product-workspace-page";

export default function NexroPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="nexro" searchParams={searchParams} />;
}
