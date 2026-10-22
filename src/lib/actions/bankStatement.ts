"use server";

import { PaymentDirection } from "@/generated/prisma";
import { requirePage } from "@/lib/auth/access";
import {
  bookExpenseParticular,
  buildBankStatement,
  paymentParticular,
  transferParticular,
  type BankStatementLine,
  type BankStatementMovement,
} from "@/lib/domain/bankStatement";
import { prisma } from "@/lib/prisma";

export type BankStatementAccount = {
  id: string;
  accountName: string;
  bankName: string;
};

export type BankStatementResult = {
  account: BankStatementAccount;
  openingBalance: string;
  closingBalance: string;
  totalDebit: string;
  totalCredit: string;
  rows: BankStatementLine[];
};

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export async function getBankStatement(
  accountId: string,
  range: { dateFrom?: string; dateTo?: string } = {},
): Promise<BankStatementResult | null> {
  await requirePage("reports-bank-statement");
  const id = accountId.trim();
  if (!id) return null;

  const account = await prisma.bankAccount.findUnique({
    where: { id },
    select: {
      id: true,
      accountName: true,
      bankName: true,
      openingBalance: true,
    },
  });
  if (!account) return null;

  const [
    payments,
    transfersPaid,
    transfersReceived,
    bookExpenses,
    savingTxns,
  ] = await Promise.all([
    prisma.payment.findMany({
      where: { bankAccountId: id },
      select: {
        id: true,
        date: true,
        createdAt: true,
        direction: true,
        amount: true,
        customer: { select: { name: true } },
        transporter: { select: { name: true } },
        investmentCompany: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.bankTransfer.findMany({
      where: { paidAccountId: id },
      select: {
        id: true,
        date: true,
        createdAt: true,
        amount: true,
        receivedAccount: { select: { accountName: true } },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.bankTransfer.findMany({
      where: { receivedAccountId: id },
      select: {
        id: true,
        date: true,
        createdAt: true,
        amount: true,
        paidAccount: { select: { accountName: true } },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.bookExpense.findMany({
      where: { paidAccountId: id },
      select: {
        id: true,
        date: true,
        createdAt: true,
        amount: true,
        particular: true,
        indirectExpense: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.savingAccountTxn.findMany({
      where: { bankAccountId: id },
      select: {
        id: true,
        date: true,
        createdAt: true,
        direction: true,
        amount: true,
        savingAccountName: true,
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const movements: BankStatementMovement[] = [];

  for (const payment of payments) {
    const partyName =
      payment.customer?.name ??
      payment.transporter?.name ??
      payment.investmentCompany?.name ??
      "—";
    const received = payment.direction === PaymentDirection.RECEIVED;
    movements.push({
      id: `payment:${payment.id}`,
      date: isoDate(payment.date),
      createdAt: payment.createdAt.toISOString(),
      kind: "payment",
      particular: paymentParticular(
        received ? "RECEIVED" : "SENT",
        partyName,
      ),
      debit: received ? 0 : payment.amount.toString(),
      credit: received ? payment.amount.toString() : 0,
    });
  }

  for (const transfer of transfersPaid) {
    movements.push({
      id: `transfer-out:${transfer.id}`,
      date: isoDate(transfer.date),
      createdAt: transfer.createdAt.toISOString(),
      kind: "transfer",
      particular: transferParticular(
        "paid",
        transfer.receivedAccount.accountName,
      ),
      debit: transfer.amount.toString(),
      credit: 0,
    });
  }

  for (const transfer of transfersReceived) {
    movements.push({
      id: `transfer-in:${transfer.id}`,
      date: isoDate(transfer.date),
      createdAt: transfer.createdAt.toISOString(),
      kind: "transfer",
      particular: transferParticular("received", transfer.paidAccount.accountName),
      debit: 0,
      credit: transfer.amount.toString(),
    });
  }

  for (const expense of bookExpenses) {
    movements.push({
      id: `expense:${expense.id}`,
      date: isoDate(expense.date),
      createdAt: expense.createdAt.toISOString(),
      kind: "expense",
      particular: bookExpenseParticular(
        expense.indirectExpense.name,
        expense.particular,
      ),
      debit: expense.amount.toString(),
      credit: 0,
    });
  }

  for (const txn of savingTxns) {
    const received = txn.direction === PaymentDirection.RECEIVED;
    const name = txn.savingAccountName.trim() || "—";
    movements.push({
      id: `saving:${txn.id}`,
      date: isoDate(txn.date),
      createdAt: txn.createdAt.toISOString(),
      kind: "saving",
      particular: received
        ? `Saving A/c received — ${name}`
        : `Saving A/c paid — ${name}`,
      debit: received ? 0 : txn.amount.toString(),
      credit: received ? txn.amount.toString() : 0,
    });
  }

  const built = buildBankStatement(account.openingBalance, movements, range);

  return {
    account: {
      id: account.id,
      accountName: account.accountName,
      bankName: account.bankName,
    },
    openingBalance: built.openingBalance,
    closingBalance: built.closingBalance,
    totalDebit: built.totalDebit,
    totalCredit: built.totalCredit,
    rows: built.rows,
  };
}
