"use server";

import { PaymentDirection, type Prisma } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import { hasDateFilter, utcDayRange } from "@/lib/domain/dateRange";
import {
  adjustCustomerDue,
  paymentDueDelta,
} from "@/lib/domain/customerDue";
import { parseFundFlowType } from "@/app/(dashboard)/payments/paymentsHref";
import {
  parsePaymentParty,
  tryParsePartyKey,
  type PaymentParty,
} from "@/lib/domain/paymentParty";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const PAYMENTS_PAGE_SIZE = 35;

export type PaymentInput = {
  date: string;
  customerId?: string | null;
  transporterId?: string | null;
  direction: "RECEIVED" | "SENT" | string;
  amount: string | number;
};

export type PaymentRow = {
  id: string;
  date: string;
  customerId: string | null;
  transporterId: string | null;
  customerName: string;
  direction: "RECEIVED" | "SENT";
  amount: string;
};

export type FundFlowTotals = {
  received: string;
  paid: string;
  net: string;
};

export type PaymentListResult = {
  rows: PaymentRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: FundFlowTotals | null;
};

function parseDirection(value: string): PaymentDirection {
  if (value === PaymentDirection.RECEIVED || value === PaymentDirection.SENT) {
    return value;
  }
  throw new Error("Select Fund Received or Fund Paid");
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
  customerId: string | null;
  transporterId: string | null;
  direction: PaymentDirection;
  amount: { toString(): string };
  customer: { name: string } | null;
  transporter: { name: string } | null;
}): PaymentRow {
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    customerId: row.customerId,
    transporterId: row.transporterId,
    customerName: row.customer?.name ?? row.transporter?.name ?? "—",
    direction: row.direction,
    amount: row.amount.toString(),
  };
}

function validatePaymentInput(input: PaymentInput) {
  const party = parsePaymentParty(input);
  const amount = toDecimal(input.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  return {
    date: parseDate(input.date),
    party,
    direction: parseDirection(String(input.direction)),
    amount,
  };
}

const paymentInclude = {
  customer: { select: { id: true, name: true } },
  transporter: { select: { id: true, name: true } },
} as const;

const paymentOrderBy = [
  { date: "desc" as const },
  { createdAt: "desc" as const },
];

function partyCreateData(party: PaymentParty) {
  return party.kind === "customer"
    ? { customer: { connect: { id: party.id } } }
    : { transporter: { connect: { id: party.id } } };
}

function partyUpdateData(party: PaymentParty) {
  return {
    customer:
      party.kind === "customer"
        ? { connect: { id: party.id } }
        : { disconnect: true },
    transporter:
      party.kind === "transporter"
        ? { connect: { id: party.id } }
        : { disconnect: true },
  };
}

async function assertPartyExists(party: PaymentParty) {
  if (party.kind === "customer") {
    const customer = await prisma.customer.findUnique({
      where: { id: party.id },
      select: { id: true },
    });
    if (!customer) throw new Error("Customer not found");
    return;
  }
  const transporter = await prisma.transporter.findUnique({
    where: { id: party.id },
    select: { id: true },
  });
  if (!transporter) throw new Error("Transporter not found");
}

function revalidatePaymentPaths(party?: PaymentParty) {
  revalidatePath("/payments");
  revalidatePath("/customers");
  if (!party || party.kind === "transporter") {
    revalidatePath("/transporters");
    revalidatePath("/reports/transport/due");
  }
}

function paymentWhere(options?: {
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}): Prisma.PaymentWhereInput {
  const and: Prisma.PaymentWhereInput[] = [];
  const date = utcDayRange(options?.dateFrom, options?.dateTo);
  if (date) and.push({ date });

  const parsedParty = tryParsePartyKey(options?.party);
  if (parsedParty?.kind === "customer") {
    and.push({ customerId: parsedParty.id });
  } else if (parsedParty?.kind === "transporter") {
    and.push({ transporterId: parsedParty.id });
  }

  const flowType = parseFundFlowType(options?.type);
  if (flowType === "received") {
    and.push({ direction: PaymentDirection.RECEIVED });
  } else if (flowType === "paid") {
    and.push({ direction: PaymentDirection.SENT });
  }

  return and.length ? { AND: and } : {};
}

async function paymentTotals(
  where: Prisma.PaymentWhereInput,
  dateFrom?: string,
  dateTo?: string,
): Promise<FundFlowTotals | null> {
  if (!hasDateFilter(dateFrom, dateTo)) return null;

  const groups = await prisma.payment.groupBy({
    by: ["direction"],
    where,
    _sum: { amount: true },
  });
  const received =
    groups.find((g) => g.direction === PaymentDirection.RECEIVED)?._sum
      .amount ?? 0;
  const paid =
    groups.find((g) => g.direction === PaymentDirection.SENT)?._sum.amount ??
    0;
  const receivedDec = toDecimal(received);
  const paidDec = toDecimal(paid);
  return {
    received: receivedDec.toFixed(2),
    paid: paidDec.toFixed(2),
    net: receivedDec.minus(paidDec).toFixed(2),
  };
}

export async function listPayments(options?: {
  page?: number;
  pageSize?: number;
  all?: boolean;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}): Promise<PaymentListResult> {
  const where = paymentWhere(options);

  if (options?.all) {
    const [rows, totals] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: paymentInclude,
        orderBy: paymentOrderBy,
      }),
      paymentTotals(where, options.dateFrom, options.dateTo),
    ]);
    return {
      rows: rows.map(toPaymentRow),
      total: rows.length,
      page: 1,
      pageSize: Math.max(1, rows.length),
      totalPages: 1,
      totals,
    };
  }

  const pageSize = Math.max(
    1,
    Math.min(100, options?.pageSize ?? PAYMENTS_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));

  const total = await prisma.payment.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const [rows, totals] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: paymentOrderBy,
      skip,
      take: pageSize,
    }),
    paymentTotals(where, options?.dateFrom, options?.dateTo),
  ]);

  return {
    rows: rows.map(toPaymentRow),
    total,
    page,
    pageSize,
    totalPages,
    totals,
  };
}

