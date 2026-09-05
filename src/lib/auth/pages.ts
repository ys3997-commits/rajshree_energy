import {
  MASTER_OPTION_CATEGORIES,
  optionsHref,
} from "@/app/(dashboard)/options/optionsCategories";

export type PageGroup = "Pages" | "Reports";

export type AppPage = {
  key: string;
  href: string;
  label: string;
  group: PageGroup;
  /** Owner-only. Never granted to staff. */
  ownerOnly?: boolean;
  /** Shown under Update on the Team access page, not as a top-level row. */
  updateSubPage?: boolean;
  /** Shown under Bank on the Team access page, not as a top-level row. */
  bankSubPage?: boolean;
  /** Shown under Master on the Team access page, not as a top-level row. */
  masterSubPage?: boolean;
  /** Shown under Master → Options on the Team access page. */
  masterOptionsSubPage?: boolean;
  /** Shown under Reports on the Team access page, not as a top-level row. */
  reportSubPage?: boolean;
};

export const LEGACY_UPDATE_PAGE_KEY = "update";
export const LEGACY_BANK_PAGE_KEY = "payments";
export const LEGACY_OPTIONS_PAGE_KEY = "options";

export const UPDATE_SUB_PAGES = [
  {
    key: "update-purchase",
    href: "/update/purchase",
    label: "Purchases",
    group: "Pages" as const,
    updateSubPage: true,
  },
  {
    key: "update-sale",
    href: "/update/sale",
    label: "Sales",
    group: "Pages" as const,
    updateSubPage: true,
  },
  {
    key: "update-transport",
    href: "/update/transport",
    label: "Transport",
    group: "Pages" as const,
    updateSubPage: true,
  },
] satisfies AppPage[];

export const UPDATE_SUB_PAGE_KEYS = UPDATE_SUB_PAGES.map((page) => page.key);

export const BANK_SUB_PAGES = [
  {
    key: "payments-transactions",
    href: "/payments",
    label: "Transactions",
    group: "Pages" as const,
    bankSubPage: true,
  },
  {
    key: "payments-discount",
    href: "/payments/discount",
    label: "Discount",
    group: "Pages" as const,
    bankSubPage: true,
  },
] satisfies AppPage[];

export const BANK_SUB_PAGE_KEYS = BANK_SUB_PAGES.map((page) => page.key);

export const MASTER_SUB_PAGES = [
  {
    key: "vessels",
    href: "/vessels",
    label: "Vessels",
    group: "Pages" as const,
    masterSubPage: true,
  },
  {
    key: "customers",
    href: "/customers",
    label: "Customers",
    group: "Pages" as const,
    masterSubPage: true,
  },
  {
    key: "qualities",
    href: "/qualities",
    label: "Qualities",
    group: "Pages" as const,
    masterSubPage: true,
  },
  {
    key: "transporters",
    href: "/transporters",
    label: "Transporters",
    group: "Pages" as const,
    masterSubPage: true,
  },
] satisfies AppPage[];

export const MASTER_SUB_PAGE_KEYS = MASTER_SUB_PAGES.map((page) => page.key);

export const MASTER_OPTIONS_SUB_PAGES = MASTER_OPTION_CATEGORIES.map(
  (category) => ({
    key: `options-${category.slug}`,
    href: optionsHref(category.id),
    label: category.label,
    group: "Pages" as const,
    masterOptionsSubPage: true,
  }),
) satisfies AppPage[];

export const MASTER_OPTIONS_SUB_PAGE_KEYS = MASTER_OPTIONS_SUB_PAGES.map(
  (page) => page.key,
);

export const MASTER_ALL_SUB_PAGE_KEYS = [
  ...MASTER_SUB_PAGE_KEYS,
  ...MASTER_OPTIONS_SUB_PAGE_KEYS,
];

export const MASTER_OPTIONS_GROUP = {
  id: "options",
  label: "Options",
  pages: MASTER_OPTIONS_SUB_PAGES.map((page) => ({
    key: page.key,
    label: page.label,
  })),
};

