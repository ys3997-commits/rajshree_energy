import {
  DiscountStatus,
  PaymentDirection,
  type Prisma,
} from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal, type DecimalLike } from "@/lib/domain/computations";
import { prisma } from "@/lib/prisma";

/**
 * Billed MT for an order: contracted quantity minus closing quantity when set,
 * otherwise dispatched quantity (open orders).
 */
export function billQuantity(
  quantity: DecimalLike | null | undefined,
  dispatchedOrder: DecimalLike | null | undefined = null,
  closingQuantity: DecimalLike | null | undefined = null,
): Decimal | null {
  if (quantity != null) {
    const qty = toDecimal(quantity);
    if (!qty.isFinite()) return null;
    const closing =
      closingQuantity == null ? new Decimal(0) : toDecimal(closingQuantity);
    const billable = qty.minus(closing.isFinite() ? closing : 0);
    return billable.isFinite() && billable.gte(0) ? billable : null;
  }
  if (dispatchedOrder == null) return null;
  const dispatched = toDecimal(dispatchedOrder);
  if (!dispatched.isFinite() || dispatched.lte(0)) return null;
  return dispatched;
}

/** finalRate × bill quantity when both are present; otherwise 0. */
export function billedAmount(
  finalRate: DecimalLike | null | undefined,
  quantity: DecimalLike | null | undefined,
  dispatchedOrder: DecimalLike | null | undefined = null,
  closingQuantity: DecimalLike | null | undefined = null,
): Decimal {
  if (finalRate == null) return new Decimal(0);
  const qty = billQuantity(quantity, dispatchedOrder, closingQuantity);
  if (qty == null) return new Decimal(0);
  const rate = toDecimal(finalRate);
  if (!rate.isFinite()) return new Decimal(0);
  return rate.mul(qty);
}

/** finalRate × dispatched quantity when both are present; otherwise 0. */
export function dispatchedAmount(
  finalRate: DecimalLike | null | undefined,
  dispatchedQuantity: DecimalLike | null | undefined,
): Decimal {
  if (finalRate == null || dispatchedQuantity == null) return new Decimal(0);
  const rate = toDecimal(finalRate);
  const qty = toDecimal(dispatchedQuantity);
  if (!rate.isFinite() || !qty.isFinite()) return new Decimal(0);
  return rate.mul(qty);
}

export function saleDispatchDueDelta(
  finalRate: DecimalLike | null | undefined,
  dispatchedQuantity: DecimalLike | null | undefined,
): Decimal {
  return dispatchedAmount(finalRate, dispatchedQuantity);
}

export function purchaseDispatchDueDelta(
  finalRate: DecimalLike | null | undefined,
  dispatchedQuantity: DecimalLike | null | undefined,
): Decimal {
  return dispatchedAmount(finalRate, dispatchedQuantity).neg();
}

/** RECEIVED decreases due; SENT increases due. */
export function paymentDueDelta(
  direction: PaymentDirection | "RECEIVED" | "SENT",
  amount: DecimalLike,
): Decimal {
  const amt = toDecimal(amount);
  if (direction === PaymentDirection.RECEIVED) {
    return amt.neg();
  }
  return amt;
}

/** RECEIVED increases due; PAID decreases due. */
export function discountDueDelta(
  status: DiscountStatus | "RECEIVED" | "PAID",
  amount: DecimalLike,
): Decimal {
  const amt = toDecimal(amount);
  if (status === DiscountStatus.PAID) {
    return amt.neg();
  }
  return amt;
}

