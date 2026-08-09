"use server";

import { prisma } from "@/lib/prisma";
import { toDecimal } from "@/lib/domain/computations";
import { computePurchaseRateBreakdown } from "@/lib/domain/purchaseRate";
import { computeSaleRateBreakdown } from "@/lib/domain/saleRate";
import { Decimal } from "@prisma/client/runtime/library";

export type LedgerCustomerOption = {
  id: string;
  name: string;
  category: string;
};

export type LedgerRow = {
  id: string;
  sortDate: string;
  sortKey: string;
  /** Dispatch date (supply side). */
  date: string | null;
  /** Sale or purchase dispatch; null for fund/discount rows. */
  dispatchType: "Sale" | "Pur" | null;
  lorryNumber: string | null;
  weight: string | null;
  basicRate: string | null;
  gst: string | null;
  tcs: string | null;
  finalAmount: string | null;
  /** Payment / discount date. */
  fundDate: string | null;
  fundType:
    | "Fund received"
    | "Fund paid"
    | "Discount received"
    | "Discount paid"
    | null;
  fundAmount: string | null;
};

export type CustomerLedgerResult = {
  customer: LedgerCustomerOption;
  rows: LedgerRow[];
};

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function mulAmount(
  rate: string | null | undefined,
  weight: Decimal,
): string | null {
  if (rate == null || rate === "") return null;
  const r = toDecimal(rate);
  if (!r.isFinite()) return null;
  return r.mul(weight).toDecimalPlaces(2).toString();
}

function saleDispatchRow(args: {
  id: string;
  dispatchDate: Date;
  lorryNumber: string | null;
  weight: Decimal;
  rate: Decimal | null;
  finalRate: Decimal | null;
  category: string;
  createdAt: Date;
}): LedgerRow {
  const breakdown = computeSaleRateBreakdown(
    args.rate?.toString() ?? null,
    args.category,
  );
  const finalRate =
    args.finalRate != null
      ? args.finalRate
      : breakdown
        ? toDecimal(breakdown.final)
        : null;

  return {
    id: `dispatch-${args.id}`,
    sortDate: isoDate(args.dispatchDate),
    sortKey: `${isoDate(args.dispatchDate)}T${args.createdAt.toISOString()}|d|${args.id}`,
    date: isoDate(args.dispatchDate),
    dispatchType: "Sale",
    lorryNumber: args.lorryNumber,
    weight: args.weight.toString(),
    basicRate: args.rate?.toString() ?? null,
    gst: breakdown?.gst ?? null,
    tcs: breakdown?.tcs ?? null,
    finalAmount:
      finalRate != null
        ? finalRate.mul(args.weight).toDecimalPlaces(2).toString()
        : null,
    fundDate: null,
    fundType: null,
    fundAmount: null,
  };
}

function purchaseDispatchRow(args: {
  id: string;
  dispatchDate: Date;
  lorryNumber: string | null;
  weight: Decimal;
  rate: Decimal | null;
  finalRate: Decimal | null;
  createdAt: Date;
}): LedgerRow {
  const breakdown = computePurchaseRateBreakdown(args.rate?.toString() ?? null);
  const finalRate =
    args.finalRate != null
      ? args.finalRate
      : breakdown
        ? toDecimal(breakdown.final)
        : null;

  return {
    id: `dispatch-${args.id}`,
    sortDate: isoDate(args.dispatchDate),
    sortKey: `${isoDate(args.dispatchDate)}T${args.createdAt.toISOString()}|d|${args.id}`,
    date: isoDate(args.dispatchDate),
    dispatchType: "Pur",
    lorryNumber: args.lorryNumber,
    weight: args.weight.toString(),
    basicRate: args.rate?.toString() ?? null,
    gst: breakdown?.gst ?? null,
    tcs: breakdown?.tcs ?? null,
    finalAmount:
      finalRate != null
        ? finalRate.mul(args.weight).toDecimalPlaces(2).toString()
        : mulAmount(breakdown?.final, args.weight),
    fundDate: null,
    fundType: null,
    fundAmount: null,
  };
}

