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
import { AccessDeniedError, requirePage, type Access } from "@/lib/auth/access";

const PAYMENTS_PAGE_SIZE = 35;

export type PaymentInput = {
  date: string;
  customerId?: string | null;
  transporterId?: string | null;
  investmentCompanyId?: string | null;
  bankAccountId?: string | null;
  direction: "RECEIVED" | "SENT" | string;
  amount: string | number;
};

export type PaymentRow = {
  id: string;
  date: string;
  customerId: string | null;
  transporterId: string | null;
  investmentCompanyId: string | null;
  bankAccountId: string | null;
  accountName: string | null;
  bankName: string | null;
  customerName: string;
  direction: "RECEIVED" | "SENT";
  amount: string;
  canEdit: boolean;
  canDelete: boolean;
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

const IST_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
});

function dayKeyInIst(value: Date): string {
  return IST_DAY_FORMATTER.format(value);
}

function canStaffModifyPayment(
  access: Extract<Access, { kind: "staff" }>,
  row: { createdAt: Date; createdByStaffId: string | null },
): boolean {
  if (!row.createdByStaffId) return false;
  if (row.createdByStaffId !== access.id) return false;
  return dayKeyInIst(row.createdAt) === dayKeyInIst(new Date());
}

function canModifyPayment(
  access: Exclude<Access, { kind: "none" }>,
  row: { createdAt: Date; createdByStaffId: string | null },
): boolean {
  if (access.kind === "owner") return true;
  return canStaffModifyPayment(access, row);
}

function toPaymentRow(row: {
  id: string;
  date: Date;
  createdAt: Date;
  createdByStaffId: string | null;
  customerId: string | null;
  transporterId: string | null;
  investmentCompanyId: string | null;
  direction: PaymentDirection;
  amount: { toString(): string };
  customer: { name: string } | null;
  transporter: { name: string } | null;
  investmentCompany: { name: string } | null;
  bankAccount: { id: string; accountName: string; bankName: string } | null;
}, access: Exclude<Access, { kind: "none" }>): PaymentRow {
  const canModify = canModifyPayment(access, row);
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    customerId: row.customerId,
    transporterId: row.transporterId,
    investmentCompanyId: row.investmentCompanyId,
    bankAccountId: row.bankAccount?.id ?? null,
    accountName: row.bankAccount?.accountName ?? null,
    bankName: row.bankAccount?.bankName ?? null,
    customerName:
      row.customer?.name ??
      row.transporter?.name ??
      row.investmentCompany?.name ??
      "—",
    direction: row.direction,
    amount: row.amount.toString(),
    canEdit: canModify,
    canDelete: canModify,
  };
}

function validatePaymentInput(input: PaymentInput) {
  const party = parsePaymentParty(input);
  const amount = toDecimal(input.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  const bankAccountId = input.bankAccountId?.trim() ?? "";
  if (!bankAccountId) throw new Error("Select an account");
  return {
    date: parseDate(input.date),
    party,
    bankAccountId,
    direction: parseDirection(String(input.direction)),
    amount,
  };
}

const paymentInclude = {
  customer: { select: { id: true, name: true } },
  transporter: { select: { id: true, name: true } },
  investmentCompany: { select: { id: true, name: true } },
  bankAccount: { select: { id: true, accountName: true, bankName: true } },
} as const;

const paymentOrderBy = [
  { date: "desc" as const },
  { createdAt: "desc" as const },
];

/** Remote pooler round-trips routinely exceed Prisma's 5s interactive default. */
const paymentTransactionOptions = {
  maxWait: 10_000,
  timeout: 20_000,
} as const;

function partyForeignKeys(party: PaymentParty) {
  return {
    customerId: party.kind === "customer" ? party.id : null,
    transporterId: party.kind === "transporter" ? party.id : null,
    investmentCompanyId: party.kind === "investment" ? party.id : null,
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
  if (party.kind === "transporter") {
    const transporter = await prisma.transporter.findUnique({
      where: { id: party.id },
      select: { id: true },
    });
    if (!transporter) throw new Error("Transporter not found");
    return;
  }
  const company = await prisma.investmentCompany.findUnique({
    where: { id: party.id },
    select: { id: true },
  });
  if (!company) throw new Error("Investment company not found");
}

async function assertBankAccountExists(id: string) {
  const account = await prisma.bankAccount.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!account) throw new Error("Bank account not found");
}

function revalidatePaymentPaths(party?: PaymentParty) {
  revalidatePath("/payments");
  revalidatePath("/customers");
  if (!party || party.kind === "transporter") {
    revalidatePath("/transporters");
    revalidatePath("/reports/transport/due");
    revalidatePath("/reports/transport/ledger");
  }
  if (!party || party.kind === "investment") {
    revalidatePath("/investments");
    revalidatePath("/reports/investments");
  }
}

function paymentWhere(options?: {
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
  account?: string;
}): Prisma.PaymentWhereInput {
  const and: Prisma.PaymentWhereInput[] = [];
  const date = utcDayRange(options?.dateFrom, options?.dateTo);
  if (date) and.push({ date });

  const parsedParty = tryParsePartyKey(options?.party);
  if (parsedParty?.kind === "customer") {
    and.push({ customerId: parsedParty.id });
  } else if (parsedParty?.kind === "transporter") {
    and.push({ transporterId: parsedParty.id });
  } else if (parsedParty?.kind === "investment") {
    and.push({ investmentCompanyId: parsedParty.id });
  }

  const flowType = parseFundFlowType(options?.type);
  if (flowType === "received") {
    and.push({ direction: PaymentDirection.RECEIVED });
  } else if (flowType === "paid") {
    and.push({ direction: PaymentDirection.SENT });
  }

  const accountId = options?.account?.trim() ?? "";
  if (accountId) and.push({ bankAccountId: accountId });

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
  account?: string;
}): Promise<PaymentListResult> {
  const access = await requirePage("payments-transactions");
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
      rows: rows.map((row) => toPaymentRow(row, access)),
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
    rows: rows.map((row) => toPaymentRow(row, access)),
    total,
    page,
    pageSize,
    totalPages,
    totals,
  };
}

