import { describe, expect, it } from "vitest";
import { tallyEntryDate, yesterdayInIndia } from "./tallyDate";

describe("tallyEntryDate", () => {
  const afternoonIst = new Date("2026-10-22T09:00:00.000Z");

  it("defaults to yesterday in India", () => {
    expect(yesterdayInIndia(afternoonIst)).toBe("2026-10-21");
    expect(tallyEntryDate(undefined, afternoonIst)).toBe("2026-10-21");
    expect(tallyEntryDate("", afternoonIst)).toBe("2026-10-21");
    expect(tallyEntryDate("not-a-date", afternoonIst)).toBe("2026-10-21");
  });

  it("keeps a single chosen date", () => {
    expect(tallyEntryDate("2026-10-01", afternoonIst)).toBe("2026-10-01");
  });

  it("uses the India date when UTC has already rolled over", () => {
    expect(yesterdayInIndia(new Date("2026-10-22T20:00:00.000Z"))).toBe(
      "2026-10-22",
    );
  });
});