export async function adjustCustomerDue(
  db: object,
  customerId: string,
  delta: DecimalLike,
): Promise<void> {
  const d = toDecimal(delta);
  if (d.isZero()) return;

  const client = db as Pick<Prisma.TransactionClient, "customer">;
  await client.customer.update({
    where: { id: customerId },
    data: { due: { increment: d } },
  });
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number): Date {
  const next = startOfUtcDay(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

type SaleSupplyLine = {
  amount: DecimalLike;
  supplyDate: Date;
};

/** Opening due is treated as supplied on 01/08/2026 for credit-window / overdue math. */
export const OPENING_DUE_DATE = new Date("2026-08-01T00:00:00.000Z");

/**
 * Sale amount supplied on or after (asOf − creditDays), inclusive.
 * Matches credit period: supply on day D stays current through D + creditDays.
 * Positive opening due is included as a supply on {@link OPENING_DUE_DATE}.
 */
export function sumSalesSuppliedInCreditWindow(
  lines: SaleSupplyLine[],
  creditDays: number,
  asOf: Date = new Date(),
  openingDue: DecimalLike | null | undefined = null,
): Decimal {
  if (creditDays <= 0) return new Decimal(0);

  const windowStart = addUtcDays(startOfUtcDay(asOf), -creditDays);
  let total = new Decimal(0);

  const allLines: SaleSupplyLine[] = [...lines];
  if (openingDue != null) {
    const opening = toDecimal(openingDue);
    if (opening.isFinite() && opening.gt(0)) {
      allLines.push({ amount: opening, supplyDate: OPENING_DUE_DATE });
    }
  }

  for (const line of allLines) {
    if (startOfUtcDay(line.supplyDate) < windowStart) continue;
    const amount = toDecimal(line.amount);
    if (amount.isFinite() && amount.gt(0)) {
      total = total.plus(amount);
    }
  }
  return total;
}

/**
 * Overdue = due − (opening due + sales) still inside the credit window.
 *
 * Due already equals:
 * openingDue + sale dispatches − purchase dispatches − received + sent
 * − discount paid + discount received.
 * Opening due is dated {@link OPENING_DUE_DATE} (01/08/2026).
 * Sales with no credit days are excluded from overdue (returns 0).
 */
export function computeOverdue(
  due: DecimalLike,
  creditDays: number | null | undefined,
  salesSuppliedInCreditWindow: DecimalLike,
): Decimal {
  if (creditDays == null) return new Decimal(0);

  const balance = toDecimal(due);
  if (!balance.isFinite()) return new Decimal(0);

  if (creditDays <= 0) {
    return balance.gt(0) ? balance.toDecimalPlaces(2) : new Decimal(0);
  }

  const overdue = balance.minus(toDecimal(salesSuppliedInCreditWindow));
  return overdue.gt(0) ? overdue.toDecimalPlaces(2) : new Decimal(0);
}

/**
 * Due movement after {@link dateTo} (exclusive). Subtract from live due to get
 * due as of that day: liveDue − these deltas. Cheaper than replaying history.
 */
export async function dueDeltasAfter(
  dateTo: string,
  customerId?: string,
): Promise<Map<string, Decimal>> {
  const after = new Date(`${dateTo}T23:59:59.999Z`);
  const dateWhere = { gt: after };

  const dispatchWhere: Prisma.DispatchWhereInput = {
    dispatchDate: dateWhere,
  };
  if (customerId) {
    dispatchWhere.OR = [
      { order: { customerId } },
      { purchaseOrder: { importerId: customerId } },
    ];
  }

  const dispatches = await prisma.dispatch.findMany({
    where: dispatchWhere,
    select: {
      dispatchedQuantity: true,
      order: { select: { customerId: true, finalRate: true } },
      purchaseOrder: { select: { importerId: true, finalRate: true } },
    },
  });
  const payments = await prisma.payment.findMany({
    where: {
      date: dateWhere,
      customerId: customerId ?? { not: null },
    },
    select: { customerId: true, amount: true, direction: true },
  });
  const discounts = await prisma.discount.findMany({
    where: {
      date: dateWhere,
      customerId: customerId ?? { not: null },
    },
    select: { customerId: true, amount: true, status: true },
  });

  const deltas = new Map<string, Decimal>();
  function addDelta(id: string, delta: Decimal) {
    if (delta.isZero()) return;
    const current = deltas.get(id) ?? new Decimal(0);
    deltas.set(id, current.plus(delta));
  }

  for (const row of dispatches) {
    if (row.order) {
      addDelta(
        row.order.customerId,
        saleDispatchDueDelta(row.order.finalRate, row.dispatchedQuantity),
      );
    }
    if (row.purchaseOrder) {
      addDelta(
        row.purchaseOrder.importerId,
        purchaseDispatchDueDelta(
          row.purchaseOrder.finalRate,
          row.dispatchedQuantity,
        ),
      );
    }
  }

  for (const payment of payments) {
    if (!payment.customerId) continue;
    addDelta(
      payment.customerId,
      paymentDueDelta(payment.direction, payment.amount),
    );
  }

  for (const discount of discounts) {
    if (!discount.customerId) continue;
    addDelta(
      discount.customerId,
      discountDueDelta(discount.status, discount.amount),
    );
  }

  return deltas;
}

export function dueAsOfFromLive(
  liveDue: DecimalLike,
  deltasAfter: Decimal | null | undefined,
): string {
  return toDecimal(liveDue)
    .minus(deltasAfter ?? 0)
    .toDecimalPlaces(2)
    .toString();
}

/**
 * Recompute every customer's due from opening due, dispatch-backed sales/purchases, and payments.
 */
export async function recalculateAllCustomerDues(): Promise<void> {
  const customers = await prisma.customer.findMany({
    select: { id: true, openingDue: true },
  });

  for (const customer of customers) {
    const [orders, purchaseOrders, payments, discounts] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: customer.id },
        select: {
          finalRate: true,
          quantity: true,
          dispatchedOrder: true,
          closingQuantity: true,
        },
      }),
      prisma.purchaseOrder.findMany({
        where: { importerId: customer.id },
        select: {
          finalRate: true,
          quantity: true,
          dispatchedOrder: true,
          closingQuantity: true,
        },
      }),
      prisma.payment.findMany({
        where: { customerId: customer.id },
        select: { direction: true, amount: true },
      }),
      prisma.discount.findMany({
        where: { customerId: customer.id },
        select: { status: true, amount: true },
      }),
    ]);

    let due = toDecimal(customer.openingDue);
    for (const order of orders) {
      due = due.plus(
        saleDispatchDueDelta(order.finalRate, order.dispatchedOrder),
      );
    }
    for (const po of purchaseOrders) {
      due = due.plus(
        purchaseDispatchDueDelta(po.finalRate, po.dispatchedOrder),
      );
    }
    for (const payment of payments) {
      due = due.plus(paymentDueDelta(payment.direction, payment.amount));
    }
    for (const discount of discounts) {
      due = due.plus(discountDueDelta(discount.status, discount.amount));
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { due: due.toDecimalPlaces(2) },
    });
  }
}
