"use server";

import { PaymentDirection, type Prisma } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import { hasDateFilter, utcDayRange } from "@/lib/domain/dateRange";
import { capitalizeName } from "@/lib/domain/format";
import { parseFundFlowType } from "@/app/(dashboard)/payments/paymentsHref";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requirePage, type Access } from "@/lib/auth/access";

const PAGE_SIZE = 35;

export type SavingAccountTxnInput = {
  date: string;
  bankAccountId?: string | null;
  direction: "RECEIVED" | "SENT" | string;
  savingAccountName: string;
  amount: string | number;
};

export type SavingAccountTxnRow = {
  id: string;
  date: string;
  bankAccountId: string | null;
  accountName: string | null;
  bankName: string | null;
  direction: "RECEIVED" | "SENT";
  savingAccountName: string;
  amount: string;
  canEdit: boolean;
  canDelete: boolean;
};

export type FundFlowTotals = {
  received: string;
  paid: string;
  net: string;
};

export type SavingAccountTxnListResult = {
  rows: SavingAccountTxnRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: FundFlowTotals | null;
};

/** Kept for TxnSavingClient compatibility with the payments-shaped props. */
export type PaymentInput = SavingAccountTxnInput;
export type PaymentRow = SavingAccountTxnRow;
export type PaymentListResult = SavingAccountTxnListResult;

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

function parseSavingAccountName(value: string): string {
  const name = capitalizeName(value);
  if (!name) throw new Error("Saving Account Name is required");
  return name;
}

const IST_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
});

function dayKeyInIst(value: Date): string {
  return IST_DAY_FORMATTER.format(value);
}

function canStaffModify(
  access: Extract<Access, { kind: "staff" }>,
  row: { createdAt: Date; createdByStaffId: string | null },
): boolean {
  if (!row.createdByStaffId) return false;
  if (row.createdByStaffId !== access.id) return false;
  return dayKeyInIst(row.createdAt) === dayKeyInIst(new Date());
}

function canModify(
  access: Exclude<Access, { kind: "none" }>,
  row: { createdAt: Date; createdByStaffId: string | null },
): boolean {
  if (access.kind === "owner") return true;
  return canStaffModify(access, row);
}

function toRow(
  row: {
    id: string;
    date: Date;
    createdAt: Date;
    createdByStaffId: string | null;
    direction: PaymentDirection;
    savingAccountName: string;
    amount: { toString(): string };
    bankAccount: { id: string; accountName: string; bankName: string } | null;
  },
  access: Exclude<Access, { kind: "none" }>,
): SavingAccountTxnRow {
  const allowed = canModify(access, row);
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    bankAccountId: row.bankAccount?.id ?? null,
    accountName: row.bankAccount?.accountName ?? null,
    bankName: row.bankAccount?.bankName ?? null,
    direction: row.direction,
    savingAccountName: row.savingAccountName,
    amount: row.amount.toString(),
    canEdit: allowed,
    canDelete: allowed,
  };
}

function validateInput(input: SavingAccountTxnInput) {
  const amount = toDecimal(input.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  const bankAccountId = input.bankAccountId?.trim() ?? "";
  if (!bankAccountId) throw new Error("Select an account");
  return {
    date: parseDate(input.date),
    bankAccountId,
    direction: parseDirection(String(input.direction)),
    savingAccountName: parseSavingAccountName(input.savingAccountName),
    amount,
  };
}

const include = {
  bankAccount: { select: { id: true, accountName: true, bankName: true } },
} as const;

const orderBy = [{ date: "desc" as const }, { createdAt: "desc" as const }];

const transactionOptions = {
  maxWait: 10_000,
  timeout: 20_000,
} as const;

async function assertBankAccountExists(id: string) {
  const account = await prisma.bankAccount.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!account) throw new Error("Bank account not found");
}

function revalidatePaths() {
  revalidatePath("/payments/txn-saving");
  revalidatePath("/payments");
  revalidatePath("/payments/transaction");
  revalidatePath("/payments/book-expenses");
  revalidatePath("/reports/bank-statement");
  revalidatePath("/reports/bank-balances");
}

