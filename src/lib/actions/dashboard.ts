"use server";

import { OrderStatus } from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { withOrderComputed } from "@/lib/domain/computations";

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Last 5 calendar days (including today), day-wise dispatch totals. */
export async function getDispatchTotalsLast5Days() {
  const today = startOfLocalDay(new Date());
  const rangeStart = addDays(today, -4);
  const rangeEnd = addDays(today, 1);

  const rows = await prisma.dispatch.findMany({
    where: {
      dispatchDate: {
        gte: rangeStart,
        lt: rangeEnd,
      },
    },
    select: {
      dispatchDate: true,
      dispatchedQuantity: true,
    },
  });

  const totals = new Map<string, Decimal>();
  for (let i = 0; i < 5; i++) {
    const day = addDays(rangeStart, i);
    totals.set(dayKey(day), new Decimal(0));
  }

  for (const row of rows) {
    const key = dayKey(startOfLocalDay(row.dispatchDate));
    const current = totals.get(key);
    if (current) {
      totals.set(key, current.plus(row.dispatchedQuantity));
    }
  }

  return Array.from({ length: 5 }, (_, i) => {
    const day = addDays(rangeStart, i);
    const key = dayKey(day);
    return {
      date: key,
      label: formatDayLabel(day),
      total: (totals.get(key) ?? new Decimal(0)).toString(),
      isToday: key === dayKey(today),
    };
  });
}

/** Top 5 open-balance orders, largest remaining quantity first. */
export async function getTopPendingOrdersByBalance(limit = 5) {
  const rows = await prisma.order.findMany({
    where: {
      orderStatus: {
        in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_DISPATCHED],
      },
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
