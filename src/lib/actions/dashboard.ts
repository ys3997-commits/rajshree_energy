"use server";

import { OrderStatus } from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { withOrderComputed } from "@/lib/domain/computations";

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatDayLabel(d: Date): string {
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  return `${weekday}, ${d.getDate()} ${month}`;
}

function formatMonthLabel(d: Date): string {
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  return `${month} ${String(d.getFullYear()).slice(-2)}`;
}

type QualityDomestic = { domestic: boolean } | null | undefined;

type DispatchSplitRow = {
  dispatchDate: Date;
  dispatchedQuantity: Decimal;
  purchaseOrder: { qualityClass: QualityDomestic };
  vessel: { qualityClass: QualityDomestic };
  order: { qualityClass: QualityDomestic };
};

function resolveDomestic(row: DispatchSplitRow): boolean {
  const qc =
    row.purchaseOrder.qualityClass ??
    row.vessel.qualityClass ??
    row.order.qualityClass;
  return qc?.domestic === true;
}

const dispatchSplitSelect = {
  dispatchDate: true,
  dispatchedQuantity: true,
  purchaseOrder: {
    select: { qualityClass: { select: { domestic: true } } },
  },
  vessel: {
    select: { qualityClass: { select: { domestic: true } } },
  },
  order: {
    select: { qualityClass: { select: { domestic: true } } },
  },
} as const;

export type DispatchSplitBucket = {
  key: string;
  label: string;
  domestic: string;
  imported: string;
  total: string;
  isCurrent: boolean;
};

type SplitTotals = { domestic: Decimal; imported: Decimal };

function emptySplit(): SplitTotals {
  return { domestic: new Decimal(0), imported: new Decimal(0) };
}

function toBucket(
  key: string,
  label: string,
  totals: SplitTotals,
  isCurrent: boolean,
): DispatchSplitBucket {
  const total = totals.domestic.plus(totals.imported);
  return {
    key,
    label,
    domestic: totals.domestic.toString(),
    imported: totals.imported.toString(),
    total: total.toString(),
    isCurrent,
  };
}

function addToSplit(
  map: Map<string, SplitTotals>,
  key: string,
  qty: Decimal,
  domestic: boolean,
) {
  const bucket = map.get(key);
  if (!bucket) return;
  if (domestic) {
    bucket.domestic = bucket.domestic.plus(qty);
  } else {
    bucket.imported = bucket.imported.plus(qty);
  }
}

/**
 * One query for both home charts: last 6 months (month-wise) and last 7 days
 * (day-wise), each split into domestic / imported.
 */
export async function getHomeDispatchCharts(): Promise<{
  months: DispatchSplitBucket[];
  days: DispatchSplitBucket[];
}> {
  const today = startOfLocalDay(new Date());
  const monthStart = startOfMonth(addMonths(today, -5));
  const monthEnd = startOfMonth(addMonths(today, 1));
  const dayStart = addDays(today, -6);
  const currentMonthKey = monthKey(today);
  const todayKey = dayKey(today);

  const rows = await prisma.dispatch.findMany({
    where: {
      dispatchDate: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    select: dispatchSplitSelect,
  });

  const monthTotals = new Map<string, SplitTotals>();
  for (let i = 0; i < 6; i++) {
    monthTotals.set(monthKey(addMonths(monthStart, i)), emptySplit());
  }

  const dayTotals = new Map<string, SplitTotals>();
  for (let i = 0; i < 7; i++) {
    dayTotals.set(dayKey(addDays(dayStart, i)), emptySplit());
  }

  for (const row of rows) {
    const local = startOfLocalDay(row.dispatchDate);
    const domestic = resolveDomestic(row);
    addToSplit(monthTotals, monthKey(local), row.dispatchedQuantity, domestic);
    addToSplit(dayTotals, dayKey(local), row.dispatchedQuantity, domestic);
  }

  const months = Array.from({ length: 6 }, (_, i) => {
    const month = addMonths(monthStart, i);
    const key = monthKey(month);
    return toBucket(
      key,
      formatMonthLabel(month),
      monthTotals.get(key) ?? emptySplit(),
      key === currentMonthKey,
    );
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(dayStart, i);
    const key = dayKey(day);
    return toBucket(
      key,
      formatDayLabel(day),
      dayTotals.get(key) ?? emptySplit(),
      key === todayKey,
    );
  });

  return { months, days };
}

/** Top 5 open-balance orders, largest remaining quantity first. */
export async function getTopPendingOrdersByBalance(limit = 5) {
  const rows = await prisma.order.findMany({
    where: {
      orderStatus: OrderStatus.RUNNING,
      quantity: { not: null },
    },
    include: {
      customer: { select: { id: true, name: true } },
    },
  });

  return rows
    .map(withOrderComputed)
    .filter((o) => o.balanceOrder != null && o.balanceOrder.gt(0))
    .sort((a, b) => b.balanceOrder!.comparedTo(a.balanceOrder!))
    .slice(0, limit)
    .map((o) => ({
      id: o.id,
      poNumber: o.poNumber,
      customerName: o.customer.name,
      balance: o.balanceOrder!.toString(),
      quantity: o.quantity!.toString(),
      dispatched: o.dispatchedOrder.toString(),
      orderStatus: o.orderStatus,
    }));
}

/** Top customers by dispatched volume over the last ~30 days. */
export async function getTopCustomersByVolumeLastMonth(limit = 5) {
  const since = addDays(startOfLocalDay(new Date()), -30);

  const rows = await prisma.dispatch.findMany({
    where: {
      dispatchDate: { gte: since },
    },
    select: {
      dispatchedQuantity: true,
      order: {
        select: {
          customer: { select: { id: true, name: true } },
        },
      },
    },
  });

  const byCustomer = new Map<
    string,
    { id: string; name: string; volume: Decimal }
  >();

  for (const row of rows) {
    const customer = row.order.customer;
    const existing = byCustomer.get(customer.id);
    if (existing) {
      existing.volume = existing.volume.plus(row.dispatchedQuantity);
    } else {
      byCustomer.set(customer.id, {
        id: customer.id,
        name: customer.name,
        volume: new Decimal(row.dispatchedQuantity),
      });
    }
  }

  return Array.from(byCustomer.values())
    .sort((a, b) => b.volume.comparedTo(a.volume))
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      name: c.name,
      volume: c.volume.toString(),
    }));
}
