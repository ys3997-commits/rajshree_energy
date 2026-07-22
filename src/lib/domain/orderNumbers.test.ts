import { describe, expect, it } from "vitest";
import {
  formatPurchaseOrderNumber,
  formatSaleOrderNumber,
  nextPurchaseOrderNumber,
  nextSaleOrderNumber,
  normalizePurchaseOrderNumber,
  normalizeSaleOrderNumber,
  parsePurchaseOrderSequence,
  parseSaleOrderSequence,
} from "./orderNumbers";

describe("orderNumbers", () => {
  it("formats sale and purchase numbers with four digits", () => {
    expect(formatSaleOrderNumber(1)).toBe("SO 0001");
    expect(formatPurchaseOrderNumber(42)).toBe("PO 0042");
  });

  it("parses current and legacy sale numbers", () => {
    expect(parseSaleOrderSequence("SO 0001")).toBe(1);
    expect(parseSaleOrderSequence("so 12")).toBe(12);
    expect(parseSaleOrderSequence("5")).toBe(5);
    expect(parseSaleOrderSequence("PO-2026-0001")).toBe(1);
    expect(parseSaleOrderSequence("ABC")).toBeNull();
  });

  it("parses current and legacy purchase numbers", () => {
    expect(parsePurchaseOrderSequence("PO 0001")).toBe(1);
    expect(parsePurchaseOrderSequence("PU-3")).toBe(3);
    expect(parsePurchaseOrderSequence("SO 0001")).toBeNull();
  });

  it("suggests the next number from mixed legacy values", () => {
    expect(nextSaleOrderNumber(["5", "SO 0010", "PO-2026-0001"])).toBe(
      "SO 0011",
    );
    expect(nextPurchaseOrderNumber(["PU-1", "PO 0005"])).toBe("PO 0006");
  });

  it("normalizes user input", () => {
    expect(normalizeSaleOrderNumber("so 1")).toBe("SO 0001");
    expect(normalizePurchaseOrderNumber("po 99")).toBe("PO 0099");
  });
});
