"use server";

import { cookies } from "next/headers";
import { defaultProductId, getProduct, type ProductId } from "@/config/products";

const COOKIE_NAME = "ayv_active_product";

export async function getActiveProductId(): Promise<ProductId> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  return getProduct(value ?? "")?.id ?? defaultProductId;
}

export async function setActiveProductId(productId: ProductId) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, productId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