export const REPORT_SUB_PAGES = [
  {
    key: "reports-collection",
    href: "/reports/collection",
    label: "Collection Engine",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-collection-vendor",
    href: "/reports/collection/vendor",
    label: "Vendor Collection",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-ageing",
    href: "/reports/ageing-report",
    label: "Ageing Report",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-customer-analysis",
    href: "/reports/customer-analysis",
    label: "Customer Analysis",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-profit-analysis",
    href: "/reports/profit-analysis",
    label: "Profit Analysis",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-sale-analysis",
    href: "/reports/analysis",
    label: "Sale Analysis",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-vendor-analysis",
    href: "/reports/vendor-analysis",
    label: "Vendor Analysis",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-ledger",
    href: "/reports/ledger",
    label: "Ledger",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-dispatch",
    href: "/reports/master-dispatch",
    label: "Dispatch",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-quality",
    href: "/reports/product",
    label: "Quality Report",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-purchase",
    href: "/reports/purchase",
    label: "Purchase",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-sales-engine",
    href: "/reports/sales",
    label: "Sales Engine Report",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-transport-engine",
    href: "/reports/transport",
    label: "Transport Engine Report",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-transport-due",
    href: "/reports/transport/due",
    label: "Transport Due",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-transport-ledger",
    href: "/reports/transport/ledger",
    label: "Ledger",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-vessel",
    href: "/reports/vessel",
    label: "Vessel Report",
    group: "Reports" as const,
    reportSubPage: true,
  },
  {
    key: "reports-vessel-supplied",
    href: "/reports/vessel/supplied",
    label: "Vessel Supplied",
    group: "Reports" as const,
    reportSubPage: true,
  },
] satisfies AppPage[];

export const REPORT_SUB_PAGE_KEYS = REPORT_SUB_PAGES.map((page) => page.key);

export type ReportAccessPage = { key: string; label: string };

export type ReportAccessGroup = {
  id: string;
  label: string;
  pages: ReportAccessPage[];
};

export type ReportAccessItem =
  | { kind: "group"; id: string; label: string; pages: ReportAccessPage[] }
  | { kind: "leaf"; key: string; label: string };

export const REPORT_ACCESS_GROUPS: ReportAccessGroup[] = [
  {
    id: "analysis",
    label: "Analysis",
    pages: [
      { key: "reports-ageing", label: "Ageing Report" },
      { key: "reports-customer-analysis", label: "Customer Analysis" },
      { key: "reports-profit-analysis", label: "Profit Analysis" },
      { key: "reports-sale-analysis", label: "Sale Analysis" },
      { key: "reports-vendor-analysis", label: "Vendor Analysis" },
    ],
  },
  {
    id: "collection",
    label: "Collection",
    pages: [
      { key: "reports-collection", label: "Collection Engine" },
      { key: "reports-collection-vendor", label: "Vendor Collection" },
    ],
  },
  {
    id: "customer",
    label: "Customer",
    pages: [{ key: "reports-ledger", label: "Ledger" }],
  },
  {
    id: "product",
    label: "Product",
    pages: [{ key: "reports-quality", label: "Quality Report" }],
  },
  {
    id: "sales",
    label: "Sales",
    pages: [{ key: "reports-sales-engine", label: "Sales Engine Report" }],
  },
  {
    id: "transport",
    label: "Transport",
    pages: [
      { key: "reports-transport-engine", label: "Transport Engine Report" },
      { key: "reports-transport-due", label: "Transport Due" },
      { key: "reports-transport-ledger", label: "Ledger" },
    ],
  },
  {
    id: "vessel",
    label: "Vessel",
    pages: [
      { key: "reports-vessel", label: "Vessel Report" },
      { key: "reports-vessel-supplied", label: "Vessel Supplied" },
    ],
  },
];

export const REPORT_ACCESS_LEAVES: ReportAccessPage[] = [
  { key: "reports-dispatch", label: "Dispatch" },
  { key: "reports-purchase", label: "Purchase" },
];

export const REPORT_ACCESS_ITEMS: ReportAccessItem[] = [
  ...REPORT_ACCESS_GROUPS.map(
    (group) =>
      ({
        kind: "group",
        id: group.id,
        label: group.label,
        pages: group.pages,
      }) satisfies ReportAccessItem,
  ),
  ...REPORT_ACCESS_LEAVES.map(
    (page) =>
      ({
        kind: "leaf",
        key: page.key,
        label: page.label,
      }) satisfies ReportAccessItem,
  ),
].sort((a, b) => {
  const labelA = a.kind === "group" ? a.label : a.label;
  const labelB = b.kind === "group" ? b.label : b.label;
  return labelA.localeCompare(labelB);
});

export function reportKeysForAccessItem(item: ReportAccessItem): string[] {
  return item.kind === "group" ? item.pages.map((page) => page.key) : [item.key];
}

export function reportKeysForAccessGroup(group: ReportAccessGroup): string[] {
  return group.pages.map((page) => page.key);
}

