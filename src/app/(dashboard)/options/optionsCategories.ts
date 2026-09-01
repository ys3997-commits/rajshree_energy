export type CategoryId =
  | "origins"
  | "qualities"
  | "ports"
  | "saleExecutives"
  | "cities"
  | "sectors"
  | "people"
  | "owners"
  | "dealingCompanies";

export const OPTION_CATEGORIES: {
  id: CategoryId;
  slug: string;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    id: "origins",
    slug: "origins",
    label: "Origins",
    description: "Coal source regions used in quality classes.",
    placeholder: "New origin, e.g. Indonesia",
  },
  {
    id: "qualities",
    slug: "qualities",
    label: "Qualities",
    description: "Grade names used in quality classes.",
    placeholder: "New quality, e.g. 6000 GCV",
  },
  {
    id: "ports",
    slug: "ports",
    label: "Ports",
    description: "Port name and GST state for vessels and orders.",
    placeholder: "New port, e.g. Haldia Port",
  },
  {
    id: "saleExecutives",
    slug: "sale-executives",
    label: "Sales executives",
    description: "Suggested names on customer records.",
    placeholder: "New sales executive",
  },
  {
    id: "cities",
    slug: "cities",
    label: "Cities",
    description: "Suggested cities and states on customers and transporters.",
    placeholder: "New city",
  },
  {
    id: "sectors",
    slug: "sectors",
    label: "Sectors",
    description: "Industry sectors suggested on customers.",
    placeholder: "New sector, e.g. Steel",
  },
  {
    id: "people",
    slug: "team",
    label: "Team",
    description: "Desk people, login passwords, and page access.",
    placeholder: "New person",
  },
  {
    id: "owners",
    slug: "owners",
    label: "Owner",
    description: "Suggested owner names on customers and transporters.",
    placeholder: "New owner",
  },
  {
    id: "dealingCompanies",
    slug: "dealing-companies",
    label: "Dealing company",
    description: "Companies you deal with, suggested across the app.",
    placeholder: "New dealing company",
  },
];

export const USER_MENU_CATEGORY_IDS = ["people", "owners"] as const satisfies readonly CategoryId[];

const userMenuCategoryIdSet = new Set<CategoryId>(USER_MENU_CATEGORY_IDS);

export const USER_MENU_CATEGORIES = OPTION_CATEGORIES.filter((category) =>
  userMenuCategoryIdSet.has(category.id),
);

const slugById = new Map(
  OPTION_CATEGORIES.map((category) => [category.id, category.slug]),
);
const categoryBySlug = new Map(
  OPTION_CATEGORIES.map((category) => [category.slug, category.id]),
);

export function optionsHref(categoryId: CategoryId): string {
  const slug = slugById.get(categoryId);
  return slug ? `/options/${slug}` : "/options";
}

export function categoryFromSlug(slug: string): CategoryId | null {
  return categoryBySlug.get(slug) ?? null;
}

export function categoryMeta(categoryId: CategoryId) {
  return (
    OPTION_CATEGORIES.find((category) => category.id === categoryId) ??
    OPTION_CATEGORIES[0]
  );
}
