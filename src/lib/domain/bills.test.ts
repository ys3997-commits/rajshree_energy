import { describe, expect, it } from "vitest";
import {
  canReviewBill,
  canUploadBill,
  canViewBill,
  parseBillStatusFilter,
  validateBillFile,
  validateBillRemark,
} from "./bills";

describe("parseBillStatusFilter", () => {
  it("treats empty and all as no filter", () => {
    expect(parseBillStatusFilter(undefined)).toBeNull();
    expect(parseBillStatusFilter("all")).toBeNull();
  });

  it("accepts pending, approved, and rejected", () => {
    expect(parseBillStatusFilter("pending")).toBe("PENDING");
    expect(parseBillStatusFilter("Approved")).toBe("APPROVED");
    expect(parseBillStatusFilter("REJECTED")).toBe("REJECTED");
  });

  it("ignores unknown values", () => {
    expect(parseBillStatusFilter("completed")).toBeNull();
  });
});

describe("bill remarks and files", () => {
  it("requires a non-empty remark", () => {
    expect(() => validateBillRemark("  ", "Remark")).toThrow("Remark is required");
    expect(validateBillRemark(" Need payment ", "Remark")).toBe("Need payment");
  });

  it("accepts a small PDF and rejects oversize or unknown types", () => {
    expect(
      validateBillFile({ name: "taxi.pdf", type: "application/pdf", size: 1200 }),
    ).toEqual({ fileName: "taxi.pdf", mime: "application/pdf" });

    expect(() =>
      validateBillFile({ name: "note.txt", type: "text/plain", size: 12 }),
    ).toThrow(/PDF or image/);

    expect(() =>
      validateBillFile({
        name: "scan.jpg",
        type: "image/jpeg",
        size: 5 * 1024 * 1024,
      }),
    ).toThrow(/4 MB/);
  });
});

describe("bill access", () => {
  it("lets staff upload and see only their own bills", () => {
    const staff = { kind: "staff", id: "s1" };
    expect(canUploadBill(staff)).toBe(true);
    expect(canViewBill(staff, "s1")).toBe(true);
    expect(canViewBill(staff, "s2")).toBe(false);
    expect(canReviewBill(staff, "PENDING")).toBe(false);
  });

  it("lets the owner see all bills and review pending ones", () => {
    const owner = { kind: "owner" };
    expect(canUploadBill(owner)).toBe(false);
    expect(canViewBill(owner, "s1")).toBe(true);
    expect(canReviewBill(owner, "PENDING")).toBe(true);
    expect(canReviewBill(owner, "REJECTED")).toBe(false);
  });
});
