import { ProductWorkspacePage } from "@/components/product-workspace-page";

export default function AvyroPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductWorkspacePage productId="avyro" searchParams={searchParams} />;
}
