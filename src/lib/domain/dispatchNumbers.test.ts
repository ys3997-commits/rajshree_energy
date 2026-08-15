import { describe, expect, it } from "vitest";
import {
  displayDispatchNumber,
  formatDispatchNumber,
  nextDispatchNumber,
  normalizeDispatchNumber,
  parseDispatchSequence,
} from "./dispatchNumbers";

describe("dispatchNumbers", () => {
  it("formats serials with four digits", () => {
    expect(formatDispatchNumber(1)).toBe("DN 0001");
    expect(formatDispatchNumber(42)).toBe("DN 0042");
  });

  it("parses DN and plain numeric values", () => {
    expect(parseDispatchSequence("DN 0001")).toBe(1);
    expect(parseDispatchSequence("dn 12")).toBe(12);
    expect(parseDispatchSequence("5")).toBe(5);
    expect(parseDispatchSequence(null)).toBeNull();
    expect(parseDispatchSequence("ABC")).toBeNull();
  });

  it("suggests the next number from mixed values", () => {
    expect(nextDispatchNumber(["DN 0001", "7", null])).toBe("DN 0008");
    expect(nextDispatchNumber([])).toBe("DN 0001");
  });

  it("normalizes user input", () => {
    expect(normalizeDispatchNumber("dn 1")).toBe("DN 0001");
    expect(normalizeDispatchNumber("99")).toBe("DN 0099");
  });

  it("displays padded digits", () => {
    expect(displayDispatchNumber("DN 0003")).toBe("0003");
    expect(displayDispatchNumber(null)).toBe("—");
  });
});
