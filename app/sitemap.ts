import { legacyModulesEnabled } from "@/config/features";
import { products } from "@/config/products";
import { PRODUCT_URL } from "@/config/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = legacyModulesEnabled
    ? ["", "/automation", "/automation/stack", ...products.map((product) => product.marketingRoute)]
    : ["", "/login", "/signup", "/privacy", "/terms"];

  return routes.map((route) => ({
    url: `${PRODUCT_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
