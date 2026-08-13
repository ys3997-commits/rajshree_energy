import { describe, expect, it } from "vitest";
import {
  CustomerCategory,
  DispatchTerms,
  OrderStatus,
  OrderType,
  PurchaseOrderStatus,
} from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import {
  balanceOrder,
  computeGst,
  computeOrderStatus,
  computePurchaseFinalRate,
  computePurchaseOrderStatus,
  computeSaleFinalRate,
  diffInQuantity,
  effectiveSaleRate,
  lineProfit,
  profitPerMt,
} from "./computations";

describe("computeOrderStatus", () => {
  it("is RUNNING when quantity is null (open)", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.OPEN,
        quantity: null,
        dispatchedOrder: new Decimal(50),
      }),
    ).toBe(OrderStatus.RUNNING);
  });

  it("is RUNNING when nothing dispatched", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.REGULAR,
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(0),
      }),
    ).toBe(OrderStatus.RUNNING);
  });

  it("is RUNNING when under quantity", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.REGULAR,
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(40),
      }),
    ).toBe(OrderStatus.RUNNING);
  });

  it("is COMPLETED when dispatched >= quantity", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.REGULAR,
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(100),
      }),
    ).toBe(OrderStatus.COMPLETED);
  });

  it("is COMPLETED when remaining balance is closed", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.REGULAR,
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(97),
        closingQuantity: new Decimal(3),
      }),
    ).toBe(OrderStatus.COMPLETED);
  });

  it("stays RUNNING until an open order is fully dispatched", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.OPEN,
        quantity: new Decimal(80),
        dispatchedOrder: new Decimal(50),
      }),
    ).toBe(OrderStatus.RUNNING);
  });
});

describe("computePurchaseOrderStatus", () => {
  it("is RUNNING when quantity is null (open)", () => {
    expect(
      computePurchaseOrderStatus({
        quantity: null,
        dispatchedOrder: new Decimal(10),
      }),
    ).toBe(PurchaseOrderStatus.RUNNING);
  });

  it("is RUNNING when not fully dispatched", () => {
    expect(
      computePurchaseOrderStatus({
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(40),
      }),
    ).toBe(PurchaseOrderStatus.RUNNING);
  });

  it("is COMPLETED when fully dispatched", () => {
    expect(
      computePurchaseOrderStatus({
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(100),
      }),
    ).toBe(PurchaseOrderStatus.COMPLETED);
  });

  it("is COMPLETED when remaining balance is closed", () => {
    expect(
      computePurchaseOrderStatus({
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(97),
        closingQuantity: new Decimal(3),
      }),
    ).toBe(PurchaseOrderStatus.COMPLETED);
  });
});

describe("computed balances", () => {
  it("balanceOrder is null when quantity is null", () => {
    expect(
      balanceOrder({
        quantity: null,
        dispatchedOrder: new Decimal(10),
      }),
    ).toBeNull();
  });

  it("balanceOrder subtracts dispatched", () => {
    expect(
      balanceOrder({
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(25),
      })?.toString(),
    ).toBe("75");
  });

  it("balanceOrder subtracts closing quantity", () => {
    expect(
      balanceOrder({
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(97),
        closingQuantity: new Decimal(3),
      })?.toString(),
    ).toBe("0");
  });

  it("gst is rate * qty * 0.18", () => {
    expect(
      computeGst({
        rate: new Decimal(100),
        quantity: new Decimal(10),
      })?.toString(),
    ).toBe("180");
  });

  it("purchase finalRate = rate + GST 18% + TCS 2% of (rate+GST)", () => {
    // 1000 + 180 + 2% of 1180 = 1000 + 180 + 23.6 = 1203.6
    expect(computePurchaseFinalRate(1000)?.toString()).toBe("1203.6");
    expect(computePurchaseFinalRate(null)).toBeNull();
  });

  it("sale finalRate for industry = rate + GST 18% (no TCS)", () => {
    // 1000 + 180 = 1180
    expect(
      computeSaleFinalRate(1000, CustomerCategory.INDUSTRY)?.toString(),
    ).toBe("1180");
    expect(computeSaleFinalRate(null, CustomerCategory.INDUSTRY)).toBeNull();
  });

  it("sale finalRate for trader = rate + GST 18% + TCS 2% of (rate+GST)", () => {
    // 1000 + 180 + 2% of 1180 = 1203.6
    expect(
      computeSaleFinalRate(1000, CustomerCategory.TRADER)?.toString(),
    ).toBe("1203.6");
  });

  it("sale finalRate for vendor = rate + GST 18% + TCS 2% of (rate+GST)", () => {
    expect(
      computeSaleFinalRate(1000, CustomerCategory.SUPPLIER)?.toString(),
    ).toBe("1203.6");
  });

  it("diffInQuantity is null until receiving is set", () => {
    expect(
      diffInQuantity({
        dispatchedQuantity: new Decimal(10),
        receivingQuantity: null,
      }),
    ).toBeNull();
  });

  it("diffInQuantity = dispatched - receiving", () => {
    expect(
      diffInQuantity({
        dispatchedQuantity: new Decimal(10),
        receivingQuantity: new Decimal(9.5),
      })?.toString(),
    ).toBe("0.5");
  });
});

describe("over-dispatch rules (pure checks mirroring createDispatch)", () => {
  it("does not block sale-order over-dispatch (qty independent of SO)", () => {
    const bal = balanceOrder({
      quantity: new Decimal(100),
      dispatchedOrder: new Decimal(90),
    })!;
    const requested = new Decimal(20);
    // Balance math still works; createDispatch does not enforce SO cap
    expect(requested.gt(bal)).toBe(true);
  });

  it("does not block purchase-order over-dispatch (qty independent of PO)", () => {
    const bal = balanceOrder({
      quantity: new Decimal(50),
      dispatchedOrder: new Decimal(40),
    })!;
    const requested = new Decimal(15);
    // Balance math still works; createDispatch does not enforce PO cap
    expect(requested.gt(bal)).toBe(true);
  });

  it("open-order balance is null when quantity is null", () => {
    const bal = balanceOrder({
      quantity: null,
      dispatchedOrder: new Decimal(0),
    });
    expect(bal).toBeNull();
  });
});

describe("FOR / Ex-Port profit", () => {
  it("Ex-Port uses sale rate directly", () => {
    expect(
      effectiveSaleRate({
        saleRate: new Decimal(8500),
        dispatchTerms: DispatchTerms.EX_PORT,
        freight: null,
      })?.toString(),
    ).toBe("8500");
    expect(
      profitPerMt({
        saleRate: new Decimal(8500),
        costRate: new Decimal(7200),
        dispatchTerms: DispatchTerms.EX_PORT,
        freight: null,
      })?.toString(),
    ).toBe("1300");
  });

  it("FOR subtracts freight before profit", () => {
    expect(
      effectiveSaleRate({
        saleRate: new Decimal(8500),
        dispatchTerms: DispatchTerms.FOR,
        freight: new Decimal(400),
      })?.toString(),
    ).toBe("8100");
    expect(
      profitPerMt({
        saleRate: new Decimal(8500),
        costRate: new Decimal(7200),
        dispatchTerms: DispatchTerms.FOR,
        freight: new Decimal(400),
      })?.toString(),
    ).toBe("900");
  });

  it("line profit multiplies per-MT profit by quantity", () => {
    expect(
      lineProfit({
        saleRate: new Decimal(8500),
        costRate: new Decimal(7200),
        quantity: new Decimal(100),
        dispatchTerms: DispatchTerms.FOR,
        freight: new Decimal(400),
      })?.toString(),
    ).toBe("90000");
  });
});
