"use server";

import {
  CoalOrigin,
  CustomerCategory,
  DispatchTerms,
} from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { lineProfit } from "@/lib/domain/computations";
import {
  computeOverdue,
  discountDueDelta,
  paymentDueDelta,
  purchaseDispatchDueDelta,
  saleDispatchDueDelta,
  sumSalesSuppliedInCreditWindow,
} from "@/lib/domain/customerDue";
import { listQualityReport } from "@/lib/actions/reports";

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

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const BUSINESS_TIME_ZONE = "Asia/Kolkata";

/** Calendar day in India, YYYY-MM-DD. Matches how dispatch/payment dates are stored (UTC midnight). */
function homeBusinessDayKey(d = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: BUSINESS_TIME_ZONE });
}

function utcDayRange(isoDay: string): { gte: Date; lte: Date } {
  return {
    gte: new Date(`${isoDay}T00:00:00.000Z`),
    lte: new Date(`${isoDay}T23:59:59.999Z`),
  };
}

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addCalendarDays(isoDay: string, days: number): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

export type HomeTodayKpis = {
  date: string;
  todayDate: string;
  dispatchedQuantity: string;
  profit: string;
  fundReceived: string;
};

/**
 * Yesterday's KPIs for the Home strip. "Yesterday" is the previous India
 * calendar day; dispatch/payment rows use that UTC date (same window as reports).
 * `todayDate` is India today (used for the overdue tile).
 */
export async function getHomeTodayKpis(): Promise<HomeTodayKpis> {
  const todayDate = homeBusinessDayKey();
  const date = addCalendarDays(todayDate, -1);
  const range = utcDayRange(date);

  const [dispatches, fundAgg] = await Promise.all([
    prisma.dispatch.findMany({
      where: { dispatchDate: range },
      select: {
        dispatchedQuantity: true,
        dispatchTerms: true,
        freight: true,
        order: { select: { rate: true } },
        purchaseOrder: { select: { rate: true } },
      },
    }),
    prisma.payment.aggregate({
      where: {
        direction: "RECEIVED",
        date: range,
      },
      _sum: { amount: true },
    }),
  ]);

  let dispatchedQuantity = new Decimal(0);
  let profit = new Decimal(0);
  for (const row of dispatches) {
    dispatchedQuantity = dispatchedQuantity.plus(row.dispatchedQuantity);
    const line = lineProfit({
      saleRate: row.order.rate,
      costRate: row.purchaseOrder.rate,
      quantity: row.dispatchedQuantity,
      dispatchTerms: row.dispatchTerms,
      freight: row.freight,
    });
    if (line != null) profit = profit.plus(line);
  }

  return {
    date,
    todayDate,
    dispatchedQuantity: dispatchedQuantity.toString(),
    profit: profit.toDecimalPlaces(2).toString(),
    fundReceived: (fundAgg._sum.amount ?? new Decimal(0)).toString(),
  };
}

export type HomeLatestActivity = {
  purchaseSalesDate: string | null;
  paymentDate: string | null;
  discountDate: string | null;
};

/** Latest calendar dates entered for dispatch, bank, and discount. */
export async function getHomeLatestActivity(): Promise<HomeLatestActivity> {
  const [dispatchAgg, paymentAgg, discountAgg] = await Promise.all([
    prisma.dispatch.aggregate({ _max: { dispatchDate: true } }),
    prisma.payment.aggregate({ _max: { date: true } }),
    prisma.discount.aggregate({ _max: { date: true } }),
  ]);

  return {
    purchaseSalesDate: dispatchAgg._max.dispatchDate
      ? utcDayKey(dispatchAgg._max.dispatchDate)
      : null,
    paymentDate: paymentAgg._max.date ? utcDayKey(paymentAgg._max.date) : null,
    discountDate: discountAgg._max.date
      ? utcDayKey(discountAgg._max.date)
      : null,
  };
}

