import { PaymentDirection, type Prisma } from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal, type DecimalLike } from "@/lib/domain/computations";
import { prisma } from "@/lib/prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;

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

export async function adjustCustomerDue(
  db: DbClient,
  customerId: string,
  delta: DecimalLike,
): Promise<void> {
  const d = toDecimal(delta);
  if (d.isZero()) return;

  await db.customer.update({
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

type SaleForOverdue = {
  finalRate: DecimalLike | null;
  quantity: DecimalLike | null;
  dispatchedOrder: DecimalLike;
  closingQuantity?: DecimalLike | null;
  orderDate: Date | null;
  createdAt: Date;
  creditDays: number | null;
};

/**
 * Unpaid sale amount past credit period (FIFO allocation of RECEIVED payments).
 * Open orders use dispatched quantity when order quantity is still null.
 * Sales with no credit days are excluded from overdue.
 */
export function computeOverdue(
  sales: SaleForOverdue[],
  customerCreditDays: number | null | undefined,
  receivedPayments: DecimalLike[],
  asOf: Date = new Date(),
): Decimal {
  const today = startOfUtcDay(asOf);

  const lines = sales
    .map((sale) => {
      const amount = billedAmount(
        sale.finalRate,
        sale.quantity,
        sale.dispatchedOrder,
        sale.closingQuantity,
      );
      if (amount.lte(0)) return null;

      const creditDays = sale.creditDays ?? customerCreditDays;
      if (creditDays == null) return null;

      const basis = sale.orderDate ?? sale.createdAt;
      const dueDate = addUtcDays(basis, creditDays);
      const orderDate = startOfUtcDay(basis);

      return { amount, dueDate, orderDate };
    })
    .filter((line): line is NonNullable<typeof line> => line != null)
    .sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());

  let received = receivedPayments.reduce<Decimal>(
    (sum, amt) => sum.plus(toDecimal(amt)),
    new Decimal(0),
  );

  let overdue = new Decimal(0);
  for (const line of lines) {
    const applied = received.gte(line.amount) ? line.amount : received;
    received = received.minus(applied);
    const unpaid = line.amount.minus(applied);
    if (unpaid.gt(0) && line.dueDate < today) {
      overdue = overdue.plus(unpaid);
    }
  }

  return overdue.toDecimalPlaces(2);
}

/**
 * Recompute every customer's due from opening due, orders, purchase orders, and payments.
 * Open orders contribute finalRate × dispatchedOrder until quantity is set.
 */
export async function recalculateAllCustomerDues(): Promise<void> {
  const customers = await prisma.customer.findMany({
    select: { id: true, openingDue: true },
  });

  for (const customer of customers) {
    const [orders, purchaseOrders, payments] = await Promise.all([
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
    ]);

    let due = toDecimal(customer.openingDue);
    for (const order of orders) {
      due = due.plus(
        billedAmount(
          order.finalRate,
          order.quantity,
          order.dispatchedOrder,
          order.closingQuantity,
        ),
      );
    }
    for (const po of purchaseOrders) {
      due = due.minus(
        billedAmount(
          po.finalRate,
          po.quantity,
          po.dispatchedOrder,
          po.closingQuantity,
        ),
      );
    }
    for (const payment of payments) {
      due = due.plus(paymentDueDelta(payment.direction, payment.amount));
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { due: due.toDecimalPlaces(2) },
    });
  }
}
