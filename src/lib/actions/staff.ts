"use server";

import { requireOwner } from "@/lib/auth/access";
import {
  expandStaffPageKeys,
  GRANTABLE_PAGES,
  LEGACY_BANK_PAGE_KEY,
  LEGACY_UPDATE_PAGE_KEY,
  UPDATE_SUB_PAGE_KEYS,
} from "@/lib/auth/pages";
import {
  AGEING_REPORT_PAGE_KEY,
  COLLECTION_ENGINE_PAGE_KEY,
  normalizeExecScopeForSave,
  normalizeStoredExecScope,
  PURCHASE_ORDERS_PAGE_KEY,
  SALE_ORDERS_PAGE_KEY,
  SALES_ENGINE_PAGE_KEY,
  validateExecScopeForSave,
} from "@/lib/auth/report-exec-access";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { capitalizeName } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const STAFF_PATHS = [
  "/options",
  "/",
  "/customers",
  "/orders",
  "/dispatches",
  "/bills",
] as const;
const GRANTABLE_KEYS = new Set(GRANTABLE_PAGES.map((page) => page.key));

function revalidateStaffPaths() {
  for (const path of STAFF_PATHS) {
    revalidatePath(path);
  }
}

function publicStaff<T extends { passwordHash?: string | null }>(row: T) {
  const { passwordHash, ...rest } = row;
  return {
    ...rest,
    hasLogin: Boolean(passwordHash),
  };
}

function normalizePageKeys(pageKeys: string[] | undefined): string[] {
  const unique = new Set<string>();
  for (const key of expandStaffPageKeys(pageKeys ?? [])) {
    if (key === LEGACY_UPDATE_PAGE_KEY || key === LEGACY_BANK_PAGE_KEY) continue;
    if (GRANTABLE_KEYS.has(key)) unique.add(key);
  }
  return [...unique];
}

function normalizeStaffExecScopes(input: {
  pageKeys: string[];
  collectionSalesExecs?: string[];
  salesEngineSalesExecs?: string[];
  saleOrderSalesExecs?: string[];
  purchaseOrderSalesExecs?: string[];
  ageingReportSalesExecs?: string[];
}) {
  const hasCollection = input.pageKeys.includes(COLLECTION_ENGINE_PAGE_KEY);
  const hasSalesEngine = input.pageKeys.includes(SALES_ENGINE_PAGE_KEY);
  const hasSaleOrders = input.pageKeys.includes(SALE_ORDERS_PAGE_KEY);
  const hasPurchaseOrders = input.pageKeys.includes(PURCHASE_ORDERS_PAGE_KEY);
  const hasAgeingReport = input.pageKeys.includes(AGEING_REPORT_PAGE_KEY);

  validateExecScopeForSave(
    input.collectionSalesExecs ?? [],
    hasCollection,
    "Collection Engine",
  );
  validateExecScopeForSave(
    input.salesEngineSalesExecs ?? [],
    hasSalesEngine,
    "Sales Engine Report",
  );
  validateExecScopeForSave(
    input.saleOrderSalesExecs ?? [],
    hasSaleOrders,
    "Sale orders",
  );
  validateExecScopeForSave(
    input.purchaseOrderSalesExecs ?? [],
    hasPurchaseOrders,
    "Purchase orders",
  );
  validateExecScopeForSave(
    input.ageingReportSalesExecs ?? [],
    hasAgeingReport,
    "Ageing Report",
  );

  return {
    collectionSalesExecs: normalizeExecScopeForSave(
      input.collectionSalesExecs ?? [],
      hasCollection,
    ),
    salesEngineSalesExecs: normalizeExecScopeForSave(
      input.salesEngineSalesExecs ?? [],
      hasSalesEngine,
    ),
    saleOrderSalesExecs: normalizeExecScopeForSave(
      input.saleOrderSalesExecs ?? [],
      hasSaleOrders,
    ),
    purchaseOrderSalesExecs: normalizeExecScopeForSave(
      input.purchaseOrderSalesExecs ?? [],
      hasPurchaseOrders,
    ),
    ageingReportSalesExecs: normalizeExecScopeForSave(
      input.ageingReportSalesExecs ?? [],
      hasAgeingReport,
    ),
  };
}

