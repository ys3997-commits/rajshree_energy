"use server";

import { CustomerCategory } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import {
  adjustCustomerDue,
  computeOverdue,
  dispatchedAmount,
  sumSalesSuppliedInCreditWindow,
} from "@/lib/domain/customerDue";
import { capitalizeName } from "@/lib/domain/format";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listCustomers(options?: { activeOnly?: boolean }) {
  return prisma.customer.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      active: true,
      ownerName: true,
      ownerContact: true,
      purchaserName: true,
      purchaserContact: true,
      purchaserRole: true,
      paymentInChargeName: true,
      paymentInChargeContact: true,
      paymentInChargeRole: true,
      accountantName: true,
      accountantContact: true,
      factoryContactName: true,
      factoryContactContact: true,
      factoryContactRole: true,
      email: true,
      city: true,
      state: true,
      creditDays: true,
      sector: true,
      saleExecutive: true,
      dealById: true,
      approachForFunds: true,
      dealingCompany: true,
      openingDue: true,
      due: true,
      plannedCollectionCallDate: true,
      plannedSaleCallDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

const CUSTOMERS_PAGE_SIZE = 20;

export type CustomerListRow = {
  id: string;
  name: string;
  category: CustomerCategory;
  active: boolean;
  ownerName: string | null;
  ownerContact: string | null;
  purchaserName: string | null;
  purchaserContact: string | null;
  purchaserRole: string | null;
  paymentInChargeName: string | null;
  paymentInChargeContact: string | null;
  paymentInChargeRole: string | null;
  accountantName: string | null;
  accountantContact: string | null;
  factoryContactName: string | null;
  factoryContactContact: string | null;
  factoryContactRole: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  creditDays: number | null;
  sector: string | null;
  saleExecutive: string | null;
  approachForFunds: string | null;
  dealingCompany: string | null;
  openingDue: string;
};

export type CustomerListResult = {
  rows: CustomerListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  customerId: string;
  category: string;
};

export async function listCustomersPage(options?: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  category?: string;
}): Promise<CustomerListResult> {
  const pageSize = Math.max(
    1,
    Math.min(100, options?.pageSize ?? CUSTOMERS_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));
  const customerId = (options?.customerId ?? "").trim();
  const category = (options?.category ?? "").trim();

  const where: {
    id?: string;
    category?: CustomerCategory;
  } = {};
  if (customerId) where.id = customerId;
  if (
    category === CustomerCategory.SUPPLIER ||
    category === CustomerCategory.TRADER ||
    category === CustomerCategory.INDUSTRY
  ) {
    where.category = category;
  }

  const hasFilter = Boolean(where.id || where.category);
  const total = await prisma.customer.count({
    where: hasFilter ? where : undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const rows = await prisma.customer.findMany({
    where: hasFilter ? where : undefined,
    orderBy: { name: "asc" },
    skip,
    take: pageSize,
    select: {
      id: true,
      name: true,
      category: true,
      active: true,
      ownerName: true,
      ownerContact: true,
      purchaserName: true,
      purchaserContact: true,
      purchaserRole: true,
      paymentInChargeName: true,
      paymentInChargeContact: true,
      paymentInChargeRole: true,
      accountantName: true,
      accountantContact: true,
      factoryContactName: true,
      factoryContactContact: true,
      factoryContactRole: true,
      email: true,
      city: true,
      state: true,
      creditDays: true,
      sector: true,
      saleExecutive: true,
      approachForFunds: true,
      dealingCompany: true,
      openingDue: true,
    },
  });

  return {
    rows: rows.map((customer) => ({
      ...customer,
      openingDue: customer.openingDue.toString(),
    })),
    total,
    page,
    pageSize,
    totalPages,
    customerId,
    category:
      category === CustomerCategory.SUPPLIER ||
      category === CustomerCategory.TRADER ||
      category === CustomerCategory.INDUSTRY
        ? category
        : "",
  };
}

export type CustomerDueRow = {
  id: string;
  name: string;
  category: CustomerCategory;
  paymentInChargeName: string | null;
  paymentInChargeContact: string | null;
  paymentInChargeRole: string | null;
  saleExecutive: string | null;
  approachForFunds: string | null;
  city: string | null;
  state: string | null;
  sector: string | null;
  dealingCompany: string | null;
  creditDays: number | null;
  plannedCollectionCallDate: string | null;
  collectionThrough: "CALL" | "SMS" | null;
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
      paymentInChargeRole: true,
      due: true,
      openingDue: true,
      creditDays: true,
      saleExecutive: true,
      approachForFunds: true,
      city: true,
      state: true,
      sector: true,
      dealingCompany: true,
      plannedCollectionCallDate: true,
      collectionThrough: true,
    },
    orderBy: { due: "desc" },
  });

  if (customers.length === 0) return [];

  const ids = customers.map((c) => c.id);
  const [saleDispatches, payments] = await Promise.all([
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

  const supplyLinesByCustomer = new Map<
    string,
    { amount: Decimal; supplyDate: Date }[]
  >();
  for (const row of saleDispatches) {
    const customerId = row.order.customerId;
    const amount = dispatchedAmount(
      row.order.finalRate,
      row.dispatchedQuantity,
    );
    if (amount.lte(0)) continue;
    const list = supplyLinesByCustomer.get(customerId) ?? [];
    list.push({ amount, supplyDate: row.dispatchDate });
    supplyLinesByCustomer.set(customerId, list);
  }

  const paymentsByCustomer = new Map<string, typeof payments>();
  for (const payment of payments) {
    if (!payment.customerId) continue;
    const list = paymentsByCustomer.get(payment.customerId) ?? [];
    list.push(payment);
    paymentsByCustomer.set(payment.customerId, list);
  }

  return customers.map((customer) => {
    const customerPayments = paymentsByCustomer.get(customer.id) ?? [];
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
    const last = customerPayments[0] ?? null;

    return {
      id: customer.id,
      name: customer.name,
      category: customer.category,
      paymentInChargeName: customer.paymentInChargeName,
      paymentInChargeContact: customer.paymentInChargeContact,
      paymentInChargeRole: customer.paymentInChargeRole,
      saleExecutive: customer.saleExecutive,
      approachForFunds: customer.approachForFunds,
      city: customer.city,
      state: customer.state,
      sector: customer.sector,
      dealingCompany: customer.dealingCompany,
      creditDays: customer.creditDays,
      plannedCollectionCallDate: customer.plannedCollectionCallDate
        ? customer.plannedCollectionCallDate.toISOString().slice(0, 10)
        : null,
      collectionThrough: customer.collectionThrough,
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
  dealingCompany?: string | null;
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
    dealingCompany: input.dealingCompany || null,
  };
}

export async function createCustomer(input: CustomerInput) {
  await assertUniqueCustomerName(input.name);
  const openingDue = parseOpeningDue(input.openingDue);
  await prisma.customer.create({
    data: {
      ...toCustomerData(input),
      openingDue,
      due: openingDue,
    },
    select: { id: true },
  });
  revalidatePath("/customers");
  revalidatePath("/payments");
}

export async function updateCustomer(id: string, input: CustomerInput) {
  await assertUniqueCustomerName(input.name, { excludeId: id });
  const openingDue = parseOpeningDue(input.openingDue);
  await prisma.$transaction(async (tx) => {
    const existing = await tx.customer.findUniqueOrThrow({
      where: { id },
      select: { openingDue: true },
    });
    await tx.customer.update({
      where: { id },
      data: {
        ...toCustomerData(input),
        openingDue,
      },
      select: { id: true },
    });
    const delta = openingDue.minus(toDecimal(existing.openingDue));
    await adjustCustomerDue(tx, id, delta);
  });
  revalidatePath("/customers");
  revalidatePath("/payments");
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id }, select: { id: true } });
  revalidatePath("/customers");
}
