export type CategoryId =
  | "origins"
  | "qualities"
  | "ports"
  | "saleExecutives"
  | "cities"
  | "sectors"
  | "people"
  | "owners"
  | "dealingCompanies"
  | "indirectExpenses";

export const OPTION_CATEGORIES: {
  id: CategoryId;
  slug: string;
  label: string;
  description: string;
  placeholder: string;
  listPhrase?: string;
}[] = [
  {
    id: "origins",
    slug: "origins",
    label: "Origins",
    description: "",
    placeholder: "New origin, e.g. Indonesia",
  },
  {
    id: "qualities",
    slug: "qualities",
    label: "Qualities",
    description: "",
    placeholder: "New quality, e.g. 6000 GCV",
  },
  {
    id: "ports",
    slug: "ports",
    label: "Ports",
    description: "",
    placeholder: "New port, e.g. Haldia Port",
  },
  {
    id: "saleExecutives",
    slug: "sale-executives",
    label: "Sales executives",
    description: "",
    placeholder: "New sales executive",
  },
  {
    id: "cities",
    slug: "cities",
    label: "Cities",
    description: "",
    placeholder: "New city",
  },
  {
    id: "sectors",
    slug: "sectors",
    label: "Sectors",
    description: "",
    placeholder: "New sector, e.g. Steel",
  },
  {
    id: "people",
    slug: "team",
    label: "Team Members",
    description: "",
    placeholder: "New person",
  },
  {
    id: "owners",
    slug: "owners",
    label: "Admin",
    description: "People who can approve bills.",
    placeholder: "New name",
    listPhrase: "Admin",
  },
  {
    id: "dealingCompanies",
    slug: "dealing-companies",
    label: "Dealing company",
    description: "",
    placeholder: "New dealing company",
  },
  {
    id: "indirectExpenses",
    slug: "indirect-expenses",
    label: "Indirect Expenses",
    description: "",
    placeholder: "New indirect expense",
  },
];

export const USER_MENU_CATEGORY_IDS = ["people", "owners"] as const satisfies readonly CategoryId[];

const userMenuCategoryIdSet = new Set<CategoryId>(USER_MENU_CATEGORY_IDS);

export const USER_MENU_CATEGORIES = OPTION_CATEGORIES.filter((category) =>
  userMenuCategoryIdSet.has(category.id),
);

/** Option lists under Masters → Options (excludes Team/Admin in Users menu). */
export const MASTER_OPTION_CATEGORIES = OPTION_CATEGORIES.filter(
  (category) => !userMenuCategoryIdSet.has(category.id),
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
  const key = slug.trim().toLowerCase();
  if (key === "people") return "people";
  return categoryBySlug.get(key) ?? null;
}

export function categoryMeta(categoryId: CategoryId) {
  return (
    OPTION_CATEGORIES.find((category) => category.id === categoryId) ??
    OPTION_CATEGORIES[0]
  );
}
