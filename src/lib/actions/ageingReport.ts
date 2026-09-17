"use server";

import { CustomerCategory } from "@/generated/prisma";
import {
  bucketUnpaidDue,
  toAgeingReportRow,
  unpaidDueByDate,
  type AgeingMovement,
} from "@/lib/domain/ageing";
import {
  ageingBuyerCategory,
  type AgeingReportRow,
} from "@/lib/domain/ageingBuckets";
import { toDecimal } from "@/lib/domain/computations";
import {
  computeOverdue,
  discountDueDelta,
  dispatchedAmount,
  OPENING_DUE_DATE,
  paymentDueDelta,
  purchaseDispatchDueDelta,
  saleDispatchDueDelta,
  sumSalesSuppliedInCreditWindow,
} from "@/lib/domain/customerDue";
import { prisma } from "@/lib/prisma";

function addMovement(
  byCustomer: Map<string, AgeingMovement[]>,
  customerId: string,
  movement: AgeingMovement,
) {
  const amount = toDecimal(movement.amount);
  if (!amount.isFinite() || amount.isZero()) return;
  const list = byCustomer.get(customerId) ?? [];
  list.push(movement);
  byCustomer.set(customerId, list);
}

export async function listCustomerAgeingReport(): Promise<AgeingReportRow[]> {
  const customers = await prisma.customer.findMany({
    where: {
      category: {
        in: [CustomerCategory.INDUSTRY, CustomerCategory.TRADER],
      },
      due: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      category: true,
      sector: true,
      state: true,
      saleExecutive: true,
      openingDue: true,
      due: true,
      creditDays: true,
      dealingCompany: true,
      paymentInChargeName: true,
      paymentInChargeContact: true,
      ownerName: true,
      ownerContact: true,
    },
    orderBy: { name: "asc" },
  });

  if (customers.length === 0) return [];

  const ids = customers.map((customer) => customer.id);
  const [dispatches, payments, discounts] = await Promise.all([
    prisma.dispatch.findMany({
      where: {
        OR: [
          { order: { customerId: { in: ids } } },
          { purchaseOrder: { importerId: { in: ids } } },
        ],
      },
      select: {
        id: true,
        dispatchDate: true,
        dispatchedQuantity: true,
        createdAt: true,
        order: { select: { customerId: true, finalRate: true } },
        purchaseOrder: { select: { importerId: true, finalRate: true } },
      },
    }),
    prisma.payment.findMany({
      where: { customerId: { in: ids } },
      select: {
        id: true,
        customerId: true,
        date: true,
        amount: true,
        direction: true,
        createdAt: true,
      },
    }),
    prisma.discount.findMany({
      where: { customerId: { in: ids } },
      select: {
        id: true,
        customerId: true,
        date: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const movementsByCustomer = new Map<string, AgeingMovement[]>();
  const supplyLinesByCustomer = new Map<
    string,
    { amount: ReturnType<typeof toDecimal>; supplyDate: Date }[]
  >();

  for (const customer of customers) {
    addMovement(movementsByCustomer, customer.id, {
      date: OPENING_DUE_DATE,
      amount: customer.openingDue,
      sortKey: `0|opening|${customer.id}`,
    });
  }

  for (const row of dispatches) {
    if (row.order) {
      addMovement(movementsByCustomer, row.order.customerId, {
        date: row.dispatchDate,
        amount: saleDispatchDueDelta(row.order.finalRate, row.dispatchedQuantity),
        sortKey: `1|sale|${row.createdAt.toISOString()}|${row.id}`,
      });
      const amount = dispatchedAmount(
        row.order.finalRate,
        row.dispatchedQuantity,
      );
      if (amount.gt(0)) {
        const list = supplyLinesByCustomer.get(row.order.customerId) ?? [];
        list.push({ amount, supplyDate: row.dispatchDate });
        supplyLinesByCustomer.set(row.order.customerId, list);
      }
    }
    if (row.purchaseOrder) {
      addMovement(movementsByCustomer, row.purchaseOrder.importerId, {
        date: row.dispatchDate,
        amount: purchaseDispatchDueDelta(
          row.purchaseOrder.finalRate,
          row.dispatchedQuantity,
        ),
        sortKey: `2|purchase|${row.createdAt.toISOString()}|${row.id}`,
      });
    }
  }

  for (const payment of payments) {
    if (!payment.customerId) continue;
    addMovement(movementsByCustomer, payment.customerId, {
      date: payment.date,
      amount: paymentDueDelta(payment.direction, payment.amount),
      sortKey: `3|payment|${payment.createdAt.toISOString()}|${payment.id}`,
    });
  }

  for (const discount of discounts) {
    if (!discount.customerId) continue;
    addMovement(movementsByCustomer, discount.customerId, {
      date: discount.date,
      amount: discountDueDelta(discount.status, discount.amount),
      sortKey: `4|discount|${discount.createdAt.toISOString()}|${discount.id}`,
    });
  }

  const asOf = new Date();
  const rows: AgeingReportRow[] = [];

  for (const customer of customers) {
    const aged = bucketUnpaidDue(
      unpaidDueByDate(movementsByCustomer.get(customer.id) ?? [], asOf),
      asOf,
    );
    if (aged.totalDue.lte(0)) continue;
    const recentSales =
      customer.creditDays == null
        ? toDecimal(0)
        : sumSalesSuppliedInCreditWindow(
            supplyLinesByCustomer.get(customer.id) ?? [],
            customer.creditDays,
            asOf,
            customer.openingDue,
          );
    const overdue = computeOverdue(
      customer.due,
      customer.creditDays,
      recentSales,
    );
    rows.push(
      toAgeingReportRow(
        customer.id,
        customer.name,
        aged,
        ageingBuyerCategory(customer.category),
        customer.sector,
        customer.state,
        customer.saleExecutive,
        {
          overdue: overdue.toString(),
          creditDays: customer.creditDays,
          dealingCompany: customer.dealingCompany,
          paymentInChargeName: customer.paymentInChargeName,
          paymentInChargeContact: customer.paymentInChargeContact,
          ownerName: customer.ownerName,
          ownerContact: customer.ownerContact,
        },
      ),
    );
  }

  rows.sort((a, b) => {
    const byDue = toDecimal(b.totalDue).comparedTo(toDecimal(a.totalDue));
    if (byDue !== 0) return byDue;
    return a.name.localeCompare(b.name);
  });

  return rows;
}
