import { describe, expect, it } from "vitest";
import {
  approvalYearFromIsoDay,
  formatApprovalNumber,
  nextApprovalNumber,
  parseApprovalNumber,
} from "./approvalNumbers";

describe("approvalNumbers", () => {
  it("formats year-based approval numbers", () => {
    expect(formatApprovalNumber(2025, 1)).toBe("AN 2025-0001");
    expect(formatApprovalNumber(2026, 42)).toBe("AN 2026-0042");
  });

  it("parses approval numbers", () => {
    expect(parseApprovalNumber("AN 2025-0007")).toEqual({
      year: 2025,
      sequence: 7,
    });
    expect(parseApprovalNumber("an 2025-0007")).toEqual({
      year: 2025,
      sequence: 7,
    });
    expect(parseApprovalNumber("DN 0001")).toBeNull();
  });

  it("suggests the next number for a year", () => {
    expect(
      nextApprovalNumber(["AN 2025-0001", "AN 2026-0003", "AN 2025-0004"], 2025),
    ).toBe("AN 2025-0005");
    expect(nextApprovalNumber([], 2025)).toBe("AN 2025-0001");
  });

  it("reads the year from an ISO day", () => {
    expect(approvalYearFromIsoDay("2025-08-28")).toBe(2025);
  });
});
