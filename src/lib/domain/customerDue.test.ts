import { describe, expect, it } from "vitest";
import {
  computeOverdue,
  discountDueDelta,
  dispatchedAmount,
  purchaseDispatchDueDelta,
  saleDispatchDueDelta,
  sumSalesSuppliedInCreditWindow,
} from "./customerDue";

describe("dispatch-based due math", () => {
  it("uses finalRate * dispatchedQuantity", () => {
    expect(dispatchedAmount(1203.6, 10).toString()).toBe("12036");
  });

  it("increases buyer due on sale dispatch", () => {
    expect(saleDispatchDueDelta(1203.6, 10).toString()).toBe("12036");
  });

  it("decreases purchaser due on purchase dispatch", () => {
    expect(purchaseDispatchDueDelta(1203.6, 10).toString()).toBe("-12036");
  });

  it("reverses due when a dispatch is reversed", () => {
    expect(saleDispatchDueDelta(1203.6, -10).toString()).toBe("-12036");
    expect(purchaseDispatchDueDelta(1203.6, -10).toString()).toBe("12036");
  });
});

describe("discount-based due math", () => {
  it("increases due on discount received", () => {
    expect(discountDueDelta("RECEIVED", 500).toString()).toBe("500");
  });

  it("decreases due on discount paid", () => {
    expect(discountDueDelta("PAID", 500).toString()).toBe("-500");
  });
});

describe("overdue = due − sales in credit window", () => {
  const asOf = new Date("2026-08-07T12:00:00.000Z");

  it("sums only supplies within the credit window", () => {
    const total = sumSalesSuppliedInCreditWindow(
      [
        { amount: 1000, supplyDate: new Date("2026-07-20T00:00:00.000Z") },
        { amount: 2000, supplyDate: new Date("2026-07-23T00:00:00.000Z") },
        { amount: 3000, supplyDate: new Date("2026-08-01T00:00:00.000Z") },
      ],
      15,
      asOf,
    );
    // window starts 2026-07-23; July 20 excluded
    expect(total.toString()).toBe("5000");
  });

  it("includes opening due dated 01/08/2026 when inside the window", () => {
    const total = sumSalesSuppliedInCreditWindow(
      [{ amount: 1000, supplyDate: new Date("2026-08-05T00:00:00.000Z") }],
      15,
      asOf,
      4000,
    );
    expect(total.toString()).toBe("5000");
  });

  it("excludes opening due when 01/08/2026 is outside the window", () => {
    const later = new Date("2026-08-20T12:00:00.000Z");
    const total = sumSalesSuppliedInCreditWindow(
      [{ amount: 1000, supplyDate: new Date("2026-08-18T00:00:00.000Z") }],
      15,
      later,
      4000,
    );
    // window starts 2026-08-05; opening 01/08 excluded
    expect(total.toString()).toBe("1000");
  });

  it("returns 0 when credit days is null", () => {
    expect(computeOverdue(10000, null, 2000).toString()).toBe("0");
  });

  it("subtracts recent sales from due", () => {
    // due 10000, recent 3000 → overdue 7000
    expect(computeOverdue(10000, 15, 3000).toString()).toBe("7000");
  });

  it("clamps overdue at zero when recent sales exceed due", () => {
    expect(computeOverdue(1000, 15, 5000).toString()).toBe("0");
  });

  it("treats creditDays 0 as fully overdue", () => {
    expect(computeOverdue(4500, 0, 2000).toString()).toBe("4500");
  });
});
