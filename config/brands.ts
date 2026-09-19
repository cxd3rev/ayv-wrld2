export const ayvBrand = {
  name: "AYV WRLD",
  icon: "/brands/ayv/icon.png",
  logo: "/brands/ayv/logo.png",
  nameMark: "/brands/ayv/name.png",
} as const;

export const oneManArmyBrand = {
  name: "One Man Army Stack",
  logo: "/brands/one-man-army/logo.webp",
} as const;

export const ratedBrand = {
  name: "Rated",
  logo: "/projects/rated/logo.webp",
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
