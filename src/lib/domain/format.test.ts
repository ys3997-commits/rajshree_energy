import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatLorryNumber,
  formatIndianAmountTyping,
  formatIndianNumber,
  formatMt,
  formatOrderStatusForDisplay,
  formatSaleOrderMt,
  formatRs,
  normalizeLorryNumber,
} from "./format";

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

describe("formatIndianAmountTyping", () => {
  it("formats with Indian commas while typing", () => {
    expect(formatIndianAmountTyping("1000000")).toBe("10,00,000");
    expect(formatIndianAmountTyping("100000")).toBe("1,00,000");
    expect(formatIndianAmountTyping("1000000.5")).toBe("10,00,000.5");
    expect(formatIndianAmountTyping("1000000.50")).toBe("10,00,000.50");
  });

  it("keeps a trailing decimal while typing", () => {
    expect(formatIndianAmountTyping("10.")).toBe("10.");
  });
});

describe("formatAmount / formatRs", () => {
  it("formats integers with Indian grouping", () => {
    expect(formatAmount(100000)).toBe("1,00,000");
    expect(formatAmount(99.4)).toBe("99");
  });

  it("formatRs adds prefix", () => {
    expect(formatRs(100000)).toBe("Rs 1,00,000");
    expect(formatRs(99.4)).toBe("Rs 99");
  });
});

describe("formatMt", () => {
  it("formats weights with two decimals and MT", () => {
    expect(formatMt(38.18)).toBe("38.18 MT");
    expect(formatMt(12.5)).toBe("12.50 MT");
    expect(formatMt(1234.567)).toBe("1234.57 MT");
    expect(formatMt(100000)).toBe("100000.00 MT");
    expect(formatMt(null)).toBe("—");
  });
});

describe("formatSaleOrderMt", () => {
  it("formats with two decimals, no grouping, and MT suffix", () => {
    expect(formatSaleOrderMt(12.5)).toBe("12.50 MT");
    expect(formatSaleOrderMt(1234.567)).toBe("1234.57 MT");
    expect(formatSaleOrderMt(100000)).toBe("100000.00 MT");
    expect(formatSaleOrderMt(null)).toBe("—");
  });
});

describe("formatDateDdMmYyyy", () => {
  it("formats ISO dates as DD/MM/YYYY", () => {
    expect(formatDateDdMmYyyy("2026-07-27")).toBe("27/07/2026");
    expect(formatDateDdMmYyyy("2026-07-27T12:00:00.000Z")).toBe("27/07/2026");
    expect(formatDateDdMmYyyy(null)).toBe("—");
  });
});

describe("formatDispatchMt", () => {
  it("formats with two decimals and MT suffix", () => {
    expect(formatDispatchMt(12.5)).toBe("12.50 MT");
    expect(formatDispatchMt(1234.567)).toBe("1234.57 MT");
    expect(formatDispatchMt(null)).toBe("—");
  });
});

describe("normalizeLorryNumber", () => {
  it("formats when last 4 characters are digits", () => {
    expect(normalizeLorryNumber("WBAS2N1234")).toBe("WBAS2N-1234");
    expect(normalizeLorryNumber("wbas2n-1234")).toBe("WBAS2N-1234");
    expect(normalizeLorryNumber("WBAS2N 1234")).toBe("WBAS2N-1234");
    expect(normalizeLorryNumber("1234")).toBe("1234");
    expect(normalizeLorryNumber("WBAS2N12345")).toBe("WBAS2N1-2345");
  });

  it("rejects when last 4 characters are not digits", () => {
    expect(() => normalizeLorryNumber("WBAS2N123")).toThrow(/end with 4 digits/);
    expect(() => normalizeLorryNumber("ABC")).toThrow(/end with 4 digits/);
    expect(() => normalizeLorryNumber("AB12")).toThrow(/end with 4 digits/);
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

describe("formatOrderStatusForDisplay", () => {
  it("is Running when displayed balance is greater than zero", () => {
    expect(
      formatOrderStatusForDisplay({
        orderType: "FIXED",
        quantity: 100,
        balanceOrder: 25,
        orderStatus: "COMPLETED",
      }),
    ).toBe("Running");
  });

  it("is Running when displayed balance is less than zero", () => {
    expect(
      formatOrderStatusForDisplay({
        orderType: "FIXED",
        quantity: 100,
        balanceOrder: -5,
        orderStatus: "COMPLETED",
      }),
    ).toBe("Running");
  });

  it("is Completed when displayed balance is zero", () => {
    expect(
      formatOrderStatusForDisplay({
        orderType: "FIXED",
        quantity: 100,
        balanceOrder: 0,
        orderStatus: "RUNNING",
      }),
    ).toBe("Completed");
  });

  it("is Completed for open orders with no quantity (balance shows 0)", () => {
    expect(
      formatOrderStatusForDisplay({
        orderType: "OPEN",
        quantity: null,
        balanceOrder: null,
        orderStatus: "RUNNING",
      }),
    ).toBe("Completed");
  });
});