export const APP_PAGES: AppPage[] = [
  { key: "home", href: "/", label: "Home", group: "Pages" },
  { key: "orders", href: "/orders", label: "Sale orders", group: "Pages" },
  { key: "purchase-orders", href: "/purchase-orders", label: "Purchase orders", group: "Pages" },
  { key: "dispatches", href: "/dispatches", label: "Dispatches", group: "Pages" },
  ...UPDATE_SUB_PAGES,
  ...BANK_SUB_PAGES,
  { key: "bills", href: "/bills", label: "Approvals", group: "Pages" },
  ...MASTER_SUB_PAGES,
  ...MASTER_OPTIONS_SUB_PAGES,
  { key: "options", href: "/options", label: "Options", group: "Pages", ownerOnly: true },
  ...REPORT_SUB_PAGES,
];

export const GRANTABLE_PAGES = APP_PAGES.filter((page) => !page.ownerOnly);

/** Top-level rows on the Team access page (nested sub-pages are grouped). */
export const TEAM_ACCESS_PAGES = GRANTABLE_PAGES.filter(
  (page) =>
    !page.updateSubPage &&
    !page.bankSubPage &&
    !page.masterSubPage &&
    !page.masterOptionsSubPage &&
    !page.reportSubPage,
);

/** Flat Pages rows on the Team access form, in nav order. */
export const PAGES_TEAM_ACCESS_ORDER = [
  "home",
  "orders",
  "purchase-orders",
  "dispatches",
  "bills",
] as const;

export function orderedPagesTeamAccess(): AppPage[] {
  const pages = new Map(
    TEAM_ACCESS_PAGES.filter((page) => page.group === "Pages").map((page) => [
      page.key,
      page,
    ]),
  );
  return PAGES_TEAM_ACCESS_ORDER.map((key) => pages.get(key)).filter(
    (page): page is AppPage => page !== undefined,
  );
}

export const ALL_PAGE_KEYS = APP_PAGES.map((page) => page.key);

export function expandLegacyUpdatePageKeys(pageKeys: string[]): string[] {
  if (!pageKeys.includes(LEGACY_UPDATE_PAGE_KEY)) return pageKeys;
  const withoutLegacy = pageKeys.filter((key) => key !== LEGACY_UPDATE_PAGE_KEY);
  return [...new Set([...withoutLegacy, ...UPDATE_SUB_PAGE_KEYS])];
}

export function expandLegacyBankPageKeys(pageKeys: string[]): string[] {
  if (!pageKeys.includes(LEGACY_BANK_PAGE_KEY)) return pageKeys;
  const withoutLegacy = pageKeys.filter((key) => key !== LEGACY_BANK_PAGE_KEY);
  return [...new Set([...withoutLegacy, ...BANK_SUB_PAGE_KEYS])];
}

export function expandLegacyOptionsPageKeys(pageKeys: string[]): string[] {
  if (!pageKeys.includes(LEGACY_OPTIONS_PAGE_KEY)) return pageKeys;
  const withoutLegacy = pageKeys.filter(
    (key) => key !== LEGACY_OPTIONS_PAGE_KEY,
  );
  return [...new Set([...withoutLegacy, ...MASTER_OPTIONS_SUB_PAGE_KEYS])];
}

export function expandStaffPageKeys(pageKeys: string[]): string[] {
  return expandLegacyOptionsPageKeys(
    expandLegacyBankPageKeys(expandLegacyUpdatePageKeys(pageKeys)),
  );
}

export function staffHasPageKey(pageKeys: string[], pageKey: string): boolean {
  return expandStaffPageKeys(pageKeys).includes(pageKey);
}

export function hasAnyUpdatePageAccess(pageKeys: string[]): boolean {
  const expanded = expandLegacyUpdatePageKeys(pageKeys);
  return UPDATE_SUB_PAGE_KEYS.some((key) => expanded.includes(key));
}

export function hasAnyBankPageAccess(pageKeys: string[]): boolean {
  const expanded = expandLegacyBankPageKeys(pageKeys);
  return BANK_SUB_PAGE_KEYS.some((key) => expanded.includes(key));
}

const OWNER_ONLY_OPTIONS_PATHS = ["/options/team", "/options/owners"] as const;

function isOwnerOnlyOptionsPath(pathname: string): boolean {
  const path = canonicalPath(pathname);
  return OWNER_ONLY_OPTIONS_PATHS.some(
    (href) => path === href || path.startsWith(`${href}/`),
  );
}

function masterOptionsSubPageKeyForPath(pathname: string): string | null {
  const path = canonicalPath(pathname);
  const matches = MASTER_OPTIONS_SUB_PAGES.filter((page) =>
    pathMatchesHref(path, page.href),
  ).sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.key ?? null;
}

