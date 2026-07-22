import { describe, expect, it } from "vitest";
import { formatLorryNumber, normalizeLorryNumber } from "./format";

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
