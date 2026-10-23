"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { PaymentDirection, Prisma } from "@/generated/prisma";
import { bankAccountBalance } from "@/lib/domain/bankBalance";
import { capitalizeName } from "@/lib/domain/format";
import { toDecimal } from "@/lib/domain/computations";
import { forgetMemo } from "@/lib/memoryCache";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type BankAccountListRow = {
  id: string;
  accountName: string;
  accountTypeId: string | null;
  accountTypeName: string | null;
  bankName: string;
  openingBalance: string;
};

export type BankAccountBalanceRow = {
  id: string;
  accountName: string;
  accountTypeId: string | null;
  accountTypeName: string | null;
  bankName: string;
  balance: string;
};

export type BankAccountInput = {
  accountName: string;
  accountTypeId: string;
  bankName: string;
  openingBalance?: string | number | null;
};

function parseOpeningBalance(
  value: string | number | null | undefined,
): Decimal {
  if (value === undefined || value === null || String(value).trim() === "") {
    return new Decimal(0);
  }
  const d = toDecimal(value);
  if (!d.isFinite()) {
    throw new Error("Opening balance must be a valid amount");
  }
  return d.toDecimalPlaces(2);
}

async function toBankAccountData(input: BankAccountInput) {
  const accountName =
    capitalizeName(input.accountName) ?? input.accountName.trim();
  const bankName = capitalizeName(input.bankName) ?? input.bankName.trim();
  const accountTypeId = input.accountTypeId.trim();
  if (!accountName) throw new Error("Account name is required");
  if (!accountTypeId) throw new Error("Type of account is required");
  if (!bankName) throw new Error("Bank is required");

  const accountType = await prisma.bankAccountTypeOption.findUnique({
    where: { id: accountTypeId },
    select: { id: true },
  });
  if (!accountType) throw new Error("Select a valid type of account");

  return {
    accountName,
    accountTypeId,
    bankName,
    openingBalance: parseOpeningBalance(input.openingBalance),
  };
}

function asUniqueAccountError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new Error("This bank account already exists");
  }
  throw error;
}

