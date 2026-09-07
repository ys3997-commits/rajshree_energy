"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal } from "@/lib/domain/computations";
import {
  discountDueDelta,
  paymentDueDelta,
} from "@/lib/domain/customerDue";
import { timeWeightedInvestedCapital } from "@/lib/domain/investmentPeriodReturn";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type InvestmentPeriodColumn = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export type InvestmentReportRow = {
  id: string;
  name: string;
  currentDue: string;
  /** periodId → amount string */
  amounts: Record<string, string>;
  /**
   * periodId → time-weighted invested capital for that period
   * (opening + fund movements weighted by days invested in the period).
   */
  investedByPeriod: Record<string, string>;
};

export type InvestmentPeriodInput = {
  name: string;
  startDate: string;
  endDate: string;
};

export type InvestmentPeriodValuesInput = {
  companyId: string;
  /** periodId → amount */
  amounts: Record<string, string>;
};

function parseDate(value: string, label: string): Date {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error(`${label} is required`);
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${label.toLowerCase()}`);
  }
  return date;
}

function parseAmount(value: string | number): Decimal {
  const d = toDecimal(value);
  if (!d.isFinite()) {
    throw new Error("Amount must be a valid number");
  }
  return d.toDecimalPlaces(2);
}

function formatDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function revalidateInvestmentReport() {
  revalidatePath("/reports/investments");
  revalidatePath("/investments");
}

/** Stable column order; backfills sortOrder when all periods still share 0. */
async function orderedInvestmentPeriods() {
  const periods = await prisma.investmentPeriod.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      sortOrder: true,
    },
  });
  const uniqueOrders = new Set(periods.map((period) => period.sortOrder));
  if (periods.length > 1 && uniqueOrders.size === 1) {
    await prisma.$transaction(
      periods.map((period, index) =>
        prisma.investmentPeriod.update({
          where: { id: period.id },
          data: { sortOrder: index },
        }),
      ),
    );
    return periods.map((period, index) => ({ ...period, sortOrder: index }));
  }
  return periods;
}

export async function listInvestmentPeriods(): Promise<InvestmentPeriodColumn[]> {
  const rows = await orderedInvestmentPeriods();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    startDate: formatDay(row.startDate),
    endDate: formatDay(row.endDate),
  }));
}

export async function listInvestmentReportRows(): Promise<InvestmentReportRow[]> {
  const [companies, periods, payments, discounts, values] = await Promise.all([
    prisma.investmentCompany.findMany({
      select: { id: true, name: true, openingDue: true },
      orderBy: { name: "asc" },
    }),
    orderedInvestmentPeriods().then((rows) =>
      rows.map((row) => ({
        id: row.id,
        startDate: row.startDate,
        endDate: row.endDate,
      })),
    ),
    prisma.payment.findMany({
      where: { investmentCompanyId: { not: null } },
      select: {
        investmentCompanyId: true,
        direction: true,
        amount: true,
        date: true,
      },
    }),
    prisma.discount.findMany({
      where: { investmentCompanyId: { not: null } },
      select: {
        investmentCompanyId: true,
        status: true,
        amount: true,
        date: true,
      },
    }),
    prisma.investmentPeriodValue.findMany({
      select: {
        companyId: true,
        periodId: true,
        amount: true,
      },
    }),
  ]);

  const dueByCompany = new Map<string, ReturnType<typeof toDecimal>>();
  const movementsByCompany = new Map<
    string,
    { date: Date; delta: ReturnType<typeof toDecimal> }[]
  >();

  for (const company of companies) {
    dueByCompany.set(company.id, toDecimal(company.openingDue));
    movementsByCompany.set(company.id, []);
  }

  for (const payment of payments) {
    if (!payment.investmentCompanyId) continue;
    const delta = paymentDueDelta(payment.direction, payment.amount);
    const current =
      dueByCompany.get(payment.investmentCompanyId) ?? toDecimal(0);
    dueByCompany.set(payment.investmentCompanyId, current.plus(delta));
    const list = movementsByCompany.get(payment.investmentCompanyId) ?? [];
    list.push({ date: payment.date, delta });
    movementsByCompany.set(payment.investmentCompanyId, list);
  }

  for (const discount of discounts) {
    if (!discount.investmentCompanyId) continue;
    const delta = discountDueDelta(discount.status, discount.amount);
    const current =
      dueByCompany.get(discount.investmentCompanyId) ?? toDecimal(0);
    dueByCompany.set(discount.investmentCompanyId, current.plus(delta));
    const list = movementsByCompany.get(discount.investmentCompanyId) ?? [];
    list.push({ date: discount.date, delta });
    movementsByCompany.set(discount.investmentCompanyId, list);
  }

  const amountsByCompany = new Map<string, Record<string, string>>();
  for (const value of values) {
    const map = amountsByCompany.get(value.companyId) ?? {};
    map[value.periodId] = value.amount.toString();
    amountsByCompany.set(value.companyId, map);
  }

  return companies.map((company) => {
    const movements = movementsByCompany.get(company.id) ?? [];
    const investedByPeriod: Record<string, string> = {};
    for (const period of periods) {
      investedByPeriod[period.id] = timeWeightedInvestedCapital({
        openingDue: company.openingDue.toString(),
        movements: movements.map((m) => ({
          date: m.date,
          delta: m.delta.toString(),
        })),
        periodStart: formatDay(period.startDate),
        periodEnd: formatDay(period.endDate),
      });
    }

    return {
      id: company.id,
      name: company.name,
      currentDue: (dueByCompany.get(company.id) ?? toDecimal(0))
        .toDecimalPlaces(2)
        .toString(),
      amounts: amountsByCompany.get(company.id) ?? {},
      investedByPeriod,
    };
  });
}

export async function createInvestmentPeriod(input: InvestmentPeriodInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Period name is required");
  const startDate = parseDate(input.startDate, "Start date");
  const endDate = parseDate(input.endDate, "End date");
  if (endDate < startDate) {
    throw new Error("End date must be on or after start date");
  }
  const last = await prisma.investmentPeriod.findFirst({
    orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    select: { sortOrder: true },
  });
  await prisma.investmentPeriod.create({
    data: {
      name,
      startDate,
      endDate,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
    select: { id: true },
  });
  revalidateInvestmentReport();
}

export async function updateInvestmentPeriod(
  id: string,
  input: InvestmentPeriodInput,
) {
  const name = input.name.trim();
  if (!name) throw new Error("Period name is required");
  const startDate = parseDate(input.startDate, "Start date");
  const endDate = parseDate(input.endDate, "End date");
  if (endDate < startDate) {
    throw new Error("End date must be on or after start date");
  }
  await prisma.investmentPeriod.update({
    where: { id },
    data: { name, startDate, endDate },
    select: { id: true },
  });
  revalidateInvestmentReport();
}

export async function deleteInvestmentPeriod(id: string) {
  await prisma.investmentPeriod.delete({ where: { id } });
  revalidateInvestmentReport();
}

/** Move a period column left/right among period columns only. */
export async function moveInvestmentPeriod(
  id: string,
  direction: "left" | "right",
) {
  const periods = await orderedInvestmentPeriods();
  const index = periods.findIndex((period) => period.id === id);
  if (index < 0) throw new Error("Period not found");
  const swapWith = direction === "left" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= periods.length) return;

  const current = periods[index]!;
  const neighbor = periods[swapWith]!;

  await prisma.$transaction([
    prisma.investmentPeriod.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.investmentPeriod.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);
  revalidateInvestmentReport();
}

export async function saveInvestmentPeriodValues(
  input: InvestmentPeriodValuesInput,
) {
  const companyId = input.companyId.trim();
  if (!companyId) throw new Error("Investment company is required");

  const company = await prisma.investmentCompany.findUnique({
    where: { id: companyId },
    select: { id: true },
  });
  if (!company) throw new Error("Investment company not found");

  const entries = Object.entries(input.amounts).filter(
    ([, value]) => value.trim() !== "" && value.trim() !== "-",
  );
  if (entries.length === 0) {
    throw new Error("Enter at least one period amount");
  }

  await prisma.$transaction(
    entries.map(([periodId, value]) =>
      prisma.investmentPeriodValue.upsert({
        where: {
          companyId_periodId: { companyId, periodId },
        },
        create: {
          companyId,
          periodId,
          amount: parseAmount(value),
        },
        update: {
          amount: parseAmount(value),
        },
      }),
    ),
  );

  revalidateInvestmentReport();
}

export async function deleteInvestmentPeriodValuesForCompany(companyId: string) {
  await prisma.investmentPeriodValue.deleteMany({ where: { companyId } });
  revalidateInvestmentReport();
}
