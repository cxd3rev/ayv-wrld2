export const ayvBrand = {
  name: "AYV WRLD",
  icon: "/brands/ayv/icon.png",
  logo: "/brands/ayv/logo.png",
  nameMark: "/brands/ayv/name.png",
} as const;

export type BrandAssets = {
  icon: string;
  logo: string;
  name: string;
  hasWordmark: boolean;
};

export function productBrand(id: string, hasWordmark = false): BrandAssets {
  return {
    icon: `/brands/${id}/icon.png`,
    logo: `/brands/${id}/logo.png`,
    name: `/brands/${id}/name.png`,
    hasWordmark,
  };
}