export async function listBankAccounts(): Promise<BankAccountListRow[]> {
  const rows = await prisma.bankAccount.findMany({
    orderBy: [{ bankName: "asc" }, { accountName: "asc" }],
    select: {
      id: true,
      accountName: true,
      accountTypeId: true,
      bankName: true,
      openingBalance: true,
      accountType: { select: { name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    accountName: row.accountName,
    accountTypeId: row.accountTypeId,
    accountTypeName: row.accountType?.name ?? null,
    bankName: row.bankName,
    openingBalance: row.openingBalance.toFixed(2),
  }));
}

function movementFor(
  totals: Map<string, { received: Decimal; paid: Decimal }>,
  accountId: string,
) {
  return (
    totals.get(accountId) ?? {
      received: new Decimal(0),
      paid: new Decimal(0),
    }
  );
}

/** Opening balance plus fund received, minus fund paid, for each bank account. */
export async function listBankAccountBalances(): Promise<BankAccountBalanceRow[]> {
  const [
    accounts,
    groups,
    paidTransfers,
    receivedTransfers,
    bookExpenses,
    savingTxns,
  ] = await Promise.all([
    prisma.bankAccount.findMany({
      orderBy: [{ accountName: "asc" }, { bankName: "asc" }],
      select: {
        id: true,
        accountName: true,
        accountTypeId: true,
        bankName: true,
        openingBalance: true,
        accountType: { select: { name: true } },
      },
    }),
    prisma.payment.groupBy({
      by: ["bankAccountId", "direction"],
      where: { bankAccountId: { not: null } },
      _sum: { amount: true },
    }),
    prisma.bankTransfer.groupBy({
      by: ["paidAccountId"],
      _sum: { amount: true },
    }),
    prisma.bankTransfer.groupBy({
      by: ["receivedAccountId"],
      _sum: { amount: true },
    }),
    prisma.bookExpense.groupBy({
      by: ["paidAccountId"],
      _sum: { amount: true },
    }),
    prisma.savingAccountTxn.groupBy({
      by: ["bankAccountId", "direction"],
      where: { bankAccountId: { not: null } },
      _sum: { amount: true },
    }),
  ]);

  const totals = new Map<string, { received: Decimal; paid: Decimal }>();
  for (const group of groups) {
    if (!group.bankAccountId) continue;
    const current = movementFor(totals, group.bankAccountId);
    const sum = toDecimal(group._sum.amount ?? 0);
    if (group.direction === PaymentDirection.RECEIVED) {
      current.received = current.received.plus(sum);
    } else {
      current.paid = current.paid.plus(sum);
    }
    totals.set(group.bankAccountId, current);
  }
  for (const group of paidTransfers) {
    const current = movementFor(totals, group.paidAccountId);
    current.paid = current.paid.plus(toDecimal(group._sum.amount ?? 0));
    totals.set(group.paidAccountId, current);
  }
  for (const group of receivedTransfers) {
    const current = movementFor(totals, group.receivedAccountId);
    current.received = current.received.plus(toDecimal(group._sum.amount ?? 0));
    totals.set(group.receivedAccountId, current);
  }
  for (const group of bookExpenses) {
    const current = movementFor(totals, group.paidAccountId);
    current.paid = current.paid.plus(toDecimal(group._sum.amount ?? 0));
    totals.set(group.paidAccountId, current);
  }
  for (const group of savingTxns) {
    if (!group.bankAccountId) continue;
    const current = movementFor(totals, group.bankAccountId);
    const sum = toDecimal(group._sum.amount ?? 0);
    if (group.direction === PaymentDirection.RECEIVED) {
      current.received = current.received.plus(sum);
    } else {
      current.paid = current.paid.plus(sum);
    }
    totals.set(group.bankAccountId, current);
  }

  return accounts.map((account) => {
    const movement = totals.get(account.id);
    return {
      id: account.id,
      accountName: account.accountName,
      accountTypeId: account.accountTypeId,
      accountTypeName: account.accountType?.name ?? null,
      bankName: account.bankName,
      balance: bankAccountBalance(
        account.openingBalance,
        movement?.received ?? 0,
        movement?.paid ?? 0,
      ).toFixed(2),
    };
  });
}

export async function createBankAccount(input: BankAccountInput) {
  try {
    await prisma.bankAccount.create({
      data: await toBankAccountData(input),
      select: { id: true },
    });
  } catch (error) {
    asUniqueAccountError(error);
  }
  forgetMemo("nav:bank-accounts");
  revalidatePath("/bank-accounts");
  revalidatePath("/payments");
  revalidatePath("/payments/transaction");
  revalidatePath("/payments/book-expenses");
  revalidatePath("/payments/txn-saving");
  revalidatePath("/reports/bank-statement");
  revalidatePath("/reports/bank-balances");
}

export async function updateBankAccount(id: string, input: BankAccountInput) {
  try {
    await prisma.bankAccount.update({
      where: { id },
      data: await toBankAccountData(input),
      select: { id: true },
    });
  } catch (error) {
    asUniqueAccountError(error);
  }
  forgetMemo("nav:bank-accounts");
  revalidatePath("/bank-accounts");
  revalidatePath("/payments");
  revalidatePath("/payments/transaction");
  revalidatePath("/payments/book-expenses");
  revalidatePath("/payments/txn-saving");
  revalidatePath("/reports/bank-statement");
  revalidatePath("/reports/bank-balances");
}

export async function deleteBankAccount(id: string) {
  try {
    await prisma.bankAccount.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new Error("This account has transactions and cannot be deleted");
    }
    throw error;
  }
  forgetMemo("nav:bank-accounts");
  revalidatePath("/bank-accounts");
  revalidatePath("/payments");
  revalidatePath("/payments/transaction");
  revalidatePath("/payments/book-expenses");
  revalidatePath("/payments/txn-saving");
  revalidatePath("/reports/bank-statement");
  revalidatePath("/reports/bank-balances");
}
