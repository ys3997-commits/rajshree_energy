"use server";

import { DiscountStatus } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import {
  adjustCustomerDue,
  discountDueDelta,
} from "@/lib/domain/customerDue";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const DISCOUNTS_PAGE_SIZE = 20;

export type DiscountInput = {
  date: string;
  customerId: string;
  status: "RECEIVED" | "PAID" | string;
  amount: string | number;
  remarks: string;
};

export type DiscountRow = {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  status: "RECEIVED" | "PAID";
  amount: string;
  remarks: string;
};

export type DiscountListResult = {
  rows: DiscountRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function parseStatus(value: string): DiscountStatus {
  if (value === DiscountStatus.RECEIVED || value === DiscountStatus.PAID) {
    return value;
  }
  throw new Error("Select Discount Received or Discount Paid");
}

function parseDate(value: string): Date {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Date is required");
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
}

function toDiscountRow(row: {
  id: string;
  date: Date;
  customerId: string;
  status: DiscountStatus;
  amount: { toString(): string };
  remarks: string;
  customer: { name: string };
}): DiscountRow {
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    customerId: row.customerId,
    customerName: row.customer.name,
    status: row.status,
    amount: row.amount.toString(),
    remarks: row.remarks,
  };
}

function validateDiscountInput(input: DiscountInput) {
  if (!input.customerId) throw new Error("Customer is required");
  const remarks = String(input.remarks ?? "").trim();
  if (!remarks) throw new Error("Remarks are required");
  const amount = toDecimal(input.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  return {
    date: parseDate(input.date),
    customerId: input.customerId,
    status: parseStatus(String(input.status)),
    amount,
    remarks,
  };
}

const discountInclude = {
  customer: { select: { id: true, name: true } },
} as const;

const discountOrderBy = [
  { date: "desc" as const },
  { createdAt: "desc" as const },
];

function revalidateDiscountPaths() {
  revalidatePath("/payments");
  revalidatePath("/customers");
  revalidatePath("/reports/collection");
  revalidatePath("/reports/collection/vendor");
}

export async function listDiscounts(options?: {
  page?: number;
  pageSize?: number;
}): Promise<DiscountListResult> {
  const pageSize = Math.max(
    1,
    Math.min(100, options?.pageSize ?? DISCOUNTS_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));

  const total = await prisma.discount.count();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const rows = await prisma.discount.findMany({
    include: discountInclude,
    orderBy: discountOrderBy,
    skip,
    take: pageSize,
  });

  return {
    rows: rows.map(toDiscountRow),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function createDiscount(
  input: DiscountInput,
): Promise<DiscountRow> {
  const data = validateDiscountInput(input);

  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
    select: { id: true, name: true },
  });
  if (!customer) throw new Error("Customer not found");

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.discount.create({
      data: {
        date: data.date,
        status: data.status,
        amount: data.amount,
        remarks: data.remarks,
        customer: { connect: { id: data.customerId } },
      },
      include: discountInclude,
    });

    await adjustCustomerDue(
      tx,
      data.customerId,
      discountDueDelta(data.status, data.amount),
    );

    return created;
  });

  revalidateDiscountPaths();
  return toDiscountRow(row);
}

export async function updateDiscount(
  id: string,
  input: DiscountInput,
): Promise<DiscountRow> {
  const data = validateDiscountInput(input);

  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new Error("Discount not found");

  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
    select: { id: true },
  });
  if (!customer) throw new Error("Customer not found");

  const row = await prisma.$transaction(async (tx) => {
    // Reverse the old discount's effect on due.
    await adjustCustomerDue(
      tx,
      existing.customerId,
      discountDueDelta(existing.status, existing.amount).neg(),
    );

    const updated = await tx.discount.update({
      where: { id },
      data: {
        date: data.date,
        status: data.status,
        amount: data.amount,
        remarks: data.remarks,
        customer: { connect: { id: data.customerId } },
      },
      include: discountInclude,
    });

    // Apply the new discount's effect.
    await adjustCustomerDue(
      tx,
      data.customerId,
      discountDueDelta(data.status, data.amount),
    );

    return updated;
  });

  revalidateDiscountPaths();
  return toDiscountRow(row);
}

export async function deleteDiscount(id: string) {
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new Error("Discount not found");

  await prisma.$transaction(async (tx) => {
    await adjustCustomerDue(
      tx,
      existing.customerId,
      discountDueDelta(existing.status, existing.amount).neg(),
    );
    await tx.discount.delete({ where: { id } });
  });

  revalidateDiscountPaths();
}
