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
