import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const legacyModules = process.env.NEXT_PUBLIC_LEGACY_MODULES === "true";

const nextConfig: NextConfig = {
  async redirects() {
    if (!legacyModules) {
      return [
        { source: "/products", destination: "/", permanent: true },
        { source: "/products/:slug", destination: "/", permanent: true },
        { source: "/automation", destination: "/", permanent: true },
        { source: "/automation/:path*", destination: "/", permanent: true },
        { source: "/projects", destination: "/", permanent: true },
        { source: "/projects/:slug", destination: "/", permanent: true },
        { source: "/one-man-army", destination: "/", permanent: true },
        { source: "/about", destination: "/", permanent: true },
      ];
    }
    return [
      {
        source: "/products/:slug",
        destination: "/automation/:slug",
        permanent: true,
      },
      { source: "/projects", destination: "/", permanent: true },
      { source: "/projects/:slug", destination: "/", permanent: true },
      { source: "/one-man-army", destination: "/", permanent: true },
      { source: "/about", destination: "/#contact", permanent: true },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
