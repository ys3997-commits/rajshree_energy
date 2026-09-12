import { describe, expect, it } from "vitest";
import {
  inclusiveUtcDays,
  investmentPeriodPercent,
  periodReturnDelta,
  timeWeightedInvestedCapital,
} from "@/lib/domain/investmentPeriodReturn";

describe("inclusiveUtcDays", () => {
  it("counts inclusive calendar days", () => {
    expect(inclusiveUtcDays("2026-04-01", "2026-04-01")).toBe(1);
    expect(inclusiveUtcDays("2026-04-01", "2026-04-02")).toBe(2);
    expect(inclusiveUtcDays("2026-04-01", "2027-03-31")).toBe(365);
  });
});

describe("timeWeightedInvestedCapital", () => {
  it("uses opening due for the full period when there are no movements", () => {
    const capital = timeWeightedInvestedCapital({
      openingDue: 555,
      movements: [],
      periodStart: "2026-04-01",
      periodEnd: "2027-03-31",
    });
    expect(capital).toBe("555.00");
  });

  it("weights mid-period SENT funds only for invested days (Mahesh case)", () => {
    // 555 for full 365 days + 10000 from 2026-09-06 through 2027-03-31
    const investedDays = inclusiveUtcDays("2026-09-06", "2027-03-31");
    const expected = ((555 * 365 + 10000 * investedDays) / 365).toFixed(2);

    const capital = timeWeightedInvestedCapital({
      openingDue: 555,
      movements: [{ date: "2026-09-06", delta: 10000 }],
      periodStart: "2026-04-01",
      periodEnd: "2027-03-31",
    });

    expect(capital).toBe(expected);
  });

  it("ignores movements after the period end", () => {
    const capital = timeWeightedInvestedCapital({
      openingDue: 555,
      movements: [{ date: "2027-04-01", delta: 10000 }],
      periodStart: "2026-04-01",
      periodEnd: "2027-03-31",
    });
    expect(capital).toBe("555.00");
  });

  it("includes movements before the period in the opening balance", () => {
    const capital = timeWeightedInvestedCapital({
      openingDue: 555,
      movements: [{ date: "2026-03-01", delta: 10000 }],
      periodStart: "2026-04-01",
      periodEnd: "2027-03-31",
    });
    expect(capital).toBe("10555.00");
  });
});

describe("periodReturnDelta", () => {
  it("adds profit and interest received on the period end date", () => {
    expect(periodReturnDelta(12, 8)).toBe("20.00");
    expect(periodReturnDelta("12", "")).toBe("12.00");
    expect(periodReturnDelta(-5, 3)).toBe("-2.00");
  });
});

describe("period-end returns in invested capital", () => {
  it("adds profit and interest from the period end into later capital", () => {
    const received = periodReturnDelta(12, 8);
    const later = timeWeightedInvestedCapital({
      openingDue: 100,
      movements: [{ date: "2021-03-31", delta: received }],
      periodStart: "2021-04-01",
      periodEnd: "2022-03-31",
    });
    expect(later).toBe("120.00");
  });

  it("counts same-period returns only on the last day", () => {
    const received = periodReturnDelta(12, 8);
    const days = inclusiveUtcDays("2020-04-01", "2021-03-31");
    const expected = ((100 * (days - 1) + 120) / days).toFixed(2);
    const capital = timeWeightedInvestedCapital({
      openingDue: 100,
      movements: [{ date: "2021-03-31", delta: received }],
      periodStart: "2020-04-01",
      periodEnd: "2021-03-31",
    });
    expect(capital).toBe(expected);
  });
});

describe("investmentPeriodPercent", () => {
  it("formats percent against weighted capital", () => {
    expect(investmentPeriodPercent(200, "6226.23")).toBe("3.21%");
    expect(investmentPeriodPercent(null, "6226.23")).toBe("—");
    expect(investmentPeriodPercent(200, 0)).toBe("—");
  });

  it("uses profit / loss + interest", () => {
    expect(investmentPeriodPercent(12, 100, 8)).toBe("20.00%");
    expect(investmentPeriodPercent(null, 100, 8)).toBe("8.00%");
    expect(investmentPeriodPercent(12, 100, "")).toBe("12.00%");
  });
});
