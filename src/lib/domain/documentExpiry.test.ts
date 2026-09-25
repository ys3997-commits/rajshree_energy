import { describe, expect, it } from "vitest";
import {
  addCalendarMonths,
  ddMmYyyyFromExpiryIso,
  documentExpiryStatus,
  expiryIsoFromDdMmYyyy,
  maskExpiryDateInput,
} from "./documentExpiry";

describe("member document expiry", () => {
  it("masks typing into dd/mm/yyyy", () => {
    expect(maskExpiryDateInput("25092026")).toBe("25/09/2026");
    expect(maskExpiryDateInput("25/09")).toBe("25/09");
  });

  it("parses a real dd/mm/yyyy date", () => {
    expect(expiryIsoFromDdMmYyyy("25/09/2026")).toBe("2026-09-25");
    expect(expiryIsoFromDdMmYyyy("31/02/2026")).toBeNull();
    expect(ddMmYyyyFromExpiryIso("2026-09-25")).toBe("25/09/2026");
  });

  it("picks the closest expiry status", () => {
    const today = "2026-09-25";
    expect(documentExpiryStatus("2026-09-24", today)).toBe("expired");
    expect(documentExpiryStatus("2026-09-25", today)).toBe("within-30-days");
    expect(documentExpiryStatus("2026-10-25", today)).toBe("within-30-days");
    expect(documentExpiryStatus("2026-10-26", today)).toBe("within-6-months");
    expect(documentExpiryStatus(addCalendarMonths(today, 6), today)).toBe(
      "within-6-months",
    );
    expect(documentExpiryStatus("2027-03-26", today)).toBe("valid");
  });
});