function canAccessMasterOptionsPath(pageKeys: string[], pathname: string): boolean {
  if (isOwnerOnlyOptionsPath(pathname)) return false;
  const path = canonicalPath(pathname);
  const expanded = expandStaffPageKeys(pageKeys);
  const subKey = masterOptionsSubPageKeyForPath(pathname);
  if (subKey) return expanded.includes(subKey);
  if (path === "/options" || path.startsWith("/options/")) {
    return MASTER_OPTIONS_SUB_PAGE_KEYS.some((key) => expanded.includes(key));
  }
  return false;
}

function updateSubPageKeyForPath(pathname: string): string | null {
  const path = canonicalPath(pathname);
  for (const page of UPDATE_SUB_PAGES) {
    if (path === page.href || path.startsWith(`${page.href}/`)) {
      return page.key;
    }
  }
  return null;
}

function canAccessUpdatePath(pageKeys: string[], pathname: string): boolean {
  const path = canonicalPath(pathname);
  const expanded = expandLegacyUpdatePageKeys(pageKeys);
  const subKey = updateSubPageKeyForPath(path);
  if (subKey) {
    if (expanded.includes(subKey)) return true;
    if (
      subKey === "update-transport" &&
      pageKeys.includes("reports-transport-engine")
    ) {
      return true;
    }
    return false;
  }
  if (path === "/update" || path.startsWith("/update/")) {
    return hasAnyUpdatePageAccess(pageKeys);
  }
  return false;
}

function bankSubPageKeyForPath(pathname: string): string | null {
  const path = canonicalPath(pathname);
  if (path === "/payments/discount" || path.startsWith("/payments/discount/")) {
    return "payments-discount";
  }
  if (path === "/payments" || path.startsWith("/payments/")) {
    return "payments-transactions";
  }
  return null;
}

function canAccessBankPath(pageKeys: string[], pathname: string): boolean {
  const expanded = expandLegacyBankPageKeys(pageKeys);
  const subKey = bankSubPageKeyForPath(pathname);
  if (subKey) return expanded.includes(subKey);
  return false;
}

const PATH_ALIASES: { from: string; to: string; exact?: boolean }[] = [
  { from: "/staff", to: "/options" },
  { from: "/reports/quality-report", to: "/reports/product" },
  { from: "/reports/sales-engine", to: "/reports/sales" },
  { from: "/reports/vessel-report", to: "/reports/vessel" },
  { from: "/reports/transport-engine", to: "/reports/transport" },
];

function canonicalPath(pathname: string): string {
  const aliases = [...PATH_ALIASES].sort((a, b) => b.from.length - a.from.length);
  for (const { from, to, exact } of aliases) {
    if (exact) {
      if (pathname === from) return to;
      continue;
    }
    if (pathname === from || pathname.startsWith(`${from}/`)) {
      return `${to}${pathname.slice(from.length)}`;
    }
  }
  return pathname;
}

function pathMatchesHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function pageForPath(pathname: string): AppPage | null {
  const path = canonicalPath(pathname);
  const matches = APP_PAGES.filter((page) => pathMatchesHref(path, page.href)).sort(
    (a, b) => b.href.length - a.href.length,
  );
  return matches[0] ?? null;
}

export function isReportPath(pathname: string): boolean {
  const path = canonicalPath(pathname);
  return path === "/reports" || path.startsWith("/reports/");
}

export function hasAnyReportAccess(pageKeys: string[]): boolean {
  return REPORT_SUB_PAGE_KEYS.some((key) => pageKeys.includes(key));
}

export function canAccessPath(pageKeys: string[] | "all", pathname: string): boolean {
  if (pageKeys === "all") return true;
  const path = canonicalPath(pathname);
  if (path === "/reports") return hasAnyReportAccess(pageKeys);
  if (canAccessUpdatePath(pageKeys, pathname)) return true;
  if (canAccessBankPath(pageKeys, pathname)) return true;
  if (canAccessMasterOptionsPath(pageKeys, pathname)) return true;
  const page = pageForPath(path);
  if (!page || page.ownerOnly) return false;
  return pageKeys.includes(page.key);
}

export function firstAllowedPath(pageKeys: string[] | "all"): string {
  if (pageKeys === "all") return "/";
  const expanded = expandStaffPageKeys(pageKeys);
  const granted = GRANTABLE_PAGES.filter((item) => expanded.includes(item.key));
  const preferred = granted.find((item) => item.key !== "bills");
  return preferred?.href ?? granted[0]?.href ?? "/login";
}

export const PAGE_GROUPS: PageGroup[] = ["Pages", "Reports"];