/** Customers for the ledger dropdown (name ascending). */
export async function listLedgerCustomers(): Promise<LedgerCustomerOption[]> {
  const rows = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
  }));
}

/** Chronological ledger: sale/purchase dispatches + payments + discounts. */
export async function getCustomerLedger(
  customerId: string,
): Promise<CustomerLedgerResult | null> {
  if (!customerId) return null;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, name: true, category: true },
  });
  if (!customer) return null;

  const [saleDispatches, purchaseDispatches, payments, discounts] =
    await Promise.all([
      prisma.dispatch.findMany({
        where: { order: { customerId } },
        select: {
          id: true,
          dispatchDate: true,
          lorryNumber: true,
          dispatchedQuantity: true,
          createdAt: true,
          order: {
            select: {
              rate: true,
              finalRate: true,
              customer: { select: { category: true } },
            },
          },
        },
        orderBy: [{ dispatchDate: "asc" }, { createdAt: "asc" }],
      }),
      prisma.dispatch.findMany({
        where: { purchaseOrder: { importerId: customerId } },
        select: {
          id: true,
          dispatchDate: true,
          lorryNumber: true,
          dispatchedQuantity: true,
          createdAt: true,
          purchaseOrder: {
            select: { rate: true, finalRate: true },
          },
        },
        orderBy: [{ dispatchDate: "asc" }, { createdAt: "asc" }],
      }),
      prisma.payment.findMany({
        where: { customerId },
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
        where: { customerId },
        select: {
          id: true,
          date: true,
          status: true,
          amount: true,
          createdAt: true,
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      }),
    ]);

  const rows: LedgerRow[] = [];
  const seenDispatchIds = new Set<string>();

  for (const d of saleDispatches) {
    seenDispatchIds.add(d.id);
    rows.push(
      saleDispatchRow({
        id: d.id,
        dispatchDate: d.dispatchDate,
        lorryNumber: d.lorryNumber,
        weight: d.dispatchedQuantity,
        rate: d.order.rate,
        finalRate: d.order.finalRate,
        category: d.order.customer.category,
        createdAt: d.createdAt,
      }),
    );
  }

  for (const d of purchaseDispatches) {
    if (seenDispatchIds.has(d.id)) continue;
    rows.push(
      purchaseDispatchRow({
        id: d.id,
        dispatchDate: d.dispatchDate,
        lorryNumber: d.lorryNumber,
        weight: d.dispatchedQuantity,
        rate: d.purchaseOrder.rate,
        finalRate: d.purchaseOrder.finalRate,
        createdAt: d.createdAt,
      }),
    );
  }

  for (const p of payments) {
    const date = isoDate(p.date);
    rows.push({
      id: `payment-${p.id}`,
      sortDate: date,
      sortKey: `${date}T${p.createdAt.toISOString()}|p|${p.id}`,
      date: null,
      dispatchType: null,
      lorryNumber: null,
      weight: null,
      basicRate: null,
      gst: null,
      tcs: null,
      finalAmount: null,
      fundDate: date,
      fundType: p.direction === "RECEIVED" ? "Fund received" : "Fund paid",
      fundAmount: p.amount.toString(),
    });
  }

  for (const d of discounts) {
    const date = isoDate(d.date);
    rows.push({
      id: `discount-${d.id}`,
      sortDate: date,
      sortKey: `${date}T${d.createdAt.toISOString()}|c|${d.id}`,
      date: null,
      dispatchType: null,
      lorryNumber: null,
      weight: null,
      basicRate: null,
      gst: null,
      tcs: null,
      finalAmount: null,
      fundDate: date,
      fundType:
        d.status === "RECEIVED" ? "Discount received" : "Discount paid",
      fundAmount: d.amount.toString(),
    });
  }

  rows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      category: customer.category,
    },
    rows,
  };
}
