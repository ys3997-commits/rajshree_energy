"use server";

import { CustomerCategory, VegPaymentBasis } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import {
  formatMonthLabel,
  monthKeyFromIsoDate,
  vegPayableAmount,
} from "@/lib/domain/vegLedger";
import { requirePage } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const VEG_LEDGER_PAGE_KEY = "reports-veg-ledger";

export type VegLedgerCustomerOption = {
  id: string;
  name: string;
};

export type VegLedgerVegOption = {
  id: string;
  name: string;
  customerId: string;
};

export type VegLedgerSupplyRow = {
  id: string;
  monthKey: string;
  monthLabel: string;
  customerId: string;
  customerName: string;
  vegId: string;
  vegName: string;
  quantity: string;
  trucks: number;
  vegRate: string;
  paymentBasis: VegPaymentBasis;
  payable: string;
};

export type VegLedgerFundType =
  | "Fund paid"
  | "Discount paid"
  | "Discount received";

export type VegLedgerFundRow = {
  id: string;
  date: string;
  vegId: string;
  vegName: string;
  fundType: VegLedgerFundType;
  amount: string;
};

export type VegLedgerRange = {
  vegId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type VegLedgerResult = {
  customer: VegLedgerCustomerOption;
  vegs: VegLedgerVegOption[];
  supplyRows: VegLedgerSupplyRow[];
  fundRows: VegLedgerFundRow[];
  openingDue: string;
  due: string;
  quantity: string;
  trucks: number;
  payable: string;
  /** Supply payable − fund paid − discount paid + discount received. */
  netPayable: string;
  fundPaid: string;
  discountPaid: string;
};

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** India calendar day — payment dates are stored as UTC midnight on that day. */
function todayIsoDay(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function isoDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1] : null;
}

function amountOrZero(value: string | null | undefined): Decimal {
  if (value == null || value === "") return new Decimal(0);
  const n = toDecimal(value);
  return n.isFinite() ? n : new Decimal(0);
}

function fundDueDelta(fundType: VegLedgerFundType, amount: string): Decimal {
  const value = amountOrZero(amount);
  if (fundType === "Fund paid" || fundType === "Discount paid") {
    return value.neg();
  }
  return value;
}

export async function listVegLedgerCustomers(): Promise<
  VegLedgerCustomerOption[]
