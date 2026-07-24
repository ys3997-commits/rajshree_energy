"use server";

import { CustomerCategory } from "@/generated/prisma";
import { computeOverdue } from "@/lib/domain/customerDue";
import { capitalizeName } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listCustomers(options?: { activeOnly?: boolean }) {
  return prisma.customer.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });
}

export type CustomerDueRow = {
  id: string;
  name: string;
  category: CustomerCategory;
  saleExecutive: string | null;
  creditDays: number | null;
  plannedCollectionCallDate: string | null;
  due: string;
  overdue: string;
  lastPaymentDate: string | null;
  lastPaymentAmount: string | null;
};

/** Customers with non-zero due, highest due first (for collection). */
export async function listCustomersWithDue(): Promise<CustomerDueRow[]> {
  const customers = await prisma.customer.findMany({
    where: {
      OR: [{ due: { gt: 0 } }, { due: { lt: 0 } }],
    },
    select: {
      id: true,
      name: true,
      category: true,
      due: true,
      creditDays: true,
      saleExecutive: true,
      plannedCollectionCallDate: true,
    },
    orderBy: { due: "desc" },
  });

  if (customers.length === 0) return [];

  const ids = customers.map((c) => c.id);
  const [orders, payments] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: { in: ids } },
      select: {
        customerId: true,
        finalRate: true,
        quantity: true,
        dispatchedOrder: true,
        orderDate: true,
        createdAt: true,
        creditDays: true,
      },
    }),
    prisma.payment.findMany({
      where: { customerId: { in: ids } },
      select: {
        customerId: true,
        date: true,
        amount: true,
        direction: true,
        createdAt: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

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
    const customerPayments = paymentsByCustomer.get(customer.id) ?? [];
    const received = customerPayments
      .filter((p) => p.direction === "RECEIVED")
      .map((p) => p.amount);
    const overdue = computeOverdue(
      customerOrders,
      customer.creditDays,
      received,
    );
    const last = customerPayments[0] ?? null;

    return {
      id: customer.id,
      name: customer.name,
      category: customer.category,
      saleExecutive: customer.saleExecutive,
      creditDays: customer.creditDays,
      plannedCollectionCallDate: customer.plannedCollectionCallDate
        ? customer.plannedCollectionCallDate.toISOString().slice(0, 10)
        : null,
      due: customer.due.toString(),
      overdue: overdue.toString(),
      lastPaymentDate: last ? last.date.toISOString().slice(0, 10) : null,
      lastPaymentAmount: last ? last.amount.toString() : null,
    };
  });
}

/** Lightweight lookup for sale-order form auto-fill. */
export async function getCustomerOrderDefaults(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, category: true, creditDays: true, active: true },
  });
  if (!customer) throw new Error("Customer not found");
  if (!customer.active) throw new Error("Customer is inactive");
  return customer;
}

export type CustomerInput = {
  name: string;
  category: CustomerCategory;
  active?: boolean;
  ownerName?: string | null;
  ownerContact?: string | null;
  purchaserName?: string | null;
  purchaserContact?: string | null;
  purchaserRole?: string | null;
  paymentInChargeName?: string | null;
  paymentInChargeContact?: string | null;
  paymentInChargeRole?: string | null;
  accountantName?: string | null;
  accountantContact?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  creditDays?: number | null;
  sector?: string | null;
  saleExecutive?: string | null;
  approachForFunds?: string | null;
};

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

function toCustomerData(input: CustomerInput) {
  return {
    name: capitalizeName(input.name) ?? input.name.trim(),
    category: input.category,
    active: input.active ?? true,
    ownerName: capitalizeName(input.ownerName),
    ownerContact: normalizePhone(input.ownerContact),
    purchaserName: capitalizeName(input.purchaserName),
    purchaserContact: normalizePhone(input.purchaserContact),
    purchaserRole: input.purchaserRole || null,
    paymentInChargeName: capitalizeName(input.paymentInChargeName),
    paymentInChargeContact: normalizePhone(input.paymentInChargeContact),
    paymentInChargeRole: input.paymentInChargeRole || null,
    accountantName: capitalizeName(input.accountantName),
    accountantContact: normalizePhone(input.accountantContact),
    email: input.email || null,
    city: input.city || null,
    state: input.state || null,
    creditDays:
      input.creditDays === undefined || input.creditDays === null
        ? null
        : input.creditDays,
    sector: input.sector || null,
    saleExecutive: input.saleExecutive || null,
    approachForFunds: input.approachForFunds || null,
  };
}

export async function createCustomer(input: CustomerInput) {
  const row = await prisma.customer.create({
    data: toCustomerData(input),
  });
  revalidatePath("/customers");
  return row;
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const row = await prisma.customer.update({
    where: { id },
    data: toCustomerData(input),
  });
  revalidatePath("/customers");
  return row;
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}
