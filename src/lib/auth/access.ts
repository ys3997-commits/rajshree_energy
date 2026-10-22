import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { canAccessPath, firstAllowedPath, GRANTABLE_PAGES, staffHasPageKey } from "@/lib/auth/pages";
import { hasFullPower, isAdminRole } from "@/lib/auth/fullPower";
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

  // Header "0" means middleware already saw a staff cookie and no owner
  // session to refresh. Any other request still checks Supabase first.
  if (hint !== "0" || !staffId) {
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
      role: true,
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
  const admin = isAdminRole(staff?.role);
  if (!staff?.passwordHash || (!admin && staff.pageKeys.length === 0)) {
    return { kind: "none" };
  }

  const pageKeys = admin
    ? GRANTABLE_PAGES.map((page) => page.key)
    : staff.pageKeys;
  const scope = (stored: string[], key: string) =>
    admin ? ["*"] : normalizeStoredExecScope(stored, pageKeys.includes(key));
  return {
    kind: "staff",
    id: staff.id,
    name: staff.name,
    role: admin ? "Admin" : "Team",
    pageKeys,
    collectionSalesExecs: scope(staff.collectionSalesExecs, "reports-collection"),
    salesEngineSalesExecs: scope(staff.salesEngineSalesExecs, "reports-sales-engine"),
    saleOrderSalesExecs: scope(staff.saleOrderSalesExecs, "orders"),
    purchaseOrderSalesExecs: scope(staff.purchaseOrderSalesExecs, "purchase-orders"),
    ageingReportSalesExecs: scope(staff.ageingReportSalesExecs, "reports-ageing"),
    customerLedgerSalesExecs: scope(staff.customerLedgerSalesExecs, "reports-ledger"),
  };
});

export async function requireSignedIn(): Promise<Exclude<Access, { kind: "none" }>> {
  const access = await getCurrentAccess();
  if (access.kind === "none") throw new AccessDeniedError("Please sign in");
  return access;
}

export async function requireOwner(): Promise<Exclude<Access, { kind: "none" }>> {
  const access = await getCurrentAccess();
  if (!hasFullPower(access) || access.kind === "none") {
    throw new AccessDeniedError("Only an admin can do this");
  }
  return access;
}

export async function requirePage(
  pageKey: string,
): Promise<Exclude<Access, { kind: "none" }>> {
  const access = await requireSignedIn();
  if (hasFullPower(access) || access.pageKeys === "all") return access;
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
  if (hasFullPower(access)) return true;
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
