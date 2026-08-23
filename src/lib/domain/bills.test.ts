import { describe, expect, it } from "vitest";
import {
  billDateRange,
  canReviewBill,
  canUploadBill,
  canViewBill,
  parseBillStatusFilter,
  parseBillTextFilter,
  parseIsoDay,
  validateBillFile,
  validateBillFiles,
  validateBillRemark,
  validateApproverName,
  validateInvoiceAmount,
  validateInvoiceIssuedBy,
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

describe("bill list filters", () => {
  it("parses ISO days and ignores junk", () => {
    expect(parseIsoDay("2026-08-20")).toBe("2026-08-20");
    expect(parseIsoDay(" 2026-08-20 ")).toBe("2026-08-20");
    expect(parseIsoDay("20/08/2026")).toBeNull();
    expect(parseIsoDay("")).toBeNull();
  });

  it("trims optional text filters", () => {
    expect(parseBillTextFilter(" Raj ")).toBe("Raj");
    expect(parseBillTextFilter("  ")).toBeNull();
  });

  it("builds an inclusive date range", () => {
    expect(billDateRange(null, null)).toEqual({});
    expect(billDateRange("2026-08-01", "2026-08-20")).toEqual({
      date: {
        gte: new Date("2026-08-01T00:00:00.000Z"),
        lte: new Date("2026-08-20T23:59:59.999Z"),
      },
    });
  });
});

describe("bill remarks and files", () => {
  it("requires a non-empty remark", () => {
    expect(() => validateBillRemark("  ", "Remark")).toThrow("Remark is required");
    expect(validateBillRemark(" Need payment ", "Remark")).toBe("Need payment");
  });

  it("requires invoice issuer and a positive amount", () => {
    expect(() => validateInvoiceIssuedBy("  ")).toThrow("Invoice issued by is required");
    expect(validateInvoiceIssuedBy(" acme logistics ")).toBe("acme logistics");
    expect(() => validateInvoiceAmount("")).toThrow("Invoice amount is required");
    expect(() => validateInvoiceAmount("0")).toThrow(/greater than zero/);
    expect(validateInvoiceAmount("1,250.50")).toBe("1250.50");
    expect(() => validateApproverName("  ")).toThrow("Approver name is required");
    expect(validateApproverName(" raj ")).toBe("raj");
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

  it("accepts several files and rejects too many", () => {
    expect(
      validateBillFiles([
        { name: "a.pdf", type: "application/pdf", size: 100 },
        { name: "b.jpg", type: "image/jpeg", size: 200 },
      ]),
    ).toHaveLength(2);

    expect(() =>
      validateBillFiles(
        Array.from({ length: 11 }, (_, i) => ({
          name: `${i}.pdf`,
          type: "application/pdf",
          size: 10,
        })),
      ),
    ).toThrow(/at most 10 documents/);
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
