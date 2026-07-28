import { describe, expect, it } from "vitest";
import {
  dispatchedAmount,
  purchaseDispatchDueDelta,
  saleDispatchDueDelta,
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
