import { AccessDeniedError } from "@/lib/auth/errors";
import type { Access } from "@/lib/auth/types";
import {
  canStaffEditChecklist,
  isPurchaseChecklistComplete,
  isSaleChecklistComplete,
  isTransportChecklistComplete,
} from "@/lib/domain/dispatchChecklist";
import type { DispatchTerms } from "@/generated/prisma";
import type { DecimalLike } from "@/lib/domain/computations";

export function canEditPurchaseChecklist(
  access: Exclude<Access, { kind: "none" }>,
  row: {
    purchaseInvoiceNumber: string | null;
    entryInTally: boolean;
    purchaseChecklistCompletedAt: Date | null;
  },
): boolean {
  if (access.kind === "owner") return true;
  return canStaffEditChecklist({
    isComplete: isPurchaseChecklistComplete(row),
    completedAt: row.purchaseChecklistCompletedAt,
  });
}

export function canEditSaleChecklist(
  access: Exclude<Access, { kind: "none" }>,
  row: {
    saleInvoiceNumber: string | null;
    receivingQuantity: DecimalLike | null;
    dispatchTerms: DispatchTerms;
    saleChecklistCompletedAt: Date | null;
  },
): boolean {
  if (access.kind === "owner") return true;
  return canStaffEditChecklist({
    isComplete: isSaleChecklistComplete(row),
    completedAt: row.saleChecklistCompletedAt,
  });
}

export function canEditTransportChecklist(
  access: Exclude<Access, { kind: "none" }>,
  row: {
    biltyHardCopy: boolean;
    transportInvoiceNo: string | null;
    invoiceHardCopy: boolean;
    transportEntryInTally: boolean;
    transportChecklistCompletedAt: Date | null;
  },
): boolean {
  if (access.kind === "owner") return true;
  return canStaffEditChecklist({
    isComplete: isTransportChecklistComplete(row),
    completedAt: row.transportChecklistCompletedAt,
  });
}

export function assertCanEditPurchaseChecklist(
  access: Exclude<Access, { kind: "none" }>,
  row: {
    purchaseInvoiceNumber: string | null;
    entryInTally: boolean;
    purchaseChecklistCompletedAt: Date | null;
  },
): void {
  if (canEditPurchaseChecklist(access, row)) return;
  throw new AccessDeniedError(
    "Purchase checklist can no longer be edited after the day it was completed.",
  );
}

export function assertCanEditSaleChecklist(
  access: Exclude<Access, { kind: "none" }>,
  row: {
    saleInvoiceNumber: string | null;
    receivingQuantity: DecimalLike | null;
    dispatchTerms: DispatchTerms;
    saleChecklistCompletedAt: Date | null;
  },
): void {
  if (canEditSaleChecklist(access, row)) return;
  throw new AccessDeniedError(
    "Sale checklist can no longer be edited after the day it was completed.",
  );
}

export function assertCanEditTransportChecklist(
  access: Exclude<Access, { kind: "none" }>,
  row: {
    biltyHardCopy: boolean;
    transportInvoiceNo: string | null;
    invoiceHardCopy: boolean;
    transportEntryInTally: boolean;
    transportChecklistCompletedAt: Date | null;
  },
): void {
  if (canEditTransportChecklist(access, row)) return;
  throw new AccessDeniedError(
    "Transport checklist can no longer be edited after the day it was completed.",
  );
}
