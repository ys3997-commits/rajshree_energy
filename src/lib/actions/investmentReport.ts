"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal } from "@/lib/domain/computations";
import {
  discountDueDelta,
  paymentDueDelta,
} from "@/lib/domain/customerDue";
import {
  periodReturnDelta,
  timeWeightedInvestedCapital,
} from "@/lib/domain/investmentPeriodReturn";
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
  /** periodId → profit / loss amount string */
  amounts: Record<string, string>;
  /** periodId → interest amount string */
  interests: Record<string, string>;
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
  /** periodId → profit / loss amount */
  amounts: Record<string, string>;
  /** periodId → interest amount */
  interests?: Record<string, string>;
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

function parseOptionalAmount(value: string | undefined): Decimal | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-") return null;
  return parseAmount(trimmed);
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
        interest: true,
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

  const periodById = new Map(periods.map((period) => [period.id, period]));
  const amountsByCompany = new Map<string, Record<string, string>>();
  const interestsByCompany = new Map<string, Record<string, string>>();
  for (const value of values) {
    const amountMap = amountsByCompany.get(value.companyId) ?? {};
    amountMap[value.periodId] = value.amount.toString();
    amountsByCompany.set(value.companyId, amountMap);
    if (value.interest != null) {
      const interestMap = interestsByCompany.get(value.companyId) ?? {};
      interestMap[value.periodId] = value.interest.toString();
      interestsByCompany.set(value.companyId, interestMap);
    }

    const period = periodById.get(value.periodId);
    if (!period) continue;
    const delta = toDecimal(
      periodReturnDelta(
        value.amount.toString(),
        value.interest?.toString() ?? null,
      ),
    );
    if (delta.isZero()) continue;
    const current = dueByCompany.get(value.companyId) ?? toDecimal(0);
    dueByCompany.set(value.companyId, current.plus(delta));
    const list = movementsByCompany.get(value.companyId) ?? [];
    list.push({ date: period.endDate, delta });
    movementsByCompany.set(value.companyId, list);
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
      interests: interestsByCompany.get(company.id) ?? {},
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
    entries.map(([periodId, value]) => {
      const interest = parseOptionalAmount(input.interests?.[periodId]);
      return prisma.investmentPeriodValue.upsert({
        where: {
          companyId_periodId: { companyId, periodId },
        },
        create: {
          companyId,
          periodId,
          amount: parseAmount(value),
          interest,
        },
        update: {
          amount: parseAmount(value),
          ...(input.interests ? { interest } : {}),
        },
      });
    }),
  );

  revalidateInvestmentReport();
}

export async function deleteInvestmentPeriodValuesForCompany(companyId: string) {
  await prisma.investmentPeriodValue.deleteMany({ where: { companyId } });
  revalidateInvestmentReport();
}
