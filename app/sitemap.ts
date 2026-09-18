import { products } from "@/config/products";
import { projects } from "@/config/public-site";
import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/projects",
    ...projects.map((project) => project.route),
    "/one-man-army",
    "/automation",
    "/automation/stack",
    ...products.map((product) => product.marketingRoute),
    "/about",
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.split("/").length === 2 ? 0.8 : 0.7,
  }));
}
