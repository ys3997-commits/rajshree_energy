import { describe, expect, it } from "vitest";
import {
  inclusiveUtcDays,
  investmentPeriodPercent,
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

describe("investmentPeriodPercent", () => {
  it("formats percent against weighted capital", () => {
    expect(investmentPeriodPercent(200, "6226.23")).toBe("3.21%");
    expect(investmentPeriodPercent(null, "6226.23")).toBe("—");
    expect(investmentPeriodPercent(200, 0)).toBe("—");
  });
});