function formatUtcDayLabel(isoDay: string): string {
  const d = new Date(`${isoDay}T00:00:00.000Z`);
  const weekday = d.toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  });
  const month = d.toLocaleDateString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  return `${weekday}, ${Number(isoDay.slice(8, 10))} ${month}`;
}

function formatMonthLabel(d: Date): string {
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  return `${month} ${String(d.getFullYear()).slice(-2)}`;
}

type QualityDomestic = { domestic: boolean } | null | undefined;

type DispatchSplitRow = {
  dispatchDate: Date;
  dispatchedQuantity: Decimal;
  dispatchTerms: DispatchTerms;
  freight: Decimal | null;
  purchaseOrder: {
    rate: Decimal | null;
    qualityClass: QualityDomestic;
  };
  vessel: { qualityClass: QualityDomestic };
  order: {
    rate: Decimal | null;
    qualityClass: QualityDomestic;
  };
};

function resolveDomestic(row: DispatchSplitRow): boolean {
  return isDomesticQuality(
    row.purchaseOrder.qualityClass,
    row.vessel.qualityClass,
    row.order.qualityClass,
  );
}

function isDomesticQuality(
  purchaseQc: QualityDomestic,
  vesselQc: QualityDomestic,
  orderQc: QualityDomestic,
): boolean {
  return (purchaseQc ?? vesselQc ?? orderQc)?.domestic === true;
}

