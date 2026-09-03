import { AccessDeniedError } from "@/lib/auth/errors";
import type { Access } from "@/lib/auth/types";

const IST_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
});

const MS_PER_DAY = 86_400_000;

/** Staff may edit their own dispatch on the creation IST day plus this many extra days. */
export const DISPATCH_STAFF_EDIT_EXTRA_CALENDAR_DAYS = 1;

export type SameDayEntryRow = {
  createdAt: Date;
  createdByStaffId: string | null;
};

export type SameDayEntryOptions = {
  extraCalendarDays?: number;
  now?: Date;
};

export function dayKeyInIst(value: Date): string {
  return IST_DAY_FORMATTER.format(value);
}

export function calendarDaysElapsedInIst(from: Date, to: Date): number {
  const fromUtc = Date.parse(`${dayKeyInIst(from)}T00:00:00.000Z`);
  const toUtc = Date.parse(`${dayKeyInIst(to)}T00:00:00.000Z`);
  return Math.round((toUtc - fromUtc) / MS_PER_DAY);
}

export function canModifySameDayEntry(
  access: Exclude<Access, { kind: "none" }>,
  row: SameDayEntryRow,
  options: SameDayEntryOptions = {},
): boolean {
  if (access.kind === "owner") return true;
  if (!row.createdByStaffId) return false;
  if (row.createdByStaffId !== access.id) return false;
  const extraCalendarDays = options.extraCalendarDays ?? 0;
  const elapsed = calendarDaysElapsedInIst(row.createdAt, options.now ?? new Date());
  return elapsed >= 0 && elapsed <= extraCalendarDays;
}

export function sameDayEntryPermissions(
  access: Exclude<Access, { kind: "none" }>,
  row: SameDayEntryRow,
  options: SameDayEntryOptions = {},
): { canEdit: boolean; canDelete: boolean } {
  const allowed = canModifySameDayEntry(access, row, options);
  return { canEdit: allowed, canDelete: allowed };
}

function sameDayLockMessage(
  action: "edit" | "delete",
  entityLabel: string,
  extraCalendarDays: number,
): string {
  const verb = action === "delete" ? "delete" : "edit";
  if (extraCalendarDays <= 0) {
    return `You can ${verb} only your own ${entityLabel} on the same day.`;
  }
  return `You can ${verb} only your own ${entityLabel} on the same day or the next day.`;
}

export function assertCanModifySameDayEntry(
  access: Exclude<Access, { kind: "none" }>,
  row: SameDayEntryRow,
  action: "edit" | "delete",
  entityLabel: string,
  options: SameDayEntryOptions = {},
): void {
  if (canModifySameDayEntry(access, row, options)) return;
  throw new AccessDeniedError(
    sameDayLockMessage(action, entityLabel, options.extraCalendarDays ?? 0),
  );
}
