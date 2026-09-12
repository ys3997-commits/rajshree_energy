import { describe, expect, it } from "vitest";
import { DispatchTerms } from "@/generated/prisma";
import { isUpdateSaleReceivingOverdue } from "./updateSale";

describe("isUpdateSaleReceivingOverdue", () => {
  const now = new Date("2026-09-11T06:30:00.000Z"); // 12:00 IST

  it("is false when receiving quantity is present", () => {
    expect(
      isUpdateSaleReceivingOverdue(
        {
          receivingQuantity: 10,
          dispatchTerms: DispatchTerms.FOR,
          dispatchDate: new Date("2026-09-01T00:00:00.000Z"),
        },
        now,
      ),
    ).toBe(false);
  });

  it("is false for Ex-Port even when receiving is blank", () => {
    expect(
      isUpdateSaleReceivingOverdue(
        {
          receivingQuantity: null,
          dispatchTerms: DispatchTerms.EX_PORT,
          dispatchDate: new Date("2026-09-01T00:00:00.000Z"),
        },
        now,
      ),
    ).toBe(false);
  });

  it("is true when the dispatch date is 4 IST days ago and received is blank", () => {
    expect(
      isUpdateSaleReceivingOverdue(
        {
          receivingQuantity: null,
          dispatchTerms: DispatchTerms.FOR,
          dispatchDate: new Date("2026-09-07T00:00:00.000Z"),
        },
        now,
      ),
    ).toBe(true);
  });

  it("is true when received is blank and the date is more than 4 IST days ago", () => {
    expect(
      isUpdateSaleReceivingOverdue(
        {
          receivingQuantity: null,
          dispatchTerms: DispatchTerms.FOR,
          dispatchDate: new Date("2026-09-06T00:00:00.000Z"),
        },
        now,
      ),
    ).toBe(true);
  });
});
