import { describe, expect, it } from "vitest";
import {
  parseCorrectionStatus,
  validateCorrectionMessage,
} from "./corrections";

describe("validateCorrectionMessage", () => {
  it("trims and requires a message", () => {
    expect(validateCorrectionMessage("  wrong rate  ")).toBe("wrong rate");
    expect(() => validateCorrectionMessage("   ")).toThrow(
      /Correction message is required/,
    );
  });
});

describe("parseCorrectionStatus", () => {
  it("accepts known statuses only", () => {
    expect(parseCorrectionStatus("PENDING")).toBe("PENDING");
    expect(parseCorrectionStatus("DONE")).toBe("DONE");
    expect(parseCorrectionStatus("other")).toBeNull();
  });
});
