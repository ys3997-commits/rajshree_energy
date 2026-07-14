import {
  DispatchTerms,
  OrderStatus,
  OrderType,
  type Order,
  type PurchaseOrder,
  type Vessel,
} from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export type DecimalLike = Decimal | number | string;

export function toDecimal(value: DecimalLike): Decimal {
  return value instanceof Decimal ? value : new Decimal(value);
}

/** quantity - dispatchedOrder; null when quantity is null (open order). */
export function balanceOrder(order: {
  quantity: Decimal | null;
  dispatchedOrder: Decimal;
}): Decimal | null {
  if (order.quantity == null) return null;
  return order.quantity.minus(order.dispatchedOrder);
}

/** quantity - dispatchedQuantity */
export function balanceQuantity(vessel: {
  quantity: Decimal;
  dispatchedQuantity: Decimal;
}): Decimal {
  return vessel.quantity.minus(vessel.dispatchedQuantity);
}

/** rate * quantity * 0.18 when both present */
export function computeGst(order: {
  rate: Decimal | null;
  quantity: Decimal | null;
}): Decimal | null {
  if (order.rate == null || order.quantity == null) return null;
  return order.rate.mul(order.quantity).mul(new Decimal("0.18"));
}

/** dispatchedQuantity - receivingQuantity once receiving is set */
export function diffInQuantity(dispatch: {
  dispatchedQuantity: Decimal;
  receivingQuantity: Decimal | null;
}): Decimal | null {
  if (dispatch.receivingQuantity == null) return null;
  return dispatch.dispatchedQuantity.minus(dispatch.receivingQuantity);
}

export function computeOrderStatus(order: {
  orderType: OrderType;
  quantity: Decimal | null;
  dispatchedOrder: Decimal;
}): OrderStatus {
  if (order.orderType === OrderType.OPEN && order.quantity == null) {
    return OrderStatus.OPEN;
  }
  if (order.dispatchedOrder.isZero()) {
    return OrderStatus.PENDING;
  }
  if (order.quantity != null && order.dispatchedOrder.lt(order.quantity)) {
    return OrderStatus.PARTIALLY_DISPATCHED;
  }
  return OrderStatus.COMPLETED;
}

export function formatDecimal(value: Decimal | null | undefined): string {
  if (value == null) return "—";
  return value.toString();
}

export {
  formatDispatchTerms,
  formatMt,
  formatRs,
} from "@/lib/domain/format";

export type OrderWithComputed = Order & {
  balanceOrder: Decimal | null;
  gst: Decimal | null;
};

export type PurchaseOrderWithComputed = PurchaseOrder & {
  balanceOrder: Decimal | null;
};

export type VesselWithComputed = Vessel & {
  balanceQuantity: Decimal;
};

export function withOrderComputed<T extends Order>(order: T): T & {
  balanceOrder: Decimal | null;
  gst: Decimal | null;
} {
  return {
    ...order,
    balanceOrder: balanceOrder(order),
    gst: computeGst(order),
  };
}

export function withPurchaseOrderComputed<T extends PurchaseOrder>(
  order: T,
): T & {
  balanceOrder: Decimal | null;
} {
  return {
    ...order,
    balanceOrder: balanceOrder(order),
  };
}

export function withVesselComputed<T extends Vessel>(vessel: T): T & {
  balanceQuantity: Decimal;
} {
  return {
    ...vessel,
    balanceQuantity: balanceQuantity(vessel),
  };
}

/**
 * Goods sale rate per MT after stripping freight for FOR dispatches.
 * Ex-Port: sale rate is used as-is.
 */
export function effectiveSaleRate(args: {
  saleRate: Decimal | null;
  dispatchTerms: DispatchTerms;
  freight: Decimal | null;
}): Decimal | null {
  if (args.saleRate == null) return null;
  if (args.dispatchTerms === DispatchTerms.FOR) {
    if (args.freight == null) return null;
    return args.saleRate.minus(args.freight);
  }
  return args.saleRate;
}

/** Sale rate − purchase (cost) rate per MT when both present. FOR subtracts freight first. */
export function profitPerMt(args: {
  saleRate: Decimal | null;
  costRate: Decimal | null;
  dispatchTerms?: DispatchTerms;
  freight?: Decimal | null;
}): Decimal | null {
  const goodsRate =
    args.dispatchTerms != null
      ? effectiveSaleRate({
          saleRate: args.saleRate,
          dispatchTerms: args.dispatchTerms,
          freight: args.freight ?? null,
        })
      : args.saleRate;
  if (goodsRate == null || args.costRate == null) return null;
  return goodsRate.minus(args.costRate);
}

/** (effective saleRate − costRate) × qty when rates present. */
export function lineProfit(args: {
  saleRate: Decimal | null;
  costRate: Decimal | null;
  quantity: Decimal;
  dispatchTerms?: DispatchTerms;
  freight?: Decimal | null;
}): Decimal | null {
  const perMt = profitPerMt(args);
  if (perMt == null) return null;
  return perMt.mul(args.quantity);
}
