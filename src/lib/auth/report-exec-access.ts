import type { Prisma } from "@/generated/prisma";
import type { Access } from "@/lib/auth/types";

export const REPORT_EXEC_ALL = "*";

export const COLLECTION_ENGINE_PAGE_KEY = "reports-collection";
export const SALES_ENGINE_PAGE_KEY = "reports-sales-engine";
export const SALE_ORDERS_PAGE_KEY = "orders";
export const PURCHASE_ORDERS_PAGE_KEY = "purchase-orders";
export const AGEING_REPORT_PAGE_KEY = "reports-ageing";

export const EXEC_SCOPED_REPORT_PAGES = [
  COLLECTION_ENGINE_PAGE_KEY,
  SALES_ENGINE_PAGE_KEY,
  SALE_ORDERS_PAGE_KEY,
  PURCHASE_ORDERS_PAGE_KEY,
  AGEING_REPORT_PAGE_KEY,
] as const;

export type ExecScopedReportPage = (typeof EXEC_SCOPED_REPORT_PAGES)[number];

export type ExecScopeFilter = "all" | string[];

export function isExecScopedReportPage(
  pageKey: string,
): pageKey is ExecScopedReportPage {
  return (EXEC_SCOPED_REPORT_PAGES as readonly string[]).includes(pageKey);
}

export function isReportExecAll(scope: string[]): boolean {
  return scope.includes(REPORT_EXEC_ALL);
}

/** Loaded scope for staff with page access; empty stored scope => ALL (legacy). */
export function normalizeStoredExecScope(
  scope: string[] | undefined | null,
  pageGranted: boolean,
): string[] {
  if (!pageGranted) return [];
  if (!scope || scope.length === 0) return [REPORT_EXEC_ALL];
  return [...new Set(scope.map((item) => item.trim()).filter(Boolean))];
}

/** Scope persisted on save; drops ALL marker when specific names are selected. */
export function normalizeExecScopeForSave(
  scope: string[],
  pageGranted: boolean,
): string[] {
  if (!pageGranted) return [];
  const cleaned = [...new Set(scope.map((item) => item.trim()).filter(Boolean))];
  if (cleaned.length === 0) return [];
  if (isReportExecAll(cleaned)) return [REPORT_EXEC_ALL];
  return cleaned.filter((item) => item !== REPORT_EXEC_ALL);
}

export function validateExecScopeForSave(
  scope: string[],
  pageGranted: boolean,
  pageLabel: string,
): void {
  if (!pageGranted) return;
  if (normalizeExecScopeForSave(scope, true).length === 0) {
    throw new Error(`Select at least one sales executive for ${pageLabel}`);
  }
}

export function rowMatchesExecScope(
  saleExecutive: string | null | undefined,
  scope: string[],
): boolean {
  if (isReportExecAll(scope)) return true;
  if (scope.length === 0) return false;
  const exec = (saleExecutive?.trim() ?? "").toLowerCase();
  if (!exec) return false;
  return scope.some((name) => name.trim().toLowerCase() === exec);
}

export function resolveExecScopeFilter(scope: string[]): ExecScopeFilter {
  if (isReportExecAll(scope)) return "all";
  return scope;
}

/** Prisma filter on Customer.saleExecutive for order list queries. */
export function execScopeToCustomerWhere(
  scope: ExecScopeFilter,
): Prisma.CustomerWhereInput | undefined {
  if (scope === "all") return undefined;
  if (scope.length === 0) return { id: { equals: "__none__" } };
  return {
    OR: scope.map((name) => ({
      saleExecutive: { equals: name.trim(), mode: "insensitive" },
    })),
  };
}

export function mergeOrderCustomerFilter(
  where: Prisma.OrderWhereInput,
  customerFilter: Prisma.CustomerWhereInput | undefined,
): void {
  if (!customerFilter) return;
  const existing = where.customer;
  if (!existing) {
    where.customer = customerFilter;
    return;
  }
  where.customer = { AND: [existing, customerFilter] };
}

export function mergePurchaseOrderImporterFilter(
  where: Prisma.PurchaseOrderWhereInput,
  customerFilter: Prisma.CustomerWhereInput | undefined,
): void {
  if (!customerFilter) return;
  const existing = where.importer;
  if (!existing) {
    where.importer = customerFilter;
    return;
  }
  where.importer = { AND: [existing, customerFilter] };
}

export function filterRowsByExecScope<
  T extends { saleExecutive: string | null },
>(rows: T[], scope: ExecScopeFilter): T[] {
  if (scope === "all") return rows;
  return rows.filter((row) => rowMatchesExecScope(row.saleExecutive, scope));
}

export function getStaffReportExecScope(
  access: Access,
  pageKey: ExecScopedReportPage,
): ExecScopeFilter {
  if (access.kind === "owner") return "all";
  if (access.kind === "none") return [];
  if (!access.pageKeys.includes(pageKey)) return [];

  const stored =
    pageKey === COLLECTION_ENGINE_PAGE_KEY
      ? access.collectionSalesExecs
      : pageKey === SALES_ENGINE_PAGE_KEY
        ? access.salesEngineSalesExecs
        : pageKey === SALE_ORDERS_PAGE_KEY
          ? access.saleOrderSalesExecs
          : pageKey === PURCHASE_ORDERS_PAGE_KEY
            ? access.purchaseOrderSalesExecs
            : access.ageingReportSalesExecs;

  return resolveExecScopeFilter(normalizeStoredExecScope(stored, true));
}