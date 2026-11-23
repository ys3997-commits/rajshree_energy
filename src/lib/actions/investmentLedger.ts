"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { toDecimal } from "@/lib/domain/computations";
import {
  discountDueDelta,
  paymentDueDelta,
} from "@/lib/domain/customerDue";
import { periodReturnDelta } from "@/lib/domain/investmentPeriodReturn";
import { requirePage } from "@/lib/auth/access";

const INVEST_LEDGER_PAGE_KEY = "reports-invest-ledger";

export type InvestLedgerCompanyOption = {
  id: string;
  name: string;
};

export type InvestLedgerReturnRow = {
  id: string;
  sortKey: string;
  date: string;
  periodName: string;
  profit: string;
  interest: string | null;
  /** Profit / loss + interest, the amount added to the investment balance. */
  amount: string;
};

export type InvestLedgerFundType =
  | "Fund received"
  | "Fund paid"
  | "Discount received"
  | "Discount paid";

export type InvestLedgerFundRow = {
  id: string;
  sortKey: string;
  date: string;
  fundType: InvestLedgerFundType;
  amount: string;
};

export type InvestmentLedgerRange = {
  dateFrom?: string;
  dateTo?: string;
};

export type InvestmentLedgerResult = {
  company: InvestLedgerCompanyOption;
  /** Balance at the start of the selected range (opening investment if no start date). */
  openingDue: string;
  /** Investment at the end of the selected range (live investment if no end date). */
  currentDue: string;
  returnRows: InvestLedgerReturnRow[];
  fundRows: InvestLedgerFundRow[];
};

type Movement = {
  date: string;
  delta: Decimal;
};

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function isoDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1] : null;
}

function inRange(
  date: string,
  dateFrom: string | null,
  dateTo: string | null,
): boolean {
  if (dateFrom && date < dateFrom) return false;
  if (dateTo && date > dateTo) return false;
  return true;
}

/** Same date rules as the customer ledger: opening rolls forward to the start date; current investment is live unless an end date is set. */
function ledgerBalances(
  openingBase: Decimal,
  movements: Movement[],
  dateFrom: string | null,
  dateTo: string | null,
): { openingDue: Decimal; currentDue: Decimal } {
  let openingDue = openingBase;
  if (dateFrom) {
    for (const movement of movements) {
      if (movement.date < dateFrom) {
        openingDue = openingDue.plus(movement.delta);
      }
    }
  }

  if (!dateTo) {
    let currentDue = openingBase;
    for (const movement of movements) {
      currentDue = currentDue.plus(movement.delta);
    }
    return { openingDue, currentDue };
  }

  let currentDue = openingDue;
  for (const movement of movements) {
    if (inRange(movement.date, dateFrom, dateTo)) {
      currentDue = currentDue.plus(movement.delta);
    }
  }
  return { openingDue, currentDue };
}

/** Investment companies for the ledger dropdown (name ascending). */
export async function listInvestLedgerCompanies(): Promise<
  InvestLedgerCompanyOption[]
> {
  await requirePage(INVEST_LEDGER_PAGE_KEY);
  const rows = await prisma.investmentCompany.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return rows.map((row) => ({ id: row.id, name: row.name }));
}

/** Chronological ledger: period profit / loss and interest, plus funds and discounts. */
export async function getInvestmentLedger(
  companyId: string,
  range: InvestmentLedgerRange = {},
): Promise<InvestmentLedgerResult | null> {
  if (!companyId) return null;
  await requirePage(INVEST_LEDGER_PAGE_KEY);

  const company = await prisma.investmentCompany.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, openingDue: true },
  });
  if (!company) return null;

  const [payments, discounts, values] = await Promise.all([
    prisma.payment.findMany({
      where: { investmentCompanyId: companyId },
      select: {
        id: true,
        date: true,
        direction: true,
        amount: true,
        createdAt: true,
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.discount.findMany({
      where: { investmentCompanyId: companyId },
      select: {
        id: true,
        date: true,
        status: true,
        amount: true,
        createdAt: true,
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.investmentPeriodValue.findMany({
      where: { companyId },
      select: {
        id: true,
        amount: true,
        interest: true,
        createdAt: true,
        period: { select: { name: true, endDate: true } },
      },
    }),
  ]);

  const movements: Movement[] = [];
  const returnRows: InvestLedgerReturnRow[] = [];
  const fundRows: InvestLedgerFundRow[] = [];

  for (const value of values) {
    const date = isoDate(value.period.endDate);
    const profit = value.amount.toString();
    const interest = value.interest?.toString() ?? null;
    const amount = periodReturnDelta(profit, interest);
    returnRows.push({
      id: `period-${value.id}`,
      sortKey: `${date}T${value.createdAt.toISOString()}|r|${value.id}`,
      date,
      periodName: value.period.name,
      profit,
      interest,
      amount,
    });
    const delta = toDecimal(amount);
    if (!delta.isZero()) {
      movements.push({ date, delta });
    }
  }

  for (const payment of payments) {
    const date = isoDate(payment.date);
    fundRows.push({
      id: `payment-${payment.id}`,
      sortKey: `${date}T${payment.createdAt.toISOString()}|p|${payment.id}`,
      date,
      fundType:
        payment.direction === "RECEIVED" ? "Fund received" : "Fund paid",
      amount: payment.amount.toString(),
    });
    movements.push({
      date,
      delta: paymentDueDelta(payment.direction, payment.amount),
    });
  }

  for (const discount of discounts) {
    const date = isoDate(discount.date);
    fundRows.push({
      id: `discount-${discount.id}`,
      sortKey: `${date}T${discount.createdAt.toISOString()}|c|${discount.id}`,
      date,
      fundType:
        discount.status === "RECEIVED" ? "Discount received" : "Discount paid",
      amount: discount.amount.toString(),
    });
    movements.push({
      date,
      delta: discountDueDelta(discount.status, discount.amount),
    });
  }

  returnRows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  fundRows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const dateFrom = isoDay(range.dateFrom);
  const dateTo = isoDay(range.dateTo);
  const balances = ledgerBalances(
    toDecimal(company.openingDue),
    movements,
    dateFrom,
    dateTo,
  );

  return {
    company: { id: company.id, name: company.name },
    openingDue: balances.openingDue.toDecimalPlaces(2).toString(),
    currentDue: balances.currentDue.toDecimalPlaces(2).toString(),
    returnRows: returnRows.filter((row) => inRange(row.date, dateFrom, dateTo)),
    fundRows: fundRows.filter((row) => inRange(row.date, dateFrom, dateTo)),
  };
}
