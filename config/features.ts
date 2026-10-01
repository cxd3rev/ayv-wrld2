/**
 * The six automation modules stay in the repo.
 * They are off unless this is exactly "true".
 */
export const legacyModulesEnabled = process.env.NEXT_PUBLIC_LEGACY_MODULES === "true";

const LEGACY_PREFIXES = [
  "/dashboard/avyro",
  "/dashboard/velto",
  "/dashboard/rovyn",
  "/dashboard/orvyn",
  "/dashboard/nexro",
  "/dashboard/ravelo",
  "/dashboard/product",
  "/automation",
  "/products",
];

export function isLegacyModulePath(pathname: string) {
  return LEGACY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