const dispatchSplitSelect = {
  dispatchDate: true,
  dispatchedQuantity: true,
  dispatchTerms: true,
  freight: true,
  purchaseOrder: {
    select: {
      rate: true,
      qualityClass: { select: { domestic: true } },
    },
  },
  vessel: {
    select: { qualityClass: { select: { domestic: true } } },
  },
  order: {
    select: {
      rate: true,
      qualityClass: { select: { domestic: true } },
    },
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

function buildBuckets(
  map: Map<string, SplitTotals>,
  keys: { key: string; label: string; isCurrent: boolean }[],
): DispatchSplitBucket[] {
  return keys.map(({ key, label, isCurrent }) =>
    toBucket(key, label, map.get(key) ?? emptySplit(), isCurrent),
  );
}

/**
 * One query for home charts: last 6 months + last 7 days, each split into
 * domestic / imported for both dispatch volume (MT) and basic-rate profit (Rs).
 * Profit also includes discounts: received adds, paid subtracts, by coal origin.
 */
export async function getHomeDispatchCharts(): Promise<{
  months: DispatchSplitBucket[];
  days: DispatchSplitBucket[];
  profitMonths: DispatchSplitBucket[];
  profitDays: DispatchSplitBucket[];
}> {
  const today = startOfLocalDay(new Date());
  const monthStart = startOfMonth(addMonths(today, -5));
  const monthEnd = startOfMonth(addMonths(today, 1));
  const currentMonthKey = monthKey(today);
  const todayKey = homeBusinessDayKey();

  const rows = await prisma.dispatch.findMany({
    where: {
      dispatchDate: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    select: dispatchSplitSelect,
  });
  const discounts = await prisma.discount.findMany({
    where: {
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
      coalOrigin: { not: null },
    },
    select: {
      date: true,
      amount: true,
      status: true,
      coalOrigin: true,
    },
  });

  const monthQty = new Map<string, SplitTotals>();
  const monthProfit = new Map<string, SplitTotals>();
  for (let i = 0; i < 6; i++) {
    const key = monthKey(addMonths(monthStart, i));
    monthQty.set(key, emptySplit());
    monthProfit.set(key, emptySplit());
  }

  const dayQty = new Map<string, SplitTotals>();
  const dayProfit = new Map<string, SplitTotals>();
  for (let i = 0; i < 7; i++) {
    const key = addCalendarDays(todayKey, i - 6);
    dayQty.set(key, emptySplit());
    dayProfit.set(key, emptySplit());
  }

  for (const row of rows) {
    const local = startOfLocalDay(row.dispatchDate);
    const domestic = resolveDomestic(row);
    const mk = monthKey(local);
    const dk = utcDayKey(row.dispatchDate);

    addToSplit(monthQty, mk, row.dispatchedQuantity, domestic);
    addToSplit(dayQty, dk, row.dispatchedQuantity, domestic);

    const profit = lineProfit({
      saleRate: row.order.rate,
      costRate: row.purchaseOrder.rate,
      quantity: row.dispatchedQuantity,
      dispatchTerms: row.dispatchTerms,
      freight: row.freight,
    });
    if (profit != null) {
      addToSplit(monthProfit, mk, profit, domestic);
      addToSplit(dayProfit, dk, profit, domestic);
    }
  }

  for (const discount of discounts) {
    if (discount.coalOrigin == null) continue;
    const delta = discountDueDelta(discount.status, discount.amount);
    if (delta.isZero()) continue;
    const domestic = discount.coalOrigin === CoalOrigin.DOMESTIC;
    const local = startOfLocalDay(discount.date);
    addToSplit(monthProfit, monthKey(local), delta, domestic);
    addToSplit(dayProfit, utcDayKey(discount.date), delta, domestic);
  }

  const monthKeys = Array.from({ length: 6 }, (_, i) => {
    const month = addMonths(monthStart, i);
    const key = monthKey(month);
    return {
      key,
      label: formatMonthLabel(month),
      isCurrent: key === currentMonthKey,
    };
  });

  const dayKeys = Array.from({ length: 7 }, (_, i) => {
    const key = addCalendarDays(todayKey, i - 6);
    return {
      key,
      label: formatUtcDayLabel(key),
      isCurrent: key === todayKey,
    };
  });

  return {
    months: buildBuckets(monthQty, monthKeys),
    days: buildBuckets(dayQty, dayKeys),
    profitMonths: buildBuckets(monthProfit, monthKeys),
    profitDays: buildBuckets(dayProfit, dayKeys),
  };
}

/**
 * Home fund chart: last 15 days of fund received only.
 * Bucket field `domestic` holds received amount; `imported` is always 0.
 */
export async function getHomeFundCharts(): Promise<{
  days: DispatchSplitBucket[];
}> {
  const todayKey = homeBusinessDayKey();
  const dayStartKey = addCalendarDays(todayKey, -14);
  const dayEndKey = addCalendarDays(todayKey, 1);

  const rows = await prisma.payment.findMany({
    where: {
      direction: "RECEIVED",
      date: {
        gte: utcDayRange(dayStartKey).gte,
        lt: utcDayRange(dayEndKey).gte,
      },
    },
    select: {
      date: true,
      amount: true,
    },
  });

  const dayTotals = new Map<string, SplitTotals>();
  for (let i = 0; i < 15; i++) {
    dayTotals.set(addCalendarDays(dayStartKey, i), emptySplit());
  }

  for (const row of rows) {
    addToSplit(dayTotals, utcDayKey(row.date), row.amount, true);
  }

  const days = Array.from({ length: 15 }, (_, i) => {
    const key = addCalendarDays(dayStartKey, i);
    return toBucket(
      key,
      formatUtcDayLabel(key),
      dayTotals.get(key) ?? emptySplit(),
      key === todayKey,
    );
  });

  return { days };
}

/**
 * Home overdue chart: total overdue for Industry + Trader customers (excludes Vendor)
 * for each of the last 15 days. Due is reconstructed from opening + dated events;
 * credit window uses end of that day as asOf.
 * Bucket field `domestic` holds overdue amount; `imported` is always 0.
 */
export async function getHomeOverdueCharts(): Promise<{
  days: DispatchSplitBucket[];
}> {
  const todayKey = homeBusinessDayKey();
  const dayStartKey = addCalendarDays(todayKey, -14);

  const customers = await prisma.customer.findMany({
    where: {
      category: {
        in: [CustomerCategory.INDUSTRY, CustomerCategory.TRADER],
      },
    },
    select: { id: true, openingDue: true, creditDays: true },
  });
  const dispatches = await prisma.dispatch.findMany({
    select: {
      dispatchDate: true,
      dispatchedQuantity: true,
      order: { select: { customerId: true, finalRate: true } },
      purchaseOrder: { select: { importerId: true, finalRate: true } },
    },
  });
  const payments = await prisma.payment.findMany({
    select: {
      customerId: true,
      date: true,
      amount: true,
      direction: true,
    },
  });
  const discounts = await prisma.discount.findMany({
    select: {
      customerId: true,
      date: true,
      amount: true,
      status: true,
    },
  });

  type DueEvent = { day: string; delta: Decimal };
  type SupplyLine = { day: string; amount: Decimal; supplyDate: Date };

  const dueEventsByCustomer = new Map<string, DueEvent[]>();
  const supplyByCustomer = new Map<string, SupplyLine[]>();

  function pushDue(customerId: string, date: Date, delta: Decimal) {
    if (delta.isZero()) return;
    const list = dueEventsByCustomer.get(customerId) ?? [];
    list.push({ day: utcDayKey(date), delta });
    dueEventsByCustomer.set(customerId, list);
  }

  for (const row of dispatches) {
    if (row.order) {
      const delta = saleDispatchDueDelta(
        row.order.finalRate,
        row.dispatchedQuantity,
      );
      pushDue(row.order.customerId, row.dispatchDate, delta);
      if (delta.gt(0)) {
        const list = supplyByCustomer.get(row.order.customerId) ?? [];
        list.push({
          day: utcDayKey(row.dispatchDate),
          amount: delta,
          supplyDate: row.dispatchDate,
        });
        supplyByCustomer.set(row.order.customerId, list);
      }
    }
    if (row.purchaseOrder) {
      pushDue(
        row.purchaseOrder.importerId,
        row.dispatchDate,
        purchaseDispatchDueDelta(
          row.purchaseOrder.finalRate,
          row.dispatchedQuantity,
        ),
      );
    }
  }

  for (const payment of payments) {
    if (!payment.customerId) continue;
    pushDue(
      payment.customerId,
      payment.date,
      paymentDueDelta(payment.direction, payment.amount),
    );
  }

  for (const discount of discounts) {
    if (!discount.customerId) continue;
    pushDue(
      discount.customerId,
      discount.date,
      discountDueDelta(discount.status, discount.amount),
    );
  }

  for (const list of dueEventsByCustomer.values()) {
    list.sort((a, b) => a.day.localeCompare(b.day));
  }

  const dayTotals = new Map<string, SplitTotals>();
  for (let i = 0; i < 15; i++) {
    dayTotals.set(addCalendarDays(dayStartKey, i), emptySplit());
  }

  for (const customer of customers) {
    let due = new Decimal(customer.openingDue);
    const events = dueEventsByCustomer.get(customer.id) ?? [];
    let eventIdx = 0;
    const allSupply = supplyByCustomer.get(customer.id) ?? [];

    for (let i = 0; i < 15; i++) {
      const key = addCalendarDays(dayStartKey, i);

      while (eventIdx < events.length && events[eventIdx]!.day <= key) {
        due = due.plus(events[eventIdx]!.delta);
        eventIdx += 1;
      }

      const supplyLines = allSupply
        .filter((s) => s.day <= key)
        .map((s) => ({ amount: s.amount, supplyDate: s.supplyDate }));

      const asOf = new Date(`${key}T23:59:59.999Z`);

      const inWindow =
        customer.creditDays == null
          ? new Decimal(0)
          : sumSalesSuppliedInCreditWindow(
              supplyLines,
              customer.creditDays,
              asOf,
              customer.openingDue,
            );

      const overdue = computeOverdue(due, customer.creditDays, inWindow);
      if (overdue.gt(0)) {
        addToSplit(dayTotals, key, overdue, true);
      }
    }
  }

  const days = Array.from({ length: 15 }, (_, i) => {
    const key = addCalendarDays(dayStartKey, i);
    return toBucket(
      key,
      formatUtcDayLabel(key),
      dayTotals.get(key) ?? emptySplit(),
      key === todayKey,
    );
  });

  return { days };
}

export type TopCustomerVolume = {
  id: string;
  name: string;
  volume: string;
};

type CustomerVolumeAgg = { id: string; name: string; volume: Decimal };

function toTopCustomerVolumes(
  map: Map<string, CustomerVolumeAgg>,
  limit: number,
): TopCustomerVolume[] {
  return Array.from(map.values())
    .sort((a, b) => b.volume.comparedTo(a.volume))
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      name: c.name,
      volume: c.volume.toString(),
    }));
}

