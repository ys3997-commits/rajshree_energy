import { DispatchTerms } from "@/generated/prisma";
import { calendarDaysElapsedInIst } from "@/lib/auth/sameDayEntryModify";

/** Highlight when factory receiving is still blank after this many IST calendar days. */
export const UPDATE_SALE_RECEIVING_OVERDUE_AFTER_DAYS = 4;

function isBlankReceived(value: unknown): boolean {
  if (value == null) return true;
  if (value === "") return true;
  const text = String(value).trim();
  return text === "" || text === "—";
}

export function isUpdateSaleReceivingOverdue(
  row: {
    receivingQuantity: unknown;
    dispatchTerms: DispatchTerms | string | null | undefined;
    dispatchDate: Date | string;
  },
  now = new Date(),
): boolean {
  if (row.dispatchTerms === DispatchTerms.EX_PORT) return false;
  if (!isBlankReceived(row.receivingQuantity)) return false;
  const dispatchDate =
    row.dispatchDate instanceof Date
      ? row.dispatchDate
      : new Date(row.dispatchDate);
  if (Number.isNaN(dispatchDate.getTime())) return false;
  return (
    calendarDaysElapsedInIst(dispatchDate, now) >=
    UPDATE_SALE_RECEIVING_OVERDUE_AFTER_DAYS
  );
}

