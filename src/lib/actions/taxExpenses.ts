"use server";

import { PaymentDirection } from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal } from "@/lib/domain/computations";
import { formatBankAccountLabel, toTitleCase } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requirePage, type Access } from "@/lib/auth/access";
import { hasFullPower } from "@/lib/auth/fullPower";

export type TaxExpenseInput = {
  date: string;
  paidAccountId: string;
  governmentTaxId: string;
  direction?: "RECEIVED" | "SENT" | string;
  amount: string | number;
  particular: string;
};

export type TaxExpenseRow = {
  id: string;
  date: string;
  paidAccountId: string;
  paidAccountName: string;
  governmentTaxId: string;
  governmentTaxName: string;
  direction: "RECEIVED" | "SENT";
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

function parseDirection(value: string | undefined): PaymentDirection {
  if (value === PaymentDirection.RECEIVED) return PaymentDirection.RECEIVED;
  if (value === PaymentDirection.SENT || value == null || value === "") {
    return PaymentDirection.SENT;
  }
  throw new Error("Select Fund Received or Fund Paid");
}

function parseParticular(value: string): string {
  const particular = toTitleCase(value);
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
  if (hasFullPower(access)) return true;
  if (access.kind !== "staff") return false;
  return canStaffModify(access, row);
}

const expenseInclude = {
  paidAccount: { select: { id: true, accountName: true, bankName: true } },
  governmentTax: { select: { id: true, name: true } },
} as const;

function toRow(
  row: {
    id: string;
    date: Date;
    amount: { toString(): string };
    particular: string;
    direction: PaymentDirection;
    createdAt: Date;
    createdByStaffId: string | null;
    paidAccount: { id: string; accountName: string; bankName: string };
    governmentTax: { id: string; name: string };
  },
  access: Exclude<Access, { kind: "none" }>,
): TaxExpenseRow {
  const allowed = canModify(access, row);
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    paidAccountId: row.paidAccount.id,
    paidAccountName: formatBankAccountLabel(
      row.paidAccount.accountName,
      row.paidAccount.bankName,
    ),
    governmentTaxId: row.governmentTax.id,
    governmentTaxName: row.governmentTax.name,
    direction: row.direction,
    amount: row.amount.toString(),
    particular: row.particular,
    canEdit: allowed,
    canDelete: allowed,
  };
}

async function assertRefs(paidAccountId: string, governmentTaxId: string) {
  const paidId = paidAccountId.trim();
  const taxId = governmentTaxId.trim();
  if (!paidId) throw new Error("Select a fund paid account");
  if (!taxId) throw new Error("Select a government tax");

  const [paid, tax] = await Promise.all([
    prisma.bankAccount.findUnique({
      where: { id: paidId },
      select: { id: true },
    }),
    prisma.governmentTaxOption.findUnique({
      where: { id: taxId },
      select: { id: true },
    }),
  ]);
  if (!paid) throw new Error("Fund paid account not found");
  if (!tax) throw new Error("Government tax not found");
  return { paidAccountId: paid.id, governmentTaxId: tax.id };
}

function revalidateTaxPaths() {
  revalidatePath("/payments/taxes");
  revalidatePath("/payments/book-expenses");
  revalidatePath("/payments/txn-saving");
  revalidatePath("/payments/unallocated-receipt");
  revalidatePath("/payments/transaction");
  revalidatePath("/payments");
  revalidatePath("/reports/bank-statement");
  revalidatePath("/reports/bank-balances");
}

export async function listTaxExpenses(): Promise<TaxExpenseRow[]> {
  const access = await requirePage("taxes");
  const rows = await prisma.taxExpense.findMany({
    include: expenseInclude,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((row) => toRow(row, access));
}

export async function createTaxExpense(
  input: TaxExpenseInput,
): Promise<TaxExpenseRow> {
  const access = await requirePage("taxes");
  const refs = await assertRefs(input.paidAccountId, input.governmentTaxId);
  const created = await prisma.taxExpense.create({
    data: {
      date: parseDate(input.date),
      paidAccountId: refs.paidAccountId,
      governmentTaxId: refs.governmentTaxId,
      amount: parseAmount(input.amount),
      direction: parseDirection(input.direction),
      particular: parseParticular(input.particular),
      ...(access.kind === "staff" ? { createdByStaffId: access.id } : {}),
    },
    select: { id: true },
  });
  revalidateTaxPaths();
  const row = await prisma.taxExpense.findUniqueOrThrow({
    where: { id: created.id },
    include: expenseInclude,
  });
  return toRow(row, access);
}

export async function updateTaxExpense(
  id: string,
  input: TaxExpenseInput,
): Promise<TaxExpenseRow> {
  const access = await requirePage("taxes");
  const existing = await prisma.taxExpense.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Tax entry not found");
  if (!canModify(access, existing)) {
    throw new AccessDeniedError(
      "You can edit only your own tax entry on the same day.",
    );
  }
  const refs = await assertRefs(input.paidAccountId, input.governmentTaxId);
  await prisma.taxExpense.update({
    where: { id },
    data: {
      date: parseDate(input.date),
      paidAccountId: refs.paidAccountId,
      governmentTaxId: refs.governmentTaxId,
      direction: parseDirection(input.direction),
      amount: parseAmount(input.amount),
      particular: parseParticular(input.particular),
    },
    select: { id: true },
  });
  revalidateTaxPaths();
  const row = await prisma.taxExpense.findUniqueOrThrow({
    where: { id },
    include: expenseInclude,
  });
  return toRow(row, access);
}

export async function deleteTaxExpense(id: string) {
  const access = await requirePage("taxes");
  const existing = await prisma.taxExpense.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Tax entry not found");
  if (!canModify(access, existing)) {
    throw new AccessDeniedError(
      "You can delete only your own tax entry on the same day.",
    );
  }
  await prisma.taxExpense.delete({ where: { id } });
  revalidateTaxPaths();
}
