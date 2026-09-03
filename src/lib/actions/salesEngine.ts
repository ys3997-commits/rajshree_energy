"use server";

import { CustomerCategory, SalesSmsType } from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { balanceOrder } from "@/lib/domain/computations";
import {
  computeOverdue,
  dispatchedAmount,
  sumSalesSuppliedInCreditWindow,
} from "@/lib/domain/customerDue";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requirePage } from "@/lib/auth/access";
import {
  execScopeToCustomerWhere,
  getStaffReportExecScope,
  rowMatchesExecScope,
  SALES_ENGINE_PAGE_KEY,
} from "@/lib/auth/report-exec-access";

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
  creditDays: number | null;
  orderInHand: string | null;
  soldQuantity: string;
  lastDispatchDate: string | null;
  due: string;
  overdue: string;
  plannedSaleCallDate: string | null;
  offerPrice: string | null;
  offerFreight: string | null;
  smsType: "DELIVERED" | "EX_PORT" | "REQUIREMENT" | null;
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

function parseOptionalRate(value: string | null): Decimal | null {
  if (value == null || value.trim() === "") return null;
  const trimmed = value.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,3})?$/.test(trimmed)) {
    throw new Error("Invalid amount");
  }
  return new Decimal(trimmed);
}

function parseSalesSmsType(
  value: string | null,
): "DELIVERED" | "EX_PORT" | "REQUIREMENT" | null {
  if (value == null || value.trim() === "") return null;
  if (
    value === SalesSmsType.DELIVERED ||
    value === SalesSmsType.EX_PORT ||
    value === SalesSmsType.REQUIREMENT
  ) {
    return value;
  }
  throw new Error("Invalid SMS type");
}

async function assertSalesEngineCustomerAccess(customerId: string) {
  const access = await requirePage(SALES_ENGINE_PAGE_KEY);

  const existing = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, saleExecutive: true },
  });
  if (!existing) throw new Error("Customer not found");

  const scope = getStaffReportExecScope(access, SALES_ENGINE_PAGE_KEY);
  if (
    scope !== "all" &&
    !rowMatchesExecScope(existing.saleExecutive, scope)
  ) {
    throw new AccessDeniedError();
  }

  return existing;
}

function sumOrderInHand(
  orders: {
    quantity: Decimal | null;
    dispatchedOrder: Decimal;
    closingQuantity: Decimal | null;
  }[],
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

/** Active trader/industry customers for the sales call / follow-up report. */
export async function listSalesEngineRows(): Promise<SalesEngineRow[]> {
  const customers = await prisma.customer.findMany({
    where: {
      active: true,
      category: { in: [CustomerCategory.TRADER, CustomerCategory.INDUSTRY] },
    },
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
      openingDue: true,
      plannedSaleCallDate: true,
      offerPrice: true,
      offerFreight: true,
      smsType: true,
    },
    orderBy: { name: "asc" },
  });

  if (customers.length === 0) return [];

  const ids = customers.map((c) => c.id);
  const [orders, saleDispatches] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: { in: ids } },
      select: {
        customerId: true,
        quantity: true,
        dispatchedOrder: true,
        closingQuantity: true,
      },
    }),
    prisma.dispatch.findMany({
      where: { order: { customerId: { in: ids } } },
      select: {
        dispatchDate: true,
        dispatchedQuantity: true,
        order: {
          select: {
            customerId: true,
            finalRate: true,
          },
        },
      },
    }),
  ]);

  const lastDispatchByCustomer = new Map<string, Date>();
  const supplyLinesByCustomer = new Map<
    string,
    { amount: Decimal; supplyDate: Date }[]
  >();
  for (const row of saleDispatches) {
    const customerId = row.order.customerId;
    const existing = lastDispatchByCustomer.get(customerId);
    if (
      existing == null ||
      row.dispatchDate.getTime() > existing.getTime()
    ) {
      lastDispatchByCustomer.set(customerId, row.dispatchDate);
    }

    const amount = dispatchedAmount(
      row.order.finalRate,
      row.dispatchedQuantity,
    );
    if (amount.lte(0)) continue;
    const list = supplyLinesByCustomer.get(customerId) ?? [];
    list.push({ amount, supplyDate: row.dispatchDate });
    supplyLinesByCustomer.set(customerId, list);
  }

  const ordersByCustomer = new Map<string, typeof orders>();
  for (const order of orders) {
    const list = ordersByCustomer.get(order.customerId) ?? [];
    list.push(order);
    ordersByCustomer.set(order.customerId, list);
  }

  return customers.map((customer) => {
    const customerOrders = ordersByCustomer.get(customer.id) ?? [];
    const recentSales =
      customer.creditDays == null
        ? new Decimal(0)
        : sumSalesSuppliedInCreditWindow(
            supplyLinesByCustomer.get(customer.id) ?? [],
            customer.creditDays,
            new Date(),
            customer.openingDue,
          );
    const overdue = computeOverdue(
      customer.due,
      customer.creditDays,
      recentSales,
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
      creditDays: customer.creditDays,
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
      offerPrice: customer.offerPrice?.toString() ?? null,
      offerFreight: customer.offerFreight?.toString() ?? null,
      smsType: customer.smsType,
    };
  });
}

