"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal } from "@/lib/domain/computations";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requirePage, type Access } from "@/lib/auth/access";

export type BookExpenseInput = {
  date: string;
  paidAccountId: string;
  indirectExpenseId: string;
  amount: string | number;
  particular: string;
};

export type BookExpenseRow = {
  id: string;
  date: string;
  paidAccountId: string;
  paidAccountName: string;
  indirectExpenseId: string;
  indirectExpenseName: string;
  amount: string;
  particular: string;
  canEdit: boolean;
  canDelete: boolean;
};

const IST_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
});

function dayKeyInIst(value: Date): string {
  return IST_DAY_FORMATTER.format(value);
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

function parseAmount(value: string | number): Decimal {
  let amount: Decimal;
  try {
    amount = toDecimal(value);
  } catch {
    throw new Error("Amount must be greater than zero");
  }
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  return amount.toDecimalPlaces(2);
}

function parseParticular(value: string): string {
  const particular = value.trim();
  if (!particular) throw new Error("Particular is required");
  return particular;
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

const expenseInclude = {
  paidAccount: { select: { id: true, accountName: true } },
  indirectExpense: { select: { id: true, name: true } },
} as const;

function toRow(
  row: {
    id: string;
    date: Date;
    amount: { toString(): string };
    particular: string;
    createdAt: Date;
    createdByStaffId: string | null;
    paidAccount: { id: string; accountName: string };
    indirectExpense: { id: string; name: string };
  },
  access: Exclude<Access, { kind: "none" }>,
): BookExpenseRow {
  const allowed = canModify(access, row);
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    paidAccountId: row.paidAccount.id,
    paidAccountName: row.paidAccount.accountName,
    indirectExpenseId: row.indirectExpense.id,
    indirectExpenseName: row.indirectExpense.name,
    amount: row.amount.toString(),
    particular: row.particular,
    canEdit: allowed,
    canDelete: allowed,
  };
}

async function assertRefs(paidAccountId: string, indirectExpenseId: string) {
  const paidId = paidAccountId.trim();
  const expenseId = indirectExpenseId.trim();
  if (!paidId) throw new Error("Select a fund paid account");
  if (!expenseId) throw new Error("Select an indirect expense");

  const [paid, expense] = await Promise.all([
    prisma.bankAccount.findUnique({
      where: { id: paidId },
      select: { id: true },
    }),
    prisma.indirectExpenseOption.findUnique({
      where: { id: expenseId },
      select: { id: true },
    }),
  ]);
  if (!paid) throw new Error("Fund paid account not found");
  if (!expense) throw new Error("Indirect expense not found");
  return { paidAccountId: paid.id, indirectExpenseId: expense.id };
}

function revalidateExpensePaths() {
  revalidatePath("/payments/book-expenses");
  revalidatePath("/payments/txn-saving");
  revalidatePath("/payments/transaction");
  revalidatePath("/payments");
  revalidatePath("/reports/bank-statement");
  revalidatePath("/reports/bank-balances");
}

export async function listBookExpenses(): Promise<BookExpenseRow[]> {
  const access = await requirePage("book-expenses");
  const rows = await prisma.bookExpense.findMany({
    include: expenseInclude,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((row) => toRow(row, access));
}

export async function createBookExpense(
  input: BookExpenseInput,
): Promise<BookExpenseRow> {
  const access = await requirePage("book-expenses");
  const refs = await assertRefs(input.paidAccountId, input.indirectExpenseId);
  const created = await prisma.bookExpense.create({
    data: {
      date: parseDate(input.date),
      paidAccountId: refs.paidAccountId,
      indirectExpenseId: refs.indirectExpenseId,
      amount: parseAmount(input.amount),
      particular: parseParticular(input.particular),
      ...(access.kind === "staff" ? { createdByStaffId: access.id } : {}),
    },
    select: { id: true },
  });
  revalidateExpensePaths();
  const row = await prisma.bookExpense.findUniqueOrThrow({
    where: { id: created.id },
    include: expenseInclude,
  });
  return toRow(row, access);
}

export async function updateBookExpense(
  id: string,
  input: BookExpenseInput,
): Promise<BookExpenseRow> {
  const access = await requirePage("book-expenses");
  const existing = await prisma.bookExpense.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Expense not found");
  if (!canModify(access, existing)) {
    throw new AccessDeniedError(
      "You can edit only your own expense on the same day.",
    );
  }
  const refs = await assertRefs(input.paidAccountId, input.indirectExpenseId);
  await prisma.bookExpense.update({
    where: { id },
    data: {
      date: parseDate(input.date),
      paidAccountId: refs.paidAccountId,
      indirectExpenseId: refs.indirectExpenseId,
      amount: parseAmount(input.amount),
      particular: parseParticular(input.particular),
    },
    select: { id: true },
  });
  revalidateExpensePaths();
  const row = await prisma.bookExpense.findUniqueOrThrow({
    where: { id },
    include: expenseInclude,
  });
  return toRow(row, access);
}

export async function deleteBookExpense(id: string) {
  const access = await requirePage("book-expenses");
  const existing = await prisma.bookExpense.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Expense not found");
  if (!canModify(access, existing)) {
    throw new AccessDeniedError(
      "You can delete only your own expense on the same day.",
    );
  }
  await prisma.bookExpense.delete({ where: { id } });
  revalidateExpensePaths();
}
