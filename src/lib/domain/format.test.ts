import { describe, expect, it } from "vitest";
import { formatLorryNumber, formatIndianNumber, formatMt, formatRs, normalizeLorryNumber } from "./format";

describe("formatIndianNumber", () => {
  it("uses Indian grouping for integers", () => {
    expect(formatIndianNumber(100000)).toBe("1,00,000");
    expect(formatIndianNumber(1000)).toBe("1,000");
    expect(formatIndianNumber(12)).toBe("12");
  });

  it("uses Indian grouping with fixed decimals", () => {
    expect(formatIndianNumber(100000.5, 2)).toBe("1,00,000.50");
    expect(formatIndianNumber(1234.5, 2)).toBe("1,234.50");
  });

  it("returns em dash for empty values", () => {
    expect(formatIndianNumber(null)).toBe("—");
    expect(formatIndianNumber("")).toBe("—");
  });
});

describe("formatMt / formatRs", () => {
  it("formats as rounded integers with Indian grouping", () => {
    expect(formatMt(100000)).toBe("1,00,000");
    expect(formatMt(1234.6)).toBe("1,235");
    expect(formatRs(100000)).toBe("Rs 1,00,000");
    expect(formatRs(99.4)).toBe("Rs 99");
  });
});

describe("normalizeLorryNumber", () => {
  it("formats alphanumeric prefix and 4 trailing digits", () => {
    expect(normalizeLorryNumber("WBAS2N1234")).toBe("WBAS2N-1234");
    expect(normalizeLorryNumber("wbas2n-1234")).toBe("WBAS2N-1234");
    expect(normalizeLorryNumber("WBAS2N 1234")).toBe("WBAS2N-1234");
  });

  it("rejects when trailing digits are not exactly 4", () => {
    expect(() => normalizeLorryNumber("WBAS2N123")).toThrow(/exactly 4 digits/);
    expect(() => normalizeLorryNumber("WBAS2N12345")).toThrow(/exactly 4 digits/);
    expect(() => normalizeLorryNumber("1234")).toThrow(/exactly 4 digits/);
  });

  it("returns null for empty values", () => {
    expect(normalizeLorryNumber(null)).toBeNull();
    expect(normalizeLorryNumber("")).toBeNull();
    expect(normalizeLorryNumber("   ")).toBeNull();
    expect(normalizeLorryNumber(undefined)).toBeUndefined();
  });
});

describe("formatLorryNumber", () => {
  it("formats valid numbers and leaves invalid as uppercase", () => {
    expect(formatLorryNumber("wbas2n1234")).toBe("WBAS2N-1234");
    expect(formatLorryNumber("bad")).toBe("BAD");
    expect(formatLorryNumber(null)).toBeNull();
  });
});