function staffRow<T extends {
  pageKeys: string[];
  collectionSalesExecs: string[];
  salesEngineSalesExecs: string[];
  saleOrderSalesExecs: string[];
  purchaseOrderSalesExecs: string[];
  ageingReportSalesExecs: string[];
}>(row: T) {
  const pageKeys = normalizePageKeys(row.pageKeys);
  return {
    ...row,
    pageKeys,
    collectionSalesExecs: normalizeStoredExecScope(
      row.collectionSalesExecs,
      pageKeys.includes(COLLECTION_ENGINE_PAGE_KEY),
    ),
    salesEngineSalesExecs: normalizeStoredExecScope(
      row.salesEngineSalesExecs,
      pageKeys.includes(SALES_ENGINE_PAGE_KEY),
    ),
    saleOrderSalesExecs: normalizeStoredExecScope(
      row.saleOrderSalesExecs,
      pageKeys.includes(SALE_ORDERS_PAGE_KEY),
    ),
    purchaseOrderSalesExecs: normalizeStoredExecScope(
      row.purchaseOrderSalesExecs,
      pageKeys.includes(PURCHASE_ORDERS_PAGE_KEY),
    ),
    ageingReportSalesExecs: normalizeStoredExecScope(
      row.ageingReportSalesExecs,
      pageKeys.includes(AGEING_REPORT_PAGE_KEY),
    ),
  };
}

async function assertPasswordAvailable(password: string, exceptStaffId?: string) {
  const others = await prisma.staff.findMany({
    where: {
      passwordHash: { not: null },
      ...(exceptStaffId ? { id: { not: exceptStaffId } } : {}),
    },
    select: { passwordHash: true },
  });
  for (const row of others) {
    if (row.passwordHash && (await verifyPassword(password, row.passwordHash))) {
      throw new Error("That password is already used by another person");
    }
  }
}

export async function listStaff() {
  await requireOwner();
  const rows = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  return rows.map((row) => publicStaff(staffRow(row)));
}

export async function createStaff(input: {
  name: string;
  role?: string | null;
  password?: string | null;
  pageKeys?: string[];
  collectionSalesExecs?: string[];
  salesEngineSalesExecs?: string[];
  saleOrderSalesExecs?: string[];
  purchaseOrderSalesExecs?: string[];
  ageingReportSalesExecs?: string[];
}) {
  await requireOwner();
  const name = capitalizeName(input.name);
  if (!name) throw new Error("Name is required");
  const password = input.password?.trim() || "";
  const pageKeys = normalizePageKeys(input.pageKeys);
  const execScopes = normalizeStaffExecScopes({
    pageKeys,
    collectionSalesExecs: input.collectionSalesExecs,
    salesEngineSalesExecs: input.salesEngineSalesExecs,
    saleOrderSalesExecs: input.saleOrderSalesExecs,
    purchaseOrderSalesExecs: input.purchaseOrderSalesExecs,
    ageingReportSalesExecs: input.ageingReportSalesExecs,
  });

  let passwordHash: string | null = null;
  if (password) {
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    if (pageKeys.length === 0) {
      throw new Error("Select at least one page for login access");
    }
    await assertPasswordAvailable(password);
    passwordHash = await hashPassword(password);
  }

  const row = await prisma.staff.create({
    data: {
      name,
      role: capitalizeName(input.role),
      passwordHash,
      pageKeys: passwordHash ? pageKeys : [],
      collectionSalesExecs: passwordHash ? execScopes.collectionSalesExecs : [],
      salesEngineSalesExecs: passwordHash ? execScopes.salesEngineSalesExecs : [],
      saleOrderSalesExecs: passwordHash ? execScopes.saleOrderSalesExecs : [],
      purchaseOrderSalesExecs: passwordHash ? execScopes.purchaseOrderSalesExecs : [],
      ageingReportSalesExecs: passwordHash ? execScopes.ageingReportSalesExecs : [],
    },
  });
  revalidateStaffPaths();
  return publicStaff(staffRow(row));
}

