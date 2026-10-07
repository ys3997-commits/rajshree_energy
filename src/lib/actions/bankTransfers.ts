"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal } from "@/lib/domain/computations";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requirePage, type Access } from "@/lib/auth/access";

export type BankTransferInput = {
  date: string;
  paidAccountId: string;
  receivedAccountId: string;
  amount: string | number;
};

export type BankTransferRow = {
  id: string;
  date: string;
  paidAccountId: string;
  paidAccountName: string;
  receivedAccountId: string;
  receivedAccountName: string;
  amount: string;
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

function sameAccountName(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
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

const transferInclude = {
  paidAccount: { select: { id: true, accountName: true } },
  receivedAccount: { select: { id: true, accountName: true } },
} as const;

function toRow(
  row: {
    id: string;
    date: Date;
    amount: { toString(): string };
    createdAt: Date;
    createdByStaffId: string | null;
    paidAccount: { id: string; accountName: string };
    receivedAccount: { id: string; accountName: string };
  },
  access: Exclude<Access, { kind: "none" }>,
): BankTransferRow {
  const allowed = canModify(access, row);
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    paidAccountId: row.paidAccount.id,
    paidAccountName: row.paidAccount.accountName,
    receivedAccountId: row.receivedAccount.id,
    receivedAccountName: row.receivedAccount.accountName,
    amount: row.amount.toString(),
    canEdit: allowed,
    canDelete: allowed,
  };
}

async function assertDistinctAccounts(paidAccountId: string, receivedAccountId: string) {
  const paidId = paidAccountId.trim();
  const receivedId = receivedAccountId.trim();
  if (!paidId) throw new Error("Select a fund paid account");
  if (!receivedId) throw new Error("Select a fund received account");

  const [paid, received] = await Promise.all([
    prisma.bankAccount.findUnique({
      where: { id: paidId },
      select: { id: true, accountName: true },
    }),
    prisma.bankAccount.findUnique({
      where: { id: receivedId },
      select: { id: true, accountName: true },
    }),
  ]);
  if (!paid) throw new Error("Fund paid account not found");
  if (!received) throw new Error("Fund received account not found");
  if (paid.id === received.id || sameAccountName(paid.accountName, received.accountName)) {
    throw new Error("Fund paid and fund received cannot be the same account");
  }
  return { paidAccountId: paid.id, receivedAccountId: received.id };
}

function revalidateTransferPaths() {
  revalidatePath("/payments/transaction");
  revalidatePath("/payments");
  revalidatePath("/reports/bank-statement");
  revalidatePath("/reports/bank-balances");
}

export async function listBankTransfers(): Promise<BankTransferRow[]> {
  const access = await requirePage("bank-transfer");
  const rows = await prisma.bankTransfer.findMany({
    include: transferInclude,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((row) => toRow(row, access));
}

export async function createBankTransfer(
  input: BankTransferInput,
): Promise<BankTransferRow> {
  const access = await requirePage("bank-transfer");
  const accounts = await assertDistinctAccounts(
    input.paidAccountId,
    input.receivedAccountId,
  );
  const created = await prisma.bankTransfer.create({
    data: {
      date: parseDate(input.date),
      paidAccountId: accounts.paidAccountId,
      receivedAccountId: accounts.receivedAccountId,
      amount: parseAmount(input.amount),
      ...(access.kind === "staff" ? { createdByStaffId: access.id } : {}),
    },
    select: { id: true },
  });
  revalidateTransferPaths();
  const row = await prisma.bankTransfer.findUniqueOrThrow({
    where: { id: created.id },
    include: transferInclude,
  });
  return toRow(row, access);
}

export async function updateBankTransfer(
  id: string,
  input: BankTransferInput,
): Promise<BankTransferRow> {
  const access = await requirePage("bank-transfer");
  const existing = await prisma.bankTransfer.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Transaction not found");
  if (!canModify(access, existing)) {
    throw new AccessDeniedError(
      "You can edit only your own transaction on the same day.",
    );
  }
  const accounts = await assertDistinctAccounts(
    input.paidAccountId,
    input.receivedAccountId,
  );
  await prisma.bankTransfer.update({
    where: { id },
    data: {
      date: parseDate(input.date),
      paidAccountId: accounts.paidAccountId,
      receivedAccountId: accounts.receivedAccountId,
      amount: parseAmount(input.amount),
    },
    select: { id: true },
  });
  revalidateTransferPaths();
  const row = await prisma.bankTransfer.findUniqueOrThrow({
    where: { id },
    include: transferInclude,
  });
  return toRow(row, access);
}

export async function deleteBankTransfer(id: string) {
  const access = await requirePage("bank-transfer");
  const existing = await prisma.bankTransfer.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Transaction not found");
  if (!canModify(access, existing)) {
    throw new AccessDeniedError(
      "You can delete only your own transaction on the same day.",
    );
  }
  await prisma.bankTransfer.delete({ where: { id } });
  revalidateTransferPaths();
}
