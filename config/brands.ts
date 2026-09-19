export const ayvBrand = {
  name: "AYV WRLD",
  icon: "/brands/ayv/mark-v2.webp",
  logo: "/brands/ayv/mark-v2.webp",
  nameMark: "/brands/ayv/mark-v2.webp",
} as const;

export const oneManArmyBrand = {
  name: "One Man Army Stack",
  logo: "/brands/one-man-army/mark-v2.webp",
} as const;

export const ratedBrand = {
  name: "Rated",
  logo: "/projects/rated/mark-v2.webp",
} as const;

export type BrandAssets = {
  icon: string;
  logo: string;
  name: string;
  hasWordmark: boolean;
};

export function productBrand(id: string): BrandAssets {
  const mark = `/brands/${id}/mark-v2.webp`;

  return {
    icon: mark,
    logo: mark,
    name: mark,
    hasWordmark: false,
  };
}
