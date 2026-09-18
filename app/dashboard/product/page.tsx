import { getProduct } from "@/config/products";
import { getActiveProductId } from "@/lib/product-cookie";
import { redirect } from "next/navigation";

export default async function ProductDashboardPage({
  searchParams,
}: PageProps<"/dashboard/product">) {
  const productId = await getActiveProductId();
  const product = getProduct(productId);
  const params = await searchParams;
  const target = product?.status === "active" ? product.route : "/dashboard";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : value ? [value] : []) query.append(key, item);
  }
  redirect(query.size ? `${target}?${query}` : target);
}
