import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";
import {
  ageingBucketKey,
  bucketUnpaidDue,
  unpaidDueByDate,
  utcDayDiff,
} from "./ageing";

const asOf = new Date("2026-08-17T12:00:00.000Z");

function d(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

describe("ageing buckets", () => {
  it("counts today as 1–10 days", () => {
    expect(utcDayDiff(d("2026-08-17"), asOf)).toBe(0);
    expect(ageingBucketKey(0)).toBe("d1_10");
    expect(ageingBucketKey(1)).toBe("d1_10");
    expect(ageingBucketKey(10)).toBe("d1_10");
  });

  it("splits later windows on 10-day boundaries", () => {
    expect(ageingBucketKey(11)).toBe("d11_20");
    expect(ageingBucketKey(20)).toBe("d11_20");
    expect(ageingBucketKey(21)).toBe("d21_30");
    expect(ageingBucketKey(120)).toBe("d111_120");
    expect(ageingBucketKey(121)).toBe("d121_plus");
    expect(ageingBucketKey(400)).toBe("d121_plus");
  });
});

describe("FIFO unpaid due", () => {
  it("applies a later receipt to the oldest sale first", () => {
    const unpaid = unpaidDueByDate(
      [
        { date: d("2026-07-01"), amount: 1000 },
        { date: d("2026-08-01"), amount: 400 },
        { date: d("2026-08-10"), amount: -600 },
      ],
      asOf,
    );
    expect(unpaid.map((row) => [row.date.toISOString().slice(0, 10), row.amount.toString()])).toEqual([
      ["2026-07-01", "400"],
      ["2026-08-01", "400"],
    ]);
  });

  it("lets a same-day receipt clear that day's sale", () => {
    const unpaid = unpaidDueByDate(
      [
        { date: d("2026-08-10"), amount: 500, sortKey: "sale" },
        { date: d("2026-08-10"), amount: -500, sortKey: "pay" },
      ],
      asOf,
    );
    expect(unpaid).toEqual([]);
  });

  it("applies an earlier receipt to later sales", () => {
    const unpaid = unpaidDueByDate(
      [
        { date: d("2026-08-10"), amount: -2_300_000 },
        { date: d("2026-08-12"), amount: 2_493_994 },
      ],
      asOf,
    );
    expect(unpaid).toHaveLength(1);
    expect(unpaid[0].amount.toString()).toBe("193994");
  });

  it("ignores movements after the as-of date", () => {
    const unpaid = unpaidDueByDate(
      [
        { date: d("2026-08-01"), amount: 300 },
        { date: d("2026-08-20"), amount: 900 },
      ],
      asOf,
    );
    expect(unpaid).toHaveLength(1);
    expect(unpaid[0].amount.toString()).toBe("300");
  });
});

describe("bucketUnpaidDue", () => {
  it("places remaining amounts in the matching day window", () => {
    const aged = bucketUnpaidDue(
      [
        { date: d("2026-08-10"), amount: new Decimal(100) },
        { date: d("2026-07-27"), amount: new Decimal(250) },
        { date: d("2026-04-01"), amount: new Decimal(80) },
      ],
      asOf,
    );
    expect(aged.buckets.d1_10.toString()).toBe("100");
    expect(aged.buckets.d21_30.toString()).toBe("250");
    expect(aged.buckets.d121_plus.toString()).toBe("80");
    expect(aged.totalDue.toString()).toBe("430");
  });
});