function addCustomerVolume(
  map: Map<string, CustomerVolumeAgg>,
  customer: { id: string; name: string },
  qty: Decimal,
) {
  const existing = map.get(customer.id);
  if (existing) {
    existing.volume = existing.volume.plus(qty);
  } else {
    map.set(customer.id, {
      id: customer.id,
      name: customer.name,
      volume: new Decimal(qty),
    });
  }
}

/**
 * Top customers by dispatch volume in the last 30 days, split by domestic vs
 * imported quality.
 */
export async function getTopCustomersByCoalOrigin(limit = 7): Promise<{
  last30: { domestic: TopCustomerVolume[]; imported: TopCustomerVolume[] };
}> {
  const since30 = addDays(startOfLocalDay(new Date()), -30);

  const rows = await prisma.dispatch.findMany({
    where: { dispatchDate: { gte: since30 } },
    select: {
      dispatchedQuantity: true,
      purchaseOrder: {
        select: { qualityClass: { select: { domestic: true } } },
      },
      vessel: {
        select: { qualityClass: { select: { domestic: true } } },
      },
      order: {
        select: {
          qualityClass: { select: { domestic: true } },
          customer: { select: { id: true, name: true } },
        },
      },
    },
  });

  const last30Domestic = new Map<string, CustomerVolumeAgg>();
  const last30Imported = new Map<string, CustomerVolumeAgg>();

  for (const row of rows) {
    const customer = row.order.customer;
    const isDomestic = isDomesticQuality(
      row.purchaseOrder.qualityClass,
      row.vessel.qualityClass,
      row.order.qualityClass,
    );
    const last30Map = isDomestic ? last30Domestic : last30Imported;
    addCustomerVolume(last30Map, customer, row.dispatchedQuantity);
  }

  return {
    last30: {
      domestic: toTopCustomerVolumes(last30Domestic, limit),
      imported: toTopCustomerVolumes(last30Imported, limit),
    },
  };
}

