"use server";

import { redirect } from "next/navigation";
import { getProduct, type ProductId } from "@/config/products";
import { setActiveProductId } from "@/lib/product-cookie";

export async function switchProduct(productId: ProductId) {
  await setActiveProductId(productId);
}

export async function openProductWorkspace(formData: FormData) {
  const product = getProduct(String(formData.get("productId") ?? ""));
  if (!product || product.status !== "active") {
    redirect("/dashboard");
  }

  await setActiveProductId(product.id);
  redirect("/dashboard/product");
}

/** Switch the product cookie, then open that workspace, optionally focused on a linked record. */
export async function openLinkedWorkspace(
  productId: ProductId,
  query: Record<string, string> = {},
) {
  const product = getProduct(productId);
  if (!product || product.status !== "active") {
    redirect("/dashboard");
  }

  await setActiveProductId(product.id);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const search = params.toString();
  redirect(search ? `/dashboard/product?${search}` : "/dashboard/product");
}
