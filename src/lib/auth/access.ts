import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { canAccessPath, firstAllowedPath, staffHasPageKey } from "@/lib/auth/pages";
import { normalizeStoredExecScope } from "@/lib/auth/report-exec-access";
import type { Access } from "@/lib/auth/types";
import {
  AUTH_USER_HEADER,
  STAFF_SESSION_COOKIE,
  createStaffSessionToken,
  readStaffIdFromToken,
  staffSessionCookieOptions,
} from "@/lib/auth/staff-session";
import { AccessDeniedError } from "@/lib/auth/errors";

export { AccessDeniedError };

const OWNER_ACCESS: Access = {
  kind: "owner",
  name: "Owner",
  pageKeys: "all",
};

async function authUserHint(): Promise<"0" | "1" | null> {
  try {
    const value = (await headers()).get(AUTH_USER_HEADER);
    if (value === "0" || value === "1") return value;
  } catch {
    // headers() is only available during a request.
  }
  return null;
}

export const getCurrentAccess = cache(async function getCurrentAccess(): Promise<Access> {
  const hint = await authUserHint();
  if (hint === "1") return OWNER_ACCESS;

  const jar = await cookies();
  const staffId = await readStaffIdFromToken(
    jar.get(STAFF_SESSION_COOKIE)?.value,
  );

  if (hint !== "0") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return OWNER_ACCESS;
  }

  if (!staffId) return { kind: "none" };

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      id: true,
      name: true,
      passwordHash: true,
      pageKeys: true,
      collectionSalesExecs: true,
      salesEngineSalesExecs: true,
      saleOrderSalesExecs: true,
      purchaseOrderSalesExecs: true,
      ageingReportSalesExecs: true,
      customerLedgerSalesExecs: true,
    },
  });
  if (!staff?.passwordHash || staff.pageKeys.length === 0) {
    return { kind: "none" };
  }

  const pageKeys = staff.pageKeys;
  return {
    kind: "staff",
    id: staff.id,
    name: staff.name,
    pageKeys,
    collectionSalesExecs: normalizeStoredExecScope(
      staff.collectionSalesExecs,
      pageKeys.includes("reports-collection"),
    ),
    salesEngineSalesExecs: normalizeStoredExecScope(
      staff.salesEngineSalesExecs,
      pageKeys.includes("reports-sales-engine"),
    ),
    saleOrderSalesExecs: normalizeStoredExecScope(
      staff.saleOrderSalesExecs,
      pageKeys.includes("orders"),
    ),
    purchaseOrderSalesExecs: normalizeStoredExecScope(
      staff.purchaseOrderSalesExecs,
      pageKeys.includes("purchase-orders"),
    ),
    ageingReportSalesExecs: normalizeStoredExecScope(
      staff.ageingReportSalesExecs,
      pageKeys.includes("reports-ageing"),
    ),
    customerLedgerSalesExecs: normalizeStoredExecScope(
      staff.customerLedgerSalesExecs,
      pageKeys.includes("reports-ledger"),
    ),
  };
});

export async function requireSignedIn(): Promise<Exclude<Access, { kind: "none" }>> {
  const access = await getCurrentAccess();
  if (access.kind === "none") throw new AccessDeniedError("Please sign in");
  return access;
}

export async function requireOwner(): Promise<Extract<Access, { kind: "owner" }>> {
  const access = await getCurrentAccess();
  if (access.kind !== "owner") {
    throw new AccessDeniedError("Only the owner can do this");
  }
  return access;
}

export async function requirePage(
  pageKey: string,
): Promise<Exclude<Access, { kind: "none" }>> {
  const access = await requireSignedIn();
  if (access.pageKeys === "all") return access;
  if (pageKey === "options" || !staffHasPageKey(access.pageKeys, pageKey)) {
    throw new AccessDeniedError();
  }
  return access;
}

export function landingPath(access: Access): string {
  if (access.kind === "none") return "/login";
  return firstAllowedPath(access.pageKeys);
}

export function canVisit(access: Access, pathname: string): boolean {
  if (access.kind === "none") return false;
  return canAccessPath(access.pageKeys, pathname);
}

export async function writeStaffSession(staffId: string) {
  const token = await createStaffSessionToken(staffId);
  const jar = await cookies();
  jar.set(STAFF_SESSION_COOKIE, token, staffSessionCookieOptions());
}

export async function clearStaffSession() {
  const jar = await cookies();
  jar.set(STAFF_SESSION_COOKIE, "", {
    ...staffSessionCookieOptions(),
    maxAge: 0,
  });
}

export { canAccessPath, firstAllowedPath };
export type { Access } from "@/lib/auth/types";
