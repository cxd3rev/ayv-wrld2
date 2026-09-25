export const ayvBrand = {
  name: "AYV WRLD",
  icon: "/brands/ayv/mark-transparent-v3.webp",
  logo: "/brands/ayv/mark-transparent-v3.webp",
  nameMark: "/brands/ayv/mark-transparent-v3.webp",
  automationParentMark: "/brands/ayv/parent-mark-dark-v1.webp",
} as const;

export const oneManArmyBrand = {
  name: "One Man Army Stack",
  logo: "/brands/one-man-army/mark-transparent-v3.webp",
} as const;

export const kleuroBrand = {
  name: "Kleuro",
  logo: "/projects/kleuro/mark-transparent-v3.webp",
} as const;

export const ratedBrand = {
  name: "Rated",
  logo: "/projects/rated/mark-transparent-v3.webp",
} as const;

export const kleuroBrand = {
  name: "Kleuro",
  logo: "/brands/kleuro-logo.png",
} as const;

export type BrandAssets = {
  icon: string;
  logo: string;
  name: string;
  hasWordmark: boolean;
};

export function productBrand(id: string): BrandAssets {
  const mark = `/brands/${id}/mark-transparent-v3.webp`;

  return {
    icon: mark,
    logo: mark,
    name: mark,
    hasWordmark: false,
  };
}