async function loadPaymentRow(
  id: string,
  access: Exclude<Access, { kind: "none" }>,
): Promise<PaymentRow> {
  const row = await prisma.payment.findUnique({
    where: { id },
    include: paymentInclude,
  });
  if (!row) throw new Error("Payment not found");
  return toPaymentRow(row, access);
}

export async function createPayment(input: PaymentInput): Promise<PaymentRow> {
  const access = await requirePage("payments-transactions");
  const data = validatePaymentInput(input);
  await Promise.all([
    assertPartyExists(data.party),
    assertBankAccountExists(data.bankAccountId),
  ]);

  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.payment.create({
      data: {
        date: data.date,
        direction: data.direction,
        amount: data.amount,
        bankAccountId: data.bankAccountId,
        ...(access.kind === "staff" ? { createdByStaffId: access.id } : {}),
        ...partyForeignKeys(data.party),
      },
      select: { id: true },
    });

    if (data.party.kind === "customer") {
      await adjustCustomerDue(
        tx,
        data.party.id,
        paymentDueDelta(data.direction, data.amount),
      );
    }

    return row;
  }, paymentTransactionOptions);

  revalidatePaymentPaths(data.party);
  return loadPaymentRow(created.id, access);
}

export async function updatePayment(
  id: string,
  input: PaymentInput,
): Promise<PaymentRow> {
  const access = await requirePage("payments-transactions");
  const data = validatePaymentInput(input);

  const existing = await prisma.payment.findUnique({
    where: { id },
    select: {
      id: true,
      customerId: true,
      transporterId: true,
      investmentCompanyId: true,
      direction: true,
      amount: true,
      createdAt: true,
      createdByStaffId: true,
    },
  });
  if (!existing) throw new Error("Payment not found");
  if (!canModifyPayment(access, existing)) {
    throw new AccessDeniedError(
      "You can edit only your own payment entry on the same day.",
    );
  }

  await Promise.all([
    assertPartyExists(data.party),
    assertBankAccountExists(data.bankAccountId),
  ]);

  await prisma.$transaction(async (tx) => {
    if (existing.customerId) {
      await adjustCustomerDue(
        tx,
        existing.customerId,
        paymentDueDelta(existing.direction, existing.amount).neg(),
      );
    }

    await tx.payment.update({
      where: { id },
      data: {
        date: data.date,
        direction: data.direction,
        amount: data.amount,
        bankAccountId: data.bankAccountId,
        ...partyForeignKeys(data.party),
      },
      select: { id: true },
    });

    if (data.party.kind === "customer") {
      await adjustCustomerDue(
        tx,
        data.party.id,
        paymentDueDelta(data.direction, data.amount),
      );
    }
  }, paymentTransactionOptions);

  revalidatePaymentPaths(data.party);
  return loadPaymentRow(id, access);
}

export async function deletePayment(id: string) {
  const access = await requirePage("payments-transactions");
  const existing = await prisma.payment.findUnique({
    where: { id },
    select: {
      id: true,
      customerId: true,
      transporterId: true,
      investmentCompanyId: true,
      direction: true,
      amount: true,
      createdAt: true,
      createdByStaffId: true,
    },
  });
  if (!existing) throw new Error("Payment not found");
  if (!canModifyPayment(access, existing)) {
    throw new AccessDeniedError(
      "You can delete only your own payment entry on the same day.",
    );
  }

  await prisma.$transaction(async (tx) => {
    if (existing.customerId) {
      await adjustCustomerDue(
        tx,
        existing.customerId,
        paymentDueDelta(existing.direction, existing.amount).neg(),
      );
    }
    await tx.payment.delete({ where: { id } });
  }, paymentTransactionOptions);

  revalidatePaymentPaths(
    existing.transporterId
      ? { kind: "transporter", id: existing.transporterId }
      : existing.investmentCompanyId
        ? { kind: "investment", id: existing.investmentCompanyId }
        : undefined,
  );
}