export async function updateStaff(
  id: string,
  input: {
    name: string;
    role?: string | null;
    password?: string | null;
    pageKeys?: string[];
    collectionSalesExecs?: string[];
    salesEngineSalesExecs?: string[];
    saleOrderSalesExecs?: string[];
    purchaseOrderSalesExecs?: string[];
    ageingReportSalesExecs?: string[];
    disableLogin?: boolean;
  },
) {
  await requireOwner();
  const name = capitalizeName(input.name);
  if (!name) throw new Error("Name is required");

  const existing = await prisma.staff.findUnique({ where: { id } });
  if (!existing) throw new Error("Person not found");

  const pageKeys = normalizePageKeys(input.pageKeys);
  const execScopes = normalizeStaffExecScopes({
    pageKeys,
    collectionSalesExecs: input.collectionSalesExecs,
    salesEngineSalesExecs: input.salesEngineSalesExecs,
    saleOrderSalesExecs: input.saleOrderSalesExecs,
    purchaseOrderSalesExecs: input.purchaseOrderSalesExecs,
    ageingReportSalesExecs: input.ageingReportSalesExecs,
  });
  let passwordHash = existing.passwordHash;
  let nextPages = existing.pageKeys;
  let nextCollectionExecs = existing.collectionSalesExecs;
  let nextSalesEngineExecs = existing.salesEngineSalesExecs;
  let nextSaleOrderExecs = existing.saleOrderSalesExecs;
  let nextPurchaseOrderExecs = existing.purchaseOrderSalesExecs;
  let nextAgeingReportExecs = existing.ageingReportSalesExecs;

  if (input.disableLogin) {
    passwordHash = null;
    nextPages = [];
    nextCollectionExecs = [];
    nextSalesEngineExecs = [];
    nextSaleOrderExecs = [];
    nextPurchaseOrderExecs = [];
    nextAgeingReportExecs = [];
  } else {
    const password = input.password?.trim() || "";
    if (password) {
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      await assertPasswordAvailable(password, id);
      passwordHash = await hashPassword(password);
    }
    if (passwordHash) {
      if (pageKeys.length === 0) {
        throw new Error("Select at least one page for login access");
      }
      nextPages = pageKeys;
      nextCollectionExecs = execScopes.collectionSalesExecs;
      nextSalesEngineExecs = execScopes.salesEngineSalesExecs;
      nextSaleOrderExecs = execScopes.saleOrderSalesExecs;
      nextPurchaseOrderExecs = execScopes.purchaseOrderSalesExecs;
      nextAgeingReportExecs = execScopes.ageingReportSalesExecs;
    } else {
      nextPages = [];
      nextCollectionExecs = [];
      nextSalesEngineExecs = [];
      nextSaleOrderExecs = [];
      nextPurchaseOrderExecs = [];
      nextAgeingReportExecs = [];
    }
  }

  const row = await prisma.staff.update({
    where: { id },
    data: {
      name,
      role: capitalizeName(input.role),
      passwordHash,
      pageKeys: nextPages,
      collectionSalesExecs: nextCollectionExecs,
      salesEngineSalesExecs: nextSalesEngineExecs,
      saleOrderSalesExecs: nextSaleOrderExecs,
      purchaseOrderSalesExecs: nextPurchaseOrderExecs,
      ageingReportSalesExecs: nextAgeingReportExecs,
    },
  });
  revalidateStaffPaths();
  return publicStaff(staffRow(row));
}

export async function deleteStaff(id: string) {
  await requireOwner();
  await prisma.staff.delete({ where: { id } });
  revalidateStaffPaths();
}