function where(options?: {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  account?: string;
}): Prisma.SavingAccountTxnWhereInput {
  const and: Prisma.SavingAccountTxnWhereInput[] = [];
  const date = utcDayRange(options?.dateFrom, options?.dateTo);
  if (date) and.push({ date });

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

async function totals(
  filter: Prisma.SavingAccountTxnWhereInput,
  dateFrom?: string,
  dateTo?: string,
): Promise<FundFlowTotals | null> {
  if (!hasDateFilter(dateFrom, dateTo)) return null;

  const groups = await prisma.savingAccountTxn.groupBy({
    by: ["direction"],
    where: filter,
    _sum: { amount: true },
  });
  const received =
    groups.find((g) => g.direction === PaymentDirection.RECEIVED)?._sum
      .amount ?? 0;
  const paid =
    groups.find((g) => g.direction === PaymentDirection.SENT)?._sum.amount ?? 0;
  const receivedDec = toDecimal(received);
  const paidDec = toDecimal(paid);
  return {
    received: receivedDec.toFixed(2),
    paid: paidDec.toFixed(2),
    net: receivedDec.minus(paidDec).toFixed(2),
  };
}

export async function listSavingAccountTxns(options?: {
  page?: number;
  pageSize?: number;
  all?: boolean;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
  account?: string;
}): Promise<SavingAccountTxnListResult> {
  const access = await requirePage("txn-saving-account");
  const filter = where(options);

  if (options?.all) {
    const [rows, flowTotals] = await Promise.all([
      prisma.savingAccountTxn.findMany({
        where: filter,
        include,
        orderBy,
      }),
      totals(filter, options.dateFrom, options.dateTo),
    ]);
    return {
      rows: rows.map((row) => toRow(row, access)),
      total: rows.length,
      page: 1,
      pageSize: Math.max(1, rows.length),
      totalPages: 1,
      totals: flowTotals,
    };
  }

  const pageSize = Math.max(1, Math.min(100, options?.pageSize ?? PAGE_SIZE));
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));

  const total = await prisma.savingAccountTxn.count({ where: filter });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const [rows, flowTotals] = await Promise.all([
    prisma.savingAccountTxn.findMany({
      where: filter,
      include,
      orderBy,
      skip,
      take: pageSize,
    }),
    totals(filter, options?.dateFrom, options?.dateTo),
  ]);

  return {
    rows: rows.map((row) => toRow(row, access)),
    total,
    page,
    pageSize,
    totalPages,
    totals: flowTotals,
  };
}

async function loadRow(
  id: string,
  access: Exclude<Access, { kind: "none" }>,
): Promise<SavingAccountTxnRow> {
  const row = await prisma.savingAccountTxn.findUnique({
    where: { id },
    include,
  });
  if (!row) throw new Error("Transaction not found");
  return toRow(row, access);
}

export async function createSavingAccountTxn(
  input: SavingAccountTxnInput,
): Promise<SavingAccountTxnRow> {
  const access = await requirePage("txn-saving-account");
  const data = validateInput(input);
  await assertBankAccountExists(data.bankAccountId);

  const created = await prisma.$transaction(async (tx) => {
    return tx.savingAccountTxn.create({
      data: {
        date: data.date,
        direction: data.direction,
        amount: data.amount,
        bankAccountId: data.bankAccountId,
        savingAccountName: data.savingAccountName,
        ...(access.kind === "staff" ? { createdByStaffId: access.id } : {}),
      },
      select: { id: true },
    });
  }, transactionOptions);

  revalidatePaths();
  return loadRow(created.id, access);
}

export async function updateSavingAccountTxn(
  id: string,
  input: SavingAccountTxnInput,
): Promise<SavingAccountTxnRow> {
  const access = await requirePage("txn-saving-account");
  const data = validateInput(input);

  const existing = await prisma.savingAccountTxn.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Transaction not found");
  if (!canModify(access, existing)) {
    throw new AccessDeniedError(
      "You can edit only your own transaction on the same day.",
    );
  }

  await assertBankAccountExists(data.bankAccountId);

  await prisma.savingAccountTxn.update({
    where: { id },
    data: {
      date: data.date,
      direction: data.direction,
      amount: data.amount,
      bankAccountId: data.bankAccountId,
      savingAccountName: data.savingAccountName,
    },
    select: { id: true },
  });

  revalidatePaths();
  return loadRow(id, access);
}

export async function deleteSavingAccountTxn(id: string) {
  const access = await requirePage("txn-saving-account");
  const existing = await prisma.savingAccountTxn.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Transaction not found");
  if (!canModify(access, existing)) {
    throw new AccessDeniedError(
      "You can delete only your own transaction on the same day.",
    );
  }

  await prisma.savingAccountTxn.delete({ where: { id } });
  revalidatePaths();
}
