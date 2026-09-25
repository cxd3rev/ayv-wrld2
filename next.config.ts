import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  async redirects() {
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
