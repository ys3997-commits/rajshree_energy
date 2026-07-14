import { describe, expect, it } from "vitest";
import { DispatchTerms, OrderStatus, OrderType } from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import {
  balanceOrder,
  balanceQuantity,
  computeGst,
  computeOrderStatus,
  diffInQuantity,
  effectiveSaleRate,
  lineProfit,
  profitPerMt,
} from "./computations";

describe("computeOrderStatus", () => {
  it("returns OPEN for open orders with null quantity", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.OPEN,
        quantity: null,
        dispatchedOrder: new Decimal(50),
      }),
    ).toBe(OrderStatus.OPEN);
  });

  it("returns PENDING when nothing dispatched", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.REGULAR,
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(0),
      }),
    ).toBe(OrderStatus.PENDING);
  });

  it("returns PARTIALLY_DISPATCHED when under quantity", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.REGULAR,
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(40),
      }),
    ).toBe(OrderStatus.PARTIALLY_DISPATCHED);
  });

  it("returns COMPLETED when dispatched >= quantity", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.REGULAR,
        quantity: new Decimal(100),
        dispatchedOrder: new Decimal(100),
      }),
    ).toBe(OrderStatus.COMPLETED);
  });

  it("recomputes out of OPEN once quantity is set on an open order", () => {
    expect(
      computeOrderStatus({
        orderType: OrderType.OPEN,
        quantity: new Decimal(80),
        dispatchedOrder: new Decimal(50),
      }),
    ).toBe(OrderStatus.PARTIALLY_DISPATCHED);
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

  it("balanceQuantity subtracts dispatched", () => {
    expect(
      balanceQuantity({
        quantity: new Decimal(1000),
        dispatchedQuantity: new Decimal(200),
      }).toString(),
    ).toBe("800");
  });

  it("gst is rate * qty * 0.18", () => {
    expect(
      computeGst({
        rate: new Decimal(100),
        quantity: new Decimal(10),
      })?.toString(),
    ).toBe("180");
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
  it("detects order over-dispatch", () => {
    const bal = balanceOrder({
      quantity: new Decimal(100),
      dispatchedOrder: new Decimal(90),
    })!;
    const requested = new Decimal(20);
    expect(requested.gt(bal)).toBe(true);
  });

  it("detects purchase-order over-dispatch", () => {
    const bal = balanceOrder({
      quantity: new Decimal(50),
      dispatchedOrder: new Decimal(40),
    })!;
    const requested = new Decimal(15);
    expect(requested.gt(bal)).toBe(true);
  });

  it("detects vessel over-dispatch", () => {
    const bal = balanceQuantity({
      quantity: new Decimal(50),
      dispatchedQuantity: new Decimal(40),
    });
    const requested = new Decimal(15);
    expect(requested.gt(bal)).toBe(true);
  });

  it("allows open-order dispatch when quantity is null (skip order balance)", () => {
    const bal = balanceOrder({
      quantity: null,
      dispatchedOrder: new Decimal(0),
    });
    expect(bal).toBeNull();
    // createDispatch uses skipOrderBalanceCheck=true in this case
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
