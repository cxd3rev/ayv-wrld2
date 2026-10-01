import { legacyModulesEnabled } from "@/config/features";
import { PRODUCT_URL } from "@/config/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: legacyModulesEnabled ? ["/", "/automation/"] : ["/"],
        disallow: legacyModulesEnabled
          ? ["/api/", "/dashboard/", "/onboarding", "/auth/", "/settings/"]
          : ["/api/", "/dashboard/", "/onboarding", "/auth/", "/automation", "/products", "/projects", "/about", "/one-man-army"],
      },
    ],
    sitemap: `${PRODUCT_URL}/sitemap.xml`,
    host: PRODUCT_URL,
  };
}
