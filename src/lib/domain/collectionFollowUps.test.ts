import { describe, expect, it } from "vitest";
import {
  applyPlannedCollectionCallChange,
  applyPlannedSaleCallChange,
  clearCollectionCallsBeforePayment,
  collectionChangeDate,
  type CollectionCallSchedule,
} from "./collectionFollowUps";

const empty: CollectionCallSchedule = {
  plannedCallDate: null,
  followUp1: null,
  followUp2: null,
  followUp3: null,
};

function change(
  schedule: CollectionCallSchedule,
  nextPlannedCallDate: string,
  changedOn: string,
  lastPaymentDate: string | null = null,
): CollectionCallSchedule {
  return applyPlannedCollectionCallChange({
    schedule,
    nextPlannedCallDate,
    changedOn,
    lastPaymentDate,
  });
}

describe("applyPlannedCollectionCallChange", () => {
  it("keeps the last three planned dates and shifts only on or after the planned day", () => {
    let schedule = change(empty, "2026-01-15", "2026-01-11");
    expect(schedule).toEqual({
      plannedCallDate: "2026-01-15",
      followUp1: null,
      followUp2: null,
      followUp3: null,
    });

    schedule = change(schedule, "2026-01-18", "2026-01-15");
    expect(schedule).toEqual({
      plannedCallDate: "2026-01-18",
      followUp1: "2026-01-15",
      followUp2: null,
      followUp3: null,
    });

    schedule = change(schedule, "2026-01-20", "2026-01-18");
    expect(schedule).toMatchObject({
      plannedCallDate: "2026-01-20",
      followUp1: "2026-01-15",
      followUp2: "2026-01-18",
      followUp3: null,
    });

    schedule = change(schedule, "2026-01-24", "2026-01-21");
    expect(schedule).toMatchObject({
      plannedCallDate: "2026-01-24",
      followUp1: "2026-01-15",
      followUp2: "2026-01-18",
      followUp3: "2026-01-20",
    });

    schedule = change(schedule, "2026-01-29", "2026-01-24");
    expect(schedule).toEqual({
      plannedCallDate: "2026-01-29",
      followUp1: "2026-01-18",
      followUp2: "2026-01-20",
      followUp3: "2026-01-24",
    });
  });

  it("does not record a follow-up when the date is changed before the planned day", () => {
    const schedule = change(
      {
        plannedCallDate: "2026-01-15",
        followUp1: null,
        followUp2: null,
        followUp3: null,
      },
      "2026-01-18",
      "2026-01-12",
    );
    expect(schedule).toEqual({
      plannedCallDate: "2026-01-18",
      followUp1: null,
      followUp2: null,
      followUp3: null,
    });
  });
});

describe("clearCollectionCallsBeforePayment", () => {
  it("clears planned and follow-up dates older than the last payment", () => {
    expect(
      clearCollectionCallsBeforePayment(
        {
          plannedCallDate: "2026-01-29",
          followUp1: "2026-01-18",
          followUp2: "2026-01-20",
          followUp3: "2026-01-24",
        },
        "2026-01-21",
      ),
    ).toEqual({
      plannedCallDate: "2026-01-29",
      followUp1: "2026-01-24",
      followUp2: null,
      followUp3: null,
    });

    expect(
      clearCollectionCallsBeforePayment(
        {
          plannedCallDate: "2026-01-29",
          followUp1: "2026-01-18",
          followUp2: "2026-01-20",
          followUp3: "2026-01-24",
        },
        "2026-01-30",
      ),
    ).toEqual(empty);
  });

  it("clears the last payment date and every earlier date", () => {
    expect(
      clearCollectionCallsBeforePayment(
        {
          plannedCallDate: "2026-11-23",
          followUp1: "2026-11-20",
          followUp2: "2026-11-22",
          followUp3: "2026-11-22",
        },
        "2026-11-22",
      ),
    ).toEqual({
      plannedCallDate: "2026-11-23",
      followUp1: null,
      followUp2: null,
      followUp3: null,
    });
  });

  it("keeps each follow-up date in only one column", () => {
    expect(
      clearCollectionCallsBeforePayment(
        {
          plannedCallDate: "2026-11-26",
          followUp1: "2026-11-22",
          followUp2: "2026-11-22",
          followUp3: "2026-11-24",
        },
        null,
      ),
    ).toEqual({
      plannedCallDate: "2026-11-26",
      followUp1: "2026-11-22",
      followUp2: "2026-11-24",
      followUp3: null,
    });
  });

  it("does not shift a planned date that the last payment already cleared", () => {
    const schedule = applyPlannedCollectionCallChange({
      schedule: {
        plannedCallDate: "2026-01-15",
        followUp1: "2026-01-10",
        followUp2: null,
        followUp3: null,
      },
      nextPlannedCallDate: "2026-01-25",
      changedOn: "2026-01-22",
      lastPaymentDate: "2026-01-20",
    });
    expect(schedule).toEqual({
      plannedCallDate: "2026-01-25",
      followUp1: null,
      followUp2: null,
      followUp3: null,
    });
  });
});

describe("planned call date", () => {
  it("rejects a date before the day it is set", () => {
    expect(() =>
      applyPlannedCollectionCallChange({
        schedule: empty,
        nextPlannedCallDate: "2026-01-10",
        changedOn: "2026-01-11",
        lastPaymentDate: null,
      }),
    ).toThrow("Planned call date cannot be in the past");
  });
});

describe("applyPlannedSaleCallChange", () => {
  it("uses the same follow-up shift while order in hand is not above 0 MT", () => {
    let schedule = applyPlannedSaleCallChange({
      schedule: empty,
      nextPlannedCallDate: "2026-01-15",
      changedOn: "2026-01-11",
      orderInHand: null,
      lastPaymentDate: null,
    });
    schedule = applyPlannedSaleCallChange({
      schedule,
      nextPlannedCallDate: "2026-01-18",
      changedOn: "2026-01-15",
      orderInHand: "0",
      lastPaymentDate: null,
    });
    expect(schedule).toEqual({
      plannedCallDate: "2026-01-18",
      followUp1: "2026-01-15",
      followUp2: null,
      followUp3: null,
    });
  });

  it("clears the planned call and follow-ups when order in hand is above 0 MT", () => {
    const schedule = applyPlannedSaleCallChange({
      schedule: {
        plannedCallDate: "2026-01-29",
        followUp1: "2026-01-18",
        followUp2: "2026-01-20",
        followUp3: "2026-01-24",
      },
      nextPlannedCallDate: "2026-02-02",
      changedOn: "2026-01-29",
      orderInHand: "6.5",
      lastPaymentDate: null,
    });
    expect(schedule).toEqual(empty);
  });
});

describe("collectionChangeDate", () => {
  it("uses the India calendar day", () => {
    expect(collectionChangeDate(new Date("2026-01-15T18:00:00.000Z"))).toBe(
      "2026-01-15",
    );
    expect(collectionChangeDate(new Date("2026-01-15T20:30:00.000Z"))).toBe(
      "2026-01-16",
    );
  });
});