export async function createPayment(input: PaymentInput): Promise<PaymentRow> {
  const data = validatePaymentInput(input);
  await assertPartyExists(data.party);

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        date: data.date,
        direction: data.direction,
        amount: data.amount,
        ...partyCreateData(data.party),
      },
      include: paymentInclude,
    });

    if (data.party.kind === "customer") {
      await adjustCustomerDue(
        tx,
        data.party.id,
        paymentDueDelta(data.direction, data.amount),
      );
    }

    return created;
  });

  revalidatePaymentPaths(data.party);
  return toPaymentRow(row);
}

export async function updatePayment(
  id: string,
  input: PaymentInput,
): Promise<PaymentRow> {
  const data = validatePaymentInput(input);

  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new Error("Payment not found");

  await assertPartyExists(data.party);

  const row = await prisma.$transaction(async (tx) => {
    if (existing.customerId) {
      await adjustCustomerDue(
        tx,
        existing.customerId,
        paymentDueDelta(existing.direction, existing.amount).neg(),
      );
    }

    const updated = await tx.payment.update({
      where: { id },
      data: {
        date: data.date,
        direction: data.direction,
        amount: data.amount,
        ...partyUpdateData(data.party),
      },
      include: paymentInclude,
    });

    if (data.party.kind === "customer") {
      await adjustCustomerDue(
        tx,
        data.party.id,
        paymentDueDelta(data.direction, data.amount),
      );
    }

    return updated;
  });

  revalidatePaymentPaths(data.party);
  return toPaymentRow(row);
}

export async function deletePayment(id: string) {
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new Error("Payment not found");

  await prisma.$transaction(async (tx) => {
    if (existing.customerId) {
      await adjustCustomerDue(
        tx,
        existing.customerId,
        paymentDueDelta(existing.direction, existing.amount).neg(),
      );
    }
    await tx.payment.delete({ where: { id } });
  });

  revalidatePaymentPaths(
    existing.transporterId
      ? { kind: "transporter", id: existing.transporterId }
      : undefined,
  );
}
