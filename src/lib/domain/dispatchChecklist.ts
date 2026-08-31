import { DispatchTerms } from "@/generated/prisma";
import type { DecimalLike } from "@/lib/domain/computations";
import { dayKeyInIst } from "@/lib/auth/sameDayEntryModify";

export function nextChecklistCompletedAt(
  wasComplete: boolean,
  nowComplete: boolean,
  completedAt: Date | null,
): Date | null {
  if (!nowComplete) return null;
  if (wasComplete && completedAt) return completedAt;
  return new Date();
}

/** Staff may edit on completion day; locked from the next IST day onward. */
export function canStaffEditChecklist(args: {
  isComplete: boolean;
  completedAt: Date | null;
}): boolean {
  if (!args.isComplete) return true;
  if (!args.completedAt) return false;
  return dayKeyInIst(new Date()) === dayKeyInIst(args.completedAt);
}

export function isPurchaseChecklistComplete(input: {  purchaseInvoiceNumber: string | null;
  entryInTally: boolean;
}): boolean {
  return (
    Boolean(input.purchaseInvoiceNumber?.trim()) && input.entryInTally
  );
}

export function isSaleChecklistComplete(input: {
  saleInvoiceNumber: string | null;
  receivingQuantity: DecimalLike | null;
  dispatchTerms: DispatchTerms;
}): boolean {
  if (input.dispatchTerms === DispatchTerms.EX_PORT) {
    return Boolean(input.saleInvoiceNumber?.trim());
  }
  if (input.receivingQuantity == null) return false;
  const received = String(input.receivingQuantity).trim();
  return Boolean(input.saleInvoiceNumber?.trim()) && received !== "";
}

export function isTransportChecklistComplete(input: {
  biltyHardCopy: boolean;
  transportInvoiceNo: string | null;
  invoiceHardCopy: boolean;
  transportEntryInTally: boolean;
}): boolean {
  return (
    input.biltyHardCopy &&
    Boolean(input.transportInvoiceNo?.trim()) &&
    input.invoiceHardCopy &&
    input.transportEntryInTally
  );
}