export type HomeQualityStockRow = {
  id: string;
  origin: string;
  quality: string;
  stockInHand: string;
  orderInHand: string;
  unsoldQty: string;
};

/**
 * Quality-class stock lists for home: domestic / imported.
 * Hides classes where stock, order in hand, and unsold are all zero.
 */
export async function getHomeQualityStockLists(): Promise<{
  domestic: HomeQualityStockRow[];
  imported: HomeQualityStockRow[];
}> {
  const rows = await listQualityReport();

  const mapped = rows
    .map((row) => {
      const stock = Number(row.poBalance) || 0;
      const order = Number(row.soBalance) || 0;
      const unsold = Number(row.unsoldQuantity) || 0;
      return {
        id: row.id,
        domestic: row.qualityClass.domestic,
        origin: row.qualityClass.origin.name,
        quality: row.qualityClass.qualityOption.name,
        stockInHand: row.poBalance,
        orderInHand: row.soBalance,
        unsoldQty: row.unsoldQuantity,
        allZero: stock === 0 && order === 0 && unsold === 0,
      };
    })
    .filter((row) => !row.allZero);

  function toList(domestic: boolean): HomeQualityStockRow[] {
    return mapped
      .filter((row) => row.domestic === domestic)
      .map(({ id, origin, quality, stockInHand, orderInHand, unsoldQty }) => ({
        id,
        origin,
        quality,
        stockInHand,
        orderInHand,
        unsoldQty,
      }));
  }

  return {
    domestic: toList(true),
    imported: toList(false),
  };
}
