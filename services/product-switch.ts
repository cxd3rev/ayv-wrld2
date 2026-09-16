"use server";

import { setActiveProductId } from "@/lib/product-cookie";
import type { ProductId } from "@/config/products";

export async function switchProduct(productId: ProductId) {
  await setActiveProductId(productId);
}
