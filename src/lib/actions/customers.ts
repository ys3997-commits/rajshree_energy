"use server";

import { CustomerCategory } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import {
  adjustCustomerDue,
  computeOverdue,
} from "@/lib/domain/customerDue";
import { capitalizeName } from "@/lib/domain/format";
import { Decimal } from "@prisma/client/runtime/library";
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
  paymentInChargeName: string | null;
  paymentInChargeContact: string | null;
  saleExecutive: string | null;
  approachForFunds: string | null;
  city: string | null;
  state: string | null;
  sector: string | null;
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
      paymentInChargeName: true,
      paymentInChargeContact: true,
      due: true,
      creditDays: true,
      saleExecutive: true,
      approachForFunds: true,
      city: true,
      state: true,
      sector: true,
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
        closingQuantity: true,
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
      paymentInChargeName: customer.paymentInChargeName,
      paymentInChargeContact: customer.paymentInChargeContact,
      saleExecutive: customer.saleExecutive,
      approachForFunds: customer.approachForFunds,
      city: customer.city,
      state: customer.state,
      sector: customer.sector,
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
  factoryContactName?: string | null;
  factoryContactContact?: string | null;
  factoryContactRole?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  creditDays?: number | null;
  sector?: string | null;
  saleExecutive?: string | null;
  approachForFunds?: string | null;
  /** Carry-forward balance before this system; included in total due. */
  openingDue?: string | number | null;
};

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

function parseOpeningDue(value: string | number | null | undefined): Decimal {
  if (value === undefined || value === null || value === "") {
    return new Decimal(0);
  }
  const d = toDecimal(value);
  if (!d.isFinite()) {
    throw new Error("Opening due must be a valid amount");
  }
  return d.toDecimalPlaces(2);
}

async function assertUniqueCustomerName(
  name: string,
  options?: { excludeId?: string },
) {
  const normalizedName = capitalizeName(name) ?? name.trim();
  const existing = await prisma.customer.findFirst({
    where: {
      ...(options?.excludeId ? { id: { not: options.excludeId } } : {}),
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });
  if (existing) {
    throw new Error(`Customer "${normalizedName}" already exists`);
  }
}

function toCustomerData(input: CustomerInput) {
  const isIndustry = input.category === CustomerCategory.INDUSTRY;
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
    factoryContactName: isIndustry
      ? capitalizeName(input.factoryContactName)
      : null,
    factoryContactContact: isIndustry
      ? normalizePhone(input.factoryContactContact)
      : null,
    factoryContactRole: isIndustry ? input.factoryContactRole || null : null,
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
  await assertUniqueCustomerName(input.name);
  const openingDue = parseOpeningDue(input.openingDue);
  const row = await prisma.customer.create({
    data: {
      ...toCustomerData(input),
      openingDue,
      due: openingDue,
    },
  });
  revalidatePath("/customers");
  revalidatePath("/payments");
  return row;
}

export async function updateCustomer(id: string, input: CustomerInput) {
  await assertUniqueCustomerName(input.name, { excludeId: id });
  const openingDue = parseOpeningDue(input.openingDue);
  const row = await prisma.$transaction(async (tx) => {
    const existing = await tx.customer.findUniqueOrThrow({
      where: { id },
      select: { openingDue: true },
    });
    const updated = await tx.customer.update({
      where: { id },
      data: {
        ...toCustomerData(input),
        openingDue,
      },
    });
    const delta = openingDue.minus(toDecimal(existing.openingDue));
    await adjustCustomerDue(tx, id, delta);
    return updated;
  });
  revalidatePath("/customers");
  revalidatePath("/payments");
  return row;
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}
