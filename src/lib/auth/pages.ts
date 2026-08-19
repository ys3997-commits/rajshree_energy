export type PageGroup = "Pages" | "Reports";

export type AppPage = {
  key: string;
  href: string;
  label: string;
  group: PageGroup;
  /** Owner-only. Never granted to staff. */
  ownerOnly?: boolean;
};

export const APP_PAGES: AppPage[] = [
  { key: "home", href: "/", label: "Home", group: "Pages" },
  { key: "orders", href: "/orders", label: "Sale orders", group: "Pages" },
  { key: "purchase-orders", href: "/purchase-orders", label: "Purchase orders", group: "Pages" },
  { key: "dispatches", href: "/dispatches", label: "Dispatches", group: "Pages" },
  { key: "payments", href: "/payments", label: "Payments", group: "Pages" },
  { key: "bills", href: "/bills", label: "Bills", group: "Pages" },
  { key: "vessels", href: "/vessels", label: "Vessels", group: "Pages" },
  { key: "qualities", href: "/qualities", label: "Qualities", group: "Pages" },
  { key: "customers", href: "/customers", label: "Customers", group: "Pages" },
  { key: "transporters", href: "/transporters", label: "Transporters", group: "Pages" },
  { key: "options", href: "/options", label: "Options", group: "Pages", ownerOnly: true },
  {
    key: "reports-collection",
    href: "/reports/collection",
    label: "Collection",
    group: "Reports",
  },
  {
    key: "reports-collection-vendor",
    href: "/reports/collection/vendor",
    label: "Vendor Collection",
    group: "Reports",
  },
  {
    key: "reports-ageing",
    href: "/reports/ageing-report",
    label: "Ageing Report",
    group: "Reports",
  },
  {
    key: "reports-customer-analysis",
    href: "/reports/customer-analysis",
    label: "Customer Analysis",
    group: "Reports",
  },
  {
    key: "reports-profit-analysis",
    href: "/reports/profit-analysis",
    label: "Profit Analysis",
    group: "Reports",
  },
  {
    key: "reports-sale-analysis",
    href: "/reports/analysis",
    label: "Sale Analysis",
    group: "Reports",
  },
  {
    key: "reports-vendor-analysis",
    href: "/reports/vendor-analysis",
    label: "Vendor Analysis",
    group: "Reports",
  },
  { key: "reports-ledger", href: "/reports/ledger", label: "Ledger", group: "Reports" },
  {
    key: "reports-dispatch",
    href: "/reports/master-dispatch",
    label: "Dispatch",
    group: "Reports",
  },
  {
    key: "reports-quality",
    href: "/reports/product",
    label: "Quality Report",
    group: "Reports",
  },
  { key: "reports-purchase", href: "/reports/purchase", label: "Purchase", group: "Reports" },
  {
    key: "reports-sales-engine",
    href: "/reports/sales",
    label: "Sales Engine Report",
    group: "Reports",
  },
  {
    key: "reports-transport-engine",
    href: "/reports/transport",
    label: "Transport Engine Report",
    group: "Reports",
  },
  {
    key: "reports-transport-due",
    href: "/reports/transport/due",
    label: "Transport Due",
    group: "Reports",
  },
  {
    key: "reports-vessel",
    href: "/reports/vessel",
    label: "Vessel Report",
    group: "Reports",
  },
  {
    key: "reports-vessel-supplied",
    href: "/reports/vessel/supplied",
    label: "Vessel Supplied",
    group: "Reports",
  },
];

export const GRANTABLE_PAGES = APP_PAGES.filter((page) => !page.ownerOnly);

export const ALL_PAGE_KEYS = APP_PAGES.map((page) => page.key);

const PATH_ALIASES: { from: string; to: string }[] = [
  { from: "/staff", to: "/options" },
  { from: "/reports/quality-report", to: "/reports/product" },
  { from: "/reports/sales-engine", to: "/reports/sales" },
  { from: "/reports/vessel-report", to: "/reports/vessel" },
  { from: "/reports/transport-engine", to: "/reports/transport" },
];

function canonicalPath(pathname: string): string {
  const aliases = [...PATH_ALIASES].sort((a, b) => b.from.length - a.from.length);
  for (const { from, to } of aliases) {
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
  return GRANTABLE_PAGES.some(
    (page) => page.group === "Reports" && pageKeys.includes(page.key),
  );
}

export function canAccessPath(pageKeys: string[] | "all", pathname: string): boolean {
  if (pageKeys === "all") return true;
  const path = canonicalPath(pathname);
  if (path === "/reports") return hasAnyReportAccess(pageKeys);
  const page = pageForPath(path);
  if (!page || page.ownerOnly) return false;
  return pageKeys.includes(page.key);
}

export function firstAllowedPath(pageKeys: string[] | "all"): string {
  if (pageKeys === "all") return "/";
  const granted = GRANTABLE_PAGES.filter((item) => pageKeys.includes(item.key));
  const preferred = granted.find((item) => item.key !== "bills");
  return preferred?.href ?? granted[0]?.href ?? "/login";
}

export const PAGE_GROUPS: PageGroup[] = ["Pages", "Reports"];
