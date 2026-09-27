import { ProductWorkspacePage } from "@/components/product-workspace-page";

export default function RaveloPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="ravelo" searchParams={searchParams} />;
}