/** Set or clear the next planned sales call date for a customer. */
export async function updatePlannedSaleCall(
  customerId: string,
  date: string | null,
): Promise<{ plannedSaleCallDate: string | null }> {
  if (!customerId) throw new Error("Customer is required");

  await assertSalesEngineCustomerAccess(customerId);

  const plannedSaleCallDate = parseOptionalDate(date);

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: { plannedSaleCallDate },
    select: { plannedSaleCallDate: true },
  });

  revalidatePath("/reports/sales");
  revalidatePath("/");

  return {
    plannedSaleCallDate: row.plannedSaleCallDate
      ? row.plannedSaleCallDate.toISOString().slice(0, 10)
      : null,
  };
}

/** Set or clear the offer price (Rs/MT) for a customer on Sales Engine. */
export async function updateSalesOfferPrice(
  customerId: string,
  value: string | null,
): Promise<{ offerPrice: string | null }> {
  if (!customerId) throw new Error("Customer is required");

  await assertSalesEngineCustomerAccess(customerId);

  const offerPrice = parseOptionalRate(value);

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: { offerPrice },
    select: { offerPrice: true },
  });

  revalidatePath("/reports/sales");

  return { offerPrice: row.offerPrice?.toString() ?? null };
}

/** Set or clear the offer freight (Rs/MT) for a customer on Sales Engine. */
export async function updateSalesOfferFreight(
  customerId: string,
  value: string | null,
): Promise<{ offerFreight: string | null }> {
  if (!customerId) throw new Error("Customer is required");

  await assertSalesEngineCustomerAccess(customerId);

  const offerFreight = parseOptionalRate(value);

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: { offerFreight },
    select: { offerFreight: true },
  });

  revalidatePath("/reports/sales");

  return { offerFreight: row.offerFreight?.toString() ?? null };
}

/** Set or clear the SMS type for a customer on Sales Engine. */
export async function updateSalesSmsType(
  customerId: string,
  value: string | null,
): Promise<{ smsType: "DELIVERED" | "EX_PORT" | "REQUIREMENT" | null }> {
  if (!customerId) throw new Error("Customer is required");

  await assertSalesEngineCustomerAccess(customerId);

  const smsType = parseSalesSmsType(value);

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: { smsType },
    select: { smsType: true },
  });

  revalidatePath("/reports/sales");

  return { smsType: row.smsType };
}

/** Clear offer price, freight, and SMS type for all Sales Engine customers in scope. */
export async function clearAllSalesOffers(): Promise<{ clearedCount: number }> {
  const access = await requirePage(SALES_ENGINE_PAGE_KEY);
  const execScope = getStaffReportExecScope(access, SALES_ENGINE_PAGE_KEY);
  const execFilter = execScopeToCustomerWhere(execScope);

  const where = {
    active: true,
    category: {
      in: [CustomerCategory.TRADER, CustomerCategory.INDUSTRY],
    },
    AND: [
      ...(execFilter ? [execFilter] : []),
      {
        OR: [
          { offerPrice: { not: null } },
          { offerFreight: { not: null } },
          { smsType: { not: null } },
        ],
      },
    ],
  };

  const result = await prisma.customer.updateMany({
    where,
    data: {
      offerPrice: null,
      offerFreight: null,
      smsType: null,
    },
  });

  revalidatePath("/reports/sales");
  revalidatePath("/");

  return { clearedCount: result.count };
}
