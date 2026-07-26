"use server";

import { CustomerCategory } from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { balanceOrder } from "@/lib/domain/computations";
import { computeOverdue } from "@/lib/domain/customerDue";
import { prisma } from "@/lib/prisma";

export type SalesEngineRow = {
  id: string;
  name: string;
  purchaserName: string | null;
  purchaserContact: string | null;
  purchaserRole: string | null;
  saleExecutive: string | null;
  category: CustomerCategory;
  city: string | null;
  state: string | null;
  sector: string | null;
  orderInHand: string | null;
  soldQuantity: string;
  lastDispatchDate: string | null;
  due: string;
  overdue: string;
  plannedSaleCallDate: string | null;
};

function parseOptionalDate(value: string | null): Date | null {
  if (value == null || value.trim() === "") return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Invalid planned call date");
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid planned call date");
  return date;
}

function sumOrderInHand(
  orders: { quantity: Decimal | null; dispatchedOrder: Decimal }[],
): Decimal | null {
  let total = new Decimal(0);
  let any = false;
  for (const order of orders) {
    const bal = balanceOrder(order);
    if (bal == null || bal.lte(0)) continue;
    any = true;
    total = total.plus(bal);
  }
  return any ? total : null;
}

/** Active customers for the sales call / follow-up report. */
export async function listSalesEngineRows(): Promise<SalesEngineRow[]> {
  const customers = await prisma.customer.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      purchaserName: true,
      purchaserContact: true,
      purchaserRole: true,
      saleExecutive: true,
      category: true,
      city: true,
      state: true,
      sector: true,
      creditDays: true,
      due: true,
      plannedSaleCallDate: true,
    },
    orderBy: { name: "asc" },
  });

  if (customers.length === 0) return [];

  const ids = customers.map((c) => c.id);
  const [orders, payments, saleDispatches] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: { in: ids } },
      select: {
        customerId: true,
        finalRate: true,
        quantity: true,
        dispatchedOrder: true,
        closingQuantity: true,
        orderDate: true,
        createdAt: true,
        creditDays: true,
      },
    }),
    prisma.payment.findMany({
      where: { customerId: { in: ids }, direction: "RECEIVED" },
      select: {
        customerId: true,
        amount: true,
        date: true,
        createdAt: true,
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.dispatch.findMany({
      where: { order: { customerId: { in: ids } } },
      select: {
        dispatchDate: true,
        order: { select: { customerId: true } },
      },
    }),
  ]);

  const lastDispatchByCustomer = new Map<string, Date>();
  for (const row of saleDispatches) {
    const customerId = row.order.customerId;
    const existing = lastDispatchByCustomer.get(customerId);
    if (
      existing == null ||
      row.dispatchDate.getTime() > existing.getTime()
    ) {
      lastDispatchByCustomer.set(customerId, row.dispatchDate);
    }
  }

  const ordersByCustomer = new Map<string, typeof orders>();
  for (const order of orders) {
    const list = ordersByCustomer.get(order.customerId) ?? [];
    list.push(order);
    ordersByCustomer.set(order.customerId, list);
  }

  const paymentsByCustomer = new Map<string, typeof payments>();
  for (const payment of payments) {
    const list = paymentsByCustomer.get(payment.customerId) ?? [];
    list.push(payment);
    paymentsByCustomer.set(payment.customerId, list);
  }

  return customers.map((customer) => {
    const customerOrders = ordersByCustomer.get(customer.id) ?? [];
    const received = paymentsByCustomer.get(customer.id) ?? [];
    const overdue = computeOverdue(
      customerOrders,
      customer.creditDays,
      received.map((p) => p.amount),
    );

    let soldQuantity = new Decimal(0);
    for (const order of customerOrders) {
      soldQuantity = soldQuantity.plus(order.dispatchedOrder);
    }

    const orderInHand = sumOrderInHand(customerOrders);
    const lastDispatch = lastDispatchByCustomer.get(customer.id) ?? null;

    return {
      id: customer.id,
      name: customer.name,
      purchaserName: customer.purchaserName,
      purchaserContact: customer.purchaserContact,
      purchaserRole: customer.purchaserRole,
      saleExecutive: customer.saleExecutive,
      category: customer.category,
      city: customer.city,
      state: customer.state,
      sector: customer.sector,
      orderInHand: orderInHand?.toString() ?? null,
      soldQuantity: soldQuantity.toString(),
      lastDispatchDate: lastDispatch
        ? lastDispatch.toISOString().slice(0, 10)
        : null,
      due: customer.due.toString(),
      overdue: overdue.toString(),
      plannedSaleCallDate: customer.plannedSaleCallDate
        ? customer.plannedSaleCallDate.toISOString().slice(0, 10)
        : null,
    };
  });
}

/** Set or clear the next planned sales call date for a customer. */
export async function updatePlannedSaleCall(
  customerId: string,
  date: string | null,
): Promise<{ plannedSaleCallDate: string | null }> {
  if (!customerId) throw new Error("Customer is required");

  const existing = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true },
  });
  if (!existing) throw new Error("Customer not found");

  const plannedSaleCallDate = parseOptionalDate(date);

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: { plannedSaleCallDate },
    select: { plannedSaleCallDate: true },
  });

  revalidatePath("/reports/sales-engine");
  revalidatePath("/");

  return {
    plannedSaleCallDate: row.plannedSaleCallDate
      ? row.plannedSaleCallDate.toISOString().slice(0, 10)
      : null,
  };
}
