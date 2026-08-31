import { AccessDeniedError } from "@/lib/auth/errors";
import type { Access } from "@/lib/auth/types";

const IST_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
});

export type SameDayEntryRow = {
  createdAt: Date;
  createdByStaffId: string | null;
};

export function dayKeyInIst(value: Date): string {
  return IST_DAY_FORMATTER.format(value);
}

export function canModifySameDayEntry(
  access: Exclude<Access, { kind: "none" }>,
  row: SameDayEntryRow,
): boolean {
  if (access.kind === "owner") return true;
  if (!row.createdByStaffId) return false;
  if (row.createdByStaffId !== access.id) return false;
  return dayKeyInIst(row.createdAt) === dayKeyInIst(new Date());
}

export function sameDayEntryPermissions(
  access: Exclude<Access, { kind: "none" }>,
  row: SameDayEntryRow,
): { canEdit: boolean; canDelete: boolean } {
  const allowed = canModifySameDayEntry(access, row);
  return { canEdit: allowed, canDelete: allowed };
}

export function assertCanModifySameDayEntry(
  access: Exclude<Access, { kind: "none" }>,
  row: SameDayEntryRow,
  action: "edit" | "delete",
  entityLabel: string,
): void {
  if (canModifySameDayEntry(access, row)) return;
  const verb = action === "delete" ? "delete" : "edit";
  throw new AccessDeniedError(
    `You can ${verb} only your own ${entityLabel} on the same day.`,
  );
}
