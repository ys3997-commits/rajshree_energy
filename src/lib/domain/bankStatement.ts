import { Decimal } from "@prisma/client/runtime/library";
import { bankAccountBalance } from "@/lib/domain/bankBalance";
import { toDecimal, type DecimalLike } from "@/lib/domain/computations";

export type BankStatementMovementKind = "payment" | "transfer";

export type BankStatementMovement = {
  id: string;
  date: string;
  createdAt: string;
  kind: BankStatementMovementKind;
  particular: string;
  /** Money out of the account. */
  debit: DecimalLike;
  /** Money into the account. */
  credit: DecimalLike;
};

export type BankStatementLine = {
  id: string;
  date: string;
  kind: BankStatementMovementKind;
  particular: string;
  debit: string | null;
  credit: string | null;
  balance: string;
};

export type BuiltBankStatement = {
  openingBalance: string;
  closingBalance: string;
  totalDebit: string;
  totalCredit: string;
  rows: BankStatementLine[];
};

function isoDay(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function amountOrNull(value: Decimal): string | null {
  if (value.isZero()) return null;
  return value.toDecimalPlaces(2).toFixed(2);
}

function compareMovements(a: BankStatementMovement, b: BankStatementMovement): number {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt);
  return a.id.localeCompare(b.id);
}

/**
 * Build a bank-statement ledger: opening balance for the range, chronological
 * lines with running balance, and period totals.
 */
export function buildBankStatement(
  accountOpeningBalance: DecimalLike,
  movements: BankStatementMovement[],
  range: { dateFrom?: string; dateTo?: string } = {},
): BuiltBankStatement {
  const dateFrom = isoDay(range.dateFrom);
  const dateTo = isoDay(range.dateTo);
  const sorted = [...movements].sort(compareMovements);

  let opening = toDecimal(accountOpeningBalance);
  if (!opening.isFinite()) opening = new Decimal(0);

  const inRange: BankStatementMovement[] = [];
  for (const movement of sorted) {
    if (dateFrom && movement.date < dateFrom) {
      opening = bankAccountBalance(opening, movement.credit, movement.debit);
      continue;
    }
    if (dateTo && movement.date > dateTo) continue;
    inRange.push(movement);
  }

  let running = opening.toDecimalPlaces(2);
  let totalDebit = new Decimal(0);
  let totalCredit = new Decimal(0);
  const rows: BankStatementLine[] = [];

  for (const movement of inRange) {
    const debit = toDecimal(movement.debit);
    const credit = toDecimal(movement.credit);
    const safeDebit = debit.isFinite() ? debit : new Decimal(0);
    const safeCredit = credit.isFinite() ? credit : new Decimal(0);
    running = bankAccountBalance(running, safeCredit, safeDebit);
    totalDebit = totalDebit.plus(safeDebit);
    totalCredit = totalCredit.plus(safeCredit);
    rows.push({
      id: movement.id,
      date: movement.date,
      kind: movement.kind,
      particular: movement.particular,
      debit: amountOrNull(safeDebit),
      credit: amountOrNull(safeCredit),
      balance: running.toDecimalPlaces(2).toFixed(2),
    });
  }

  return {
    openingBalance: opening.toDecimalPlaces(2).toFixed(2),
    closingBalance: running.toDecimalPlaces(2).toFixed(2),
    totalDebit: totalDebit.toDecimalPlaces(2).toFixed(2),
    totalCredit: totalCredit.toDecimalPlaces(2).toFixed(2),
    rows,
  };
}

export function paymentParticular(
  direction: "RECEIVED" | "SENT",
  partyName: string,
): string {
  const name = partyName.trim() || "—";
  return direction === "RECEIVED"
    ? `Fund received — ${name}`
    : `Fund paid — ${name}`;
}

export function transferParticular(
  side: "paid" | "received",
  otherAccountName: string,
): string {
  const name = otherAccountName.trim() || "—";
  return side === "paid" ? `Transfer to ${name}` : `Transfer from ${name}`;
}
