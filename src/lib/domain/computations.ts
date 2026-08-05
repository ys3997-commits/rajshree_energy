import {
  CustomerCategory,
  DispatchTerms,
  OrderStatus,
  OrderType,
  PurchaseOrderStatus,
  type Order,
  type PurchaseOrder,
} from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { PURCHASE_GST_RATE, PURCHASE_TCS_RATE } from "@/lib/domain/purchaseRate";
import { SALE_GST_RATE, SALE_TCS_RATE, saleTcsApplies } from "@/lib/domain/saleRate";

export type DecimalLike = Decimal | number | string;

export function toDecimal(value: DecimalLike): Decimal {
  return value instanceof Decimal ? value : new Decimal(value);
}

/** quantity - dispatchedOrder - closingQuantity; null when quantity is null (open order). */
export function balanceOrder(order: {
  quantity: Decimal | null;
  dispatchedOrder: Decimal;
  closingQuantity?: Decimal | null;
}): Decimal | null {
  if (order.quantity == null) return null;
  const closing = order.closingQuantity ?? new Decimal(0);
  return order.quantity.minus(order.dispatchedOrder).minus(closing);
}

/** rate * quantity * 0.18 when both present */
export function computeGst(order: {
  rate: Decimal | null;
  quantity: Decimal | null;
}): Decimal | null {
  if (order.rate == null || order.quantity == null) return null;
  return order.rate.mul(order.quantity).mul(new Decimal("0.18"));
}

const GST_RATE = new Decimal(String(PURCHASE_GST_RATE));
const TCS_RATE = new Decimal(String(PURCHASE_TCS_RATE));
const SALE_GST = new Decimal(String(SALE_GST_RATE));
const SALE_TCS = new Decimal(String(SALE_TCS_RATE));

/**
 * Purchase all-in rate per MT from base rate:
 * GST = 18% of rate; TCS = 2% of (rate + GST); final = rate + GST + TCS.
 */
export function computePurchaseFinalRate(
  rate: DecimalLike | null | undefined,
): Decimal | null {
  if (rate === undefined || rate === null || rate === "") return null;
  const base = toDecimal(rate);
  const gst = base.mul(GST_RATE);
  const tcs = base.plus(gst).mul(TCS_RATE);
  return base.plus(gst).plus(tcs);
}

/**
 * Sale all-in rate per MT from basic rate and customer category:
 * GST = 18% of rate; vendors and traders also add TCS = 2% of (rate + GST).
 */
export function computeSaleFinalRate(
  rate: DecimalLike | null | undefined,
  category: CustomerCategory | null | undefined,
): Decimal | null {
  if (rate === undefined || rate === null || rate === "") return null;
  const base = toDecimal(rate);
  const gst = base.mul(SALE_GST);
  const withGst = base.plus(gst);
  if (saleTcsApplies(category)) {
    return withGst.plus(withGst.mul(SALE_TCS));
  }
  return withGst;
}

/** Prefer finalRate (all-in) for sale revenue; fall back to base rate. */
export function saleRevenueRate(order: {
  rate: Decimal | null;
  finalRate?: Decimal | null;
}): Decimal | null {
  if (order.finalRate != null) return order.finalRate;
  return order.rate;
}

/** dispatchedQuantity - receivingQuantity once receiving is set.
 * Ex-Port: received equals weight, so diff is always 0. */
export function diffInQuantity(dispatch: {
  dispatchedQuantity: Decimal;
  receivingQuantity: Decimal | null;
  dispatchTerms?: DispatchTerms | null;
}): Decimal | null {
  if (dispatch.dispatchTerms === DispatchTerms.EX_PORT) {
    return new Decimal(0);
  }
  if (dispatch.receivingQuantity == null) return null;
  return dispatch.dispatchedQuantity.minus(dispatch.receivingQuantity);
}

/** Effective received qty — Ex-Port uses dispatched weight. */
export function effectiveReceivingQuantity(dispatch: {
  dispatchedQuantity: Decimal;
  receivingQuantity: Decimal | null;
  dispatchTerms?: DispatchTerms | null;
}): Decimal | null {
  if (dispatch.dispatchTerms === DispatchTerms.EX_PORT) {
    return dispatch.dispatchedQuantity;
  }
  return dispatch.receivingQuantity;
}

export function computeOrderStatus(order: {
  orderType?: OrderType;
  quantity: Decimal | null;
  dispatchedOrder: Decimal;
  closingQuantity?: Decimal | null;
}): OrderStatus {
  const bal = balanceOrder({
    quantity: order.quantity,
    dispatchedOrder: order.dispatchedOrder,
    closingQuantity: order.closingQuantity,
  });
  if (bal != null && !bal.gt(0)) {
    return OrderStatus.COMPLETED;
  }
  return OrderStatus.RUNNING;
}

/**
 * Purchase orders are Running until quantity is set and balance is zero
 * (fully dispatched and/or closed).
 */
export function computePurchaseOrderStatus(order: {
  quantity: Decimal | null;
  dispatchedOrder: Decimal;
  closingQuantity?: Decimal | null;
}): PurchaseOrderStatus {
  const bal = balanceOrder({
    quantity: order.quantity,
    dispatchedOrder: order.dispatchedOrder,
    closingQuantity: order.closingQuantity,
  });
  if (bal != null && !bal.gt(0)) {
    return PurchaseOrderStatus.COMPLETED;
  }
  return PurchaseOrderStatus.RUNNING;
}

export function formatDecimal(value: Decimal | null | undefined): string {
  if (value == null) return "—";
  return value.toString();
}

export {
  formatDispatchTerms,
  formatMt,
  formatPurchaseOrderStatus,
  formatRs,
} from "@/lib/domain/format";

export type OrderWithComputed = Order & {
  balanceOrder: Decimal | null;
  gst: Decimal | null;
};

export type PurchaseOrderWithComputed = PurchaseOrder & {
  balanceOrder: Decimal | null;
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

/** Prefer finalRate (all-in) for costing; fall back to base rate. */
export function purchaseCostRate(order: {
  rate: Decimal | null;
  finalRate?: Decimal | null;
}): Decimal | null {
  if (order.finalRate != null) return order.finalRate;
  return order.rate;
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
