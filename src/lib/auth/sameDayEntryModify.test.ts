import { describe, expect, it } from "vitest";
import type { Access } from "@/lib/auth/types";
import {
  calendarDaysElapsedInIst,
  canModifySameDayEntry,
  DISPATCH_STAFF_EDIT_EXTRA_CALENDAR_DAYS,
  sameDayEntryPermissions,
} from "./sameDayEntryModify";

const staff: Extract<Access, { kind: "staff" }> = {
  kind: "staff",
  id: "staff-1",
  name: "Desk",
  pageKeys: [],
  collectionSalesExecs: [],
  salesEngineSalesExecs: [],
  saleOrderSalesExecs: [],
  purchaseOrderSalesExecs: [],
  ageingReportSalesExecs: [],
  customerLedgerSalesExecs: [],
};

const owner: Extract<Access, { kind: "owner" }> = {
  kind: "owner",
  name: "Owner",
  pageKeys: "all",
};

function ist(isoLocal: string): Date {
  return new Date(`${isoLocal}+05:30`);
}

describe("calendarDaysElapsedInIst", () => {
  it("counts IST calendar days, not 24-hour windows", () => {
    const created = ist("2026-03-02T23:00:00");
    const nextMorning = ist("2026-03-03T00:30:00");
    expect(calendarDaysElapsedInIst(created, nextMorning)).toBe(1);
  });
});

describe("canModifySameDayEntry", () => {
  const ownRow = {
    createdAt: ist("2026-03-02T11:00:00"),
    createdByStaffId: "staff-1",
  };

  it("lets staff edit their own entry the same IST day", () => {
    expect(
      canModifySameDayEntry(staff, ownRow, { now: ist("2026-03-02T22:00:00") }),
    ).toBe(true);
  });

  it("blocks staff the next IST day when no extra days are allowed", () => {
    expect(
      canModifySameDayEntry(staff, ownRow, { now: ist("2026-03-03T10:00:00") }),
    ).toBe(false);
  });

  it("lets staff edit a dispatch through the 4th IST day", () => {
    expect(
      canModifySameDayEntry(staff, ownRow, {
        extraCalendarDays: DISPATCH_STAFF_EDIT_EXTRA_CALENDAR_DAYS,
        now: ist("2026-03-03T10:00:00"),
      }),
    ).toBe(true);
    expect(
      canModifySameDayEntry(staff, ownRow, {
        extraCalendarDays: DISPATCH_STAFF_EDIT_EXTRA_CALENDAR_DAYS,
        now: ist("2026-03-05T23:00:00"),
      }),
    ).toBe(true);
  });

  it("locks a dispatch from the 5th IST day after creation", () => {
    expect(
      canModifySameDayEntry(staff, ownRow, {
        extraCalendarDays: DISPATCH_STAFF_EDIT_EXTRA_CALENDAR_DAYS,
        now: ist("2026-03-06T00:00:00"),
      }),
    ).toBe(false);
  });

  it("blocks another staff member even with extra days", () => {
    expect(
      canModifySameDayEntry(
        { ...staff, id: "staff-2" },
        ownRow,
        {
          extraCalendarDays: DISPATCH_STAFF_EDIT_EXTRA_CALENDAR_DAYS,
          now: ist("2026-03-02T12:00:00"),
        },
      ),
    ).toBe(false);
  });

  it("lets the owner edit any day", () => {
    expect(
      canModifySameDayEntry(owner, ownRow, { now: ist("2026-03-10T12:00:00") }),
    ).toBe(true);
  });

  it("allows owner delete but never staff delete", () => {
    expect(
      sameDayEntryPermissions(owner, ownRow, {
        extraCalendarDays: DISPATCH_STAFF_EDIT_EXTRA_CALENDAR_DAYS,
        now: ist("2026-03-02T12:00:00"),
      }),
    ).toEqual({ canEdit: true, canDelete: true });
    expect(
      sameDayEntryPermissions(staff, ownRow, {
        extraCalendarDays: DISPATCH_STAFF_EDIT_EXTRA_CALENDAR_DAYS,
        now: ist("2026-03-02T12:00:00"),
      }),
    ).toEqual({ canEdit: true, canDelete: false });
  });
});
