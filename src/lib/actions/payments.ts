"use server";

import { PaymentDirection } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import {
  adjustCustomerDue,
  paymentDueDelta,
} from "@/lib/domain/customerDue";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const PAYMENTS_PAGE_SIZE = 20;

export type PaymentInput = {
  date: string;
  customerId: string;
  direction: "RECEIVED" | "SENT" | string;
  amount: string | number;
};

export type PaymentRow = {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  direction: "RECEIVED" | "SENT";
  amount: string;
};

export type PaymentListResult = {
  rows: PaymentRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function parseDirection(value: string): PaymentDirection {
  if (value === PaymentDirection.RECEIVED || value === PaymentDirection.SENT) {
    return value;
  }
  throw new Error("Select Received or Sent");
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

function toPaymentRow(row: {
  id: string;
  date: Date;
  customerId: string;
  direction: PaymentDirection;
  amount: { toString(): string };
  customer: { name: string };
}): PaymentRow {
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    customerId: row.customerId,
    customerName: row.customer.name,
    direction: row.direction,
    amount: row.amount.toString(),
  };
}

function validatePaymentInput(input: PaymentInput) {
  if (!input.customerId) throw new Error("Customer is required");
  const amount = toDecimal(input.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  return {
    date: parseDate(input.date),
    customerId: input.customerId,
    direction: parseDirection(String(input.direction)),
    amount,
  };
}

const paymentInclude = {
  customer: { select: { id: true, name: true } },
} as const;

const paymentOrderBy = [
  { date: "desc" as const },
  { createdAt: "desc" as const },
];

function revalidatePaymentPaths() {
  revalidatePath("/payments");
  revalidatePath("/customers");
}

export async function listPayments(options?: {
  page?: number;
  pageSize?: number;
}): Promise<PaymentListResult> {
  const pageSize = Math.max(
    1,
    Math.min(100, options?.pageSize ?? PAYMENTS_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));

  const total = await prisma.payment.count();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const rows = await prisma.payment.findMany({
    include: paymentInclude,
    orderBy: paymentOrderBy,
    skip,
    take: pageSize,
  });

  return {
    rows: rows.map(toPaymentRow),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function createPayment(input: PaymentInput): Promise<PaymentRow> {
  const data = validatePaymentInput(input);

  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
    select: { id: true, name: true },
  });
  if (!customer) throw new Error("Customer not found");

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        date: data.date,
        direction: data.direction,
        amount: data.amount,
        customer: { connect: { id: data.customerId } },
      },
      include: paymentInclude,
    });

    await adjustCustomerDue(
      tx,
      data.customerId,
      paymentDueDelta(data.direction, data.amount),
    );

    return created;
  });

  revalidatePaymentPaths();
  return toPaymentRow(row);
}

export async function updatePayment(
  id: string,
  input: PaymentInput,
): Promise<PaymentRow> {
  const data = validatePaymentInput(input);

  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new Error("Payment not found");

  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
    select: { id: true },
  });
  if (!customer) throw new Error("Customer not found");

  const row = await prisma.$transaction(async (tx) => {
    // Reverse the old payment's effect on due.
    await adjustCustomerDue(
      tx,
      existing.customerId,
      paymentDueDelta(existing.direction, existing.amount).neg(),
    );

    const updated = await tx.payment.update({
      where: { id },
      data: {
        date: data.date,
        direction: data.direction,
        amount: data.amount,
        customer: { connect: { id: data.customerId } },
      },
      include: paymentInclude,
    });

    // Apply the new payment's effect.
    await adjustCustomerDue(
      tx,
      data.customerId,
      paymentDueDelta(data.direction, data.amount),
    );

    return updated;
  });

  revalidatePaymentPaths();
  return toPaymentRow(row);
}

export async function deletePayment(id: string) {
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new Error("Payment not found");

  await prisma.$transaction(async (tx) => {
    await adjustCustomerDue(
      tx,
      existing.customerId,
      paymentDueDelta(existing.direction, existing.amount).neg(),
    );
    await tx.payment.delete({ where: { id } });
  });

  revalidatePaymentPaths();
}