> {
  await requirePage(VEG_LEDGER_PAGE_KEY);
  const rows = await prisma.customer.findMany({
    where: { category: CustomerCategory.INDUSTRY },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function getVegLedger(
  customerId: string,
  range: VegLedgerRange = {},
): Promise<VegLedgerResult | null> {
  if (!customerId) return null;

  await requirePage(VEG_LEDGER_PAGE_KEY);

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, name: true, category: true },
  });
  if (!customer || customer.category !== CustomerCategory.INDUSTRY) {
    return null;
  }

  const vegId = range.vegId?.trim() || "";
  const allVegs = await prisma.veg.findMany({
    where: { customerId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      customerId: true,
      paymentBasis: true,
      amount: true,
    },
  });
  const vegs = vegId ? allVegs.filter((veg) => veg.id === vegId) : allVegs;

  const vegOptions: VegLedgerVegOption[] = allVegs.map((veg) => ({
    id: veg.id,
    name: veg.name,
    customerId: veg.customerId,
  }));

  const [dispatches, payments, discounts] = await Promise.all([
    prisma.dispatch.findMany({
      where: { order: { customerId } },
      select: {
        id: true,
        dispatchDate: true,
        dispatchedQuantity: true,
      },
      orderBy: [{ dispatchDate: "asc" }, { createdAt: "asc" }],
    }),
    vegs.length
      ? prisma.vegPayment.findMany({
          where: { vegId: { in: vegs.map((veg) => veg.id) } },
          select: {
            id: true,
            date: true,
            amount: true,
            vegId: true,
            createdAt: true,
            veg: { select: { name: true } },
          },
          orderBy: [{ date: "asc" }, { createdAt: "asc" }],
        })
      : Promise.resolve([]),
    vegs.length
      ? prisma.vegDiscount.findMany({
          where: { vegId: { in: vegs.map((veg) => veg.id) } },
          select: {
            id: true,
            date: true,
            status: true,
            amount: true,
            vegId: true,
            createdAt: true,
            veg: { select: { name: true } },
          },
          orderBy: [{ date: "asc" }, { createdAt: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  const dateFrom = isoDay(range.dateFrom);
  const dateTo = isoDay(range.dateTo);

  const months = new Map<string, { quantity: Decimal; trucks: number }>();
  for (const dispatch of dispatches) {
    const date = isoDate(dispatch.dispatchDate);
    if (dateFrom && date < dateFrom) continue;
    if (dateTo && date > dateTo) continue;
    const key = monthKeyFromIsoDate(date);
    const current = months.get(key) ?? {
      quantity: new Decimal(0),
      trucks: 0,
    };
    current.quantity = current.quantity.plus(dispatch.dispatchedQuantity);
    current.trucks += 1;
    months.set(key, current);
  }

  const supplyRows: VegLedgerSupplyRow[] = [];
  const monthKeys = [...months.keys()].sort((a, b) => b.localeCompare(a));
  for (const monthKey of monthKeys) {
    const month = months.get(monthKey)!;
    const quantity = month.quantity.toDecimalPlaces(3).toString();
    for (const veg of vegs) {
      const rate = veg.amount.toString();
      supplyRows.push({
        id: `${monthKey}-${veg.id}`,
        monthKey,
        monthLabel: formatMonthLabel(monthKey),
        customerId: customer.id,
        customerName: customer.name,
        vegId: veg.id,
        vegName: veg.name,
        quantity,
        trucks: month.trucks,
        vegRate: rate,
        paymentBasis: veg.paymentBasis,
        payable: vegPayableAmount({
          paymentBasis: veg.paymentBasis,
          quantity,
          trucks: month.trucks,
          rate,
        }),
      });
    }
  }

  const allFundRows: VegLedgerFundRow[] = [];
  for (const payment of payments) {
    allFundRows.push({
      id: `payment-${payment.id}`,
      date: isoDate(payment.date),
      vegId: payment.vegId,
      vegName: payment.veg.name,
      fundType: "Fund paid",
      amount: payment.amount.toString(),
    });
  }
  for (const discount of discounts) {
    allFundRows.push({
      id: `discount-${discount.id}`,
      date: isoDate(discount.date),
      vegId: discount.vegId,
      vegName: discount.veg.name,
      fundType:
        discount.status === "RECEIVED" ? "Discount received" : "Discount paid",
      amount: discount.amount.toString(),
    });
  }
  allFundRows.sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  );

  const openingSupply = new Map<
    string,
    { quantity: Decimal; trucks: number }
  >();
  if (dateFrom) {
    for (const dispatch of dispatches) {
      const date = isoDate(dispatch.dispatchDate);
      if (date >= dateFrom) continue;
      const key = monthKeyFromIsoDate(date);
      const current = openingSupply.get(key) ?? {
        quantity: new Decimal(0),
        trucks: 0,
      };
      current.quantity = current.quantity.plus(dispatch.dispatchedQuantity);
      current.trucks += 1;
      openingSupply.set(key, current);
    }
  }

  let openingDue = new Decimal(0);
  if (dateFrom) {
    for (const veg of vegs) {
      for (const month of openingSupply.values()) {
        openingDue = openingDue.plus(
          amountOrZero(
            vegPayableAmount({
              paymentBasis: veg.paymentBasis,
              quantity: month.quantity.toString(),
              trucks: month.trucks,
              rate: veg.amount.toString(),
            }),
          ),
        );
      }
    }
    for (const row of allFundRows) {
      if (row.date < dateFrom) {
        openingDue = openingDue.plus(fundDueDelta(row.fundType, row.amount));
      }
    }
  }

  // End date filters factory supply only. Funds/discounts always run through today.
  const today = todayIsoDay();
  const fundRows = allFundRows.filter((row) => {
    if (dateFrom && row.date < dateFrom) return false;
    if (row.date > today) return false;
    return true;
  });

  let due = openingDue;
  for (const row of supplyRows) {
    due = due.plus(amountOrZero(row.payable));
  }
  for (const row of fundRows) {
    due = due.plus(fundDueDelta(row.fundType, row.amount));
  }

  const quantity = supplyRows.reduce((sum, row, index, list) => {
    const firstOfMonth = list.findIndex((item) => item.monthKey === row.monthKey) === index;
    return firstOfMonth ? sum.plus(amountOrZero(row.quantity)) : sum;
  }, new Decimal(0));
  const trucks = supplyRows.reduce((sum, row, index, list) => {
    const firstOfMonth = list.findIndex((item) => item.monthKey === row.monthKey) === index;
    return firstOfMonth ? sum + row.trucks : sum;
  }, 0);
  const payable = supplyRows.reduce(
    (sum, row) => sum.plus(amountOrZero(row.payable)),
    new Decimal(0),
  );
  let netPayable = payable;
  for (const row of fundRows) {
    netPayable = netPayable.plus(fundDueDelta(row.fundType, row.amount));
  }
  const fundPaid = fundRows.reduce(
    (sum, row) =>
      row.fundType === "Fund paid" ? sum.plus(amountOrZero(row.amount)) : sum,
    new Decimal(0),
  );
  const discountPaid = fundRows.reduce(
    (sum, row) =>
      row.fundType === "Discount paid"
        ? sum.plus(amountOrZero(row.amount))
        : sum,
    new Decimal(0),
  );

  return {
    customer: { id: customer.id, name: customer.name },
    vegs: vegOptions,
    supplyRows,
    fundRows,
    openingDue: openingDue.toDecimalPlaces(2).toString(),
    due: due.toDecimalPlaces(2).toString(),
    quantity: quantity.toDecimalPlaces(3).toString(),
    trucks,
    payable: payable.toDecimalPlaces(2).toString(),
    netPayable: netPayable.toDecimalPlaces(2).toString(),
    fundPaid: fundPaid.toDecimalPlaces(2).toString(),
    discountPaid: discountPaid.toDecimalPlaces(2).toString(),
  };
}
