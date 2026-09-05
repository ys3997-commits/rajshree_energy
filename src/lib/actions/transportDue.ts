"use server";

import { DispatchTerms } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import {
  computeTransporterDue,
  computeTransporterPayableDue,
  freightBilledAmount,
} from "@/lib/domain/transporterDue";
import { prisma } from "@/lib/prisma";

export type TransportDueRow = {
  id: string;
  name: string;
  ownerName: string | null;
  ownerContactNumber1: string | null;
  city: string | null;
  state: string | null;
  openingDue: string;
  freightBilled: string;
  paid: string;
  received: string;
  due: string;
  transporterDue: string;
  lastFundPaidDate: string | null;
  lastFundPaidAmount: string | null;
};

export type TransportDueDateRange = {
  dateStart?: string;
  dateEnd?: string;
};

function isoDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function inDateRange(
  day: string,
  dateStart?: string,
  dateEnd?: string,
): boolean {
  if (dateStart && day < dateStart) return false;
  if (dateEnd && day > dateEnd) return false;
  return true;
}

/** Transporters with a non-zero net due, highest due first. */
export async function listTransportDueRows(
  range: TransportDueDateRange = {},
): Promise<TransportDueRow[]> {
  const dateStart = range.dateStart?.trim() || undefined;
  const dateEnd = range.dateEnd?.trim() || undefined;

  const [transporters, dispatches, payments] = await Promise.all([
    prisma.transporter.findMany({
      select: {
        id: true,
        name: true,
        ownerName: true,
        ownerContactNumber1: true,
        city: true,
        state: true,
        openingDue: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.dispatch.findMany({
      where: {
        transporterId: { not: null },
        dispatchTerms: DispatchTerms.FOR,
        freight: { not: null },
      },
      select: {
        transporterId: true,
        freight: true,
        dispatchedQuantity: true,
        dispatchDate: true,
      },
    }),
    prisma.payment.findMany({
      where: { transporterId: { not: null } },
      select: {
        transporterId: true,
        direction: true,
        amount: true,
        date: true,
        createdAt: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const freightByTransporter = new Map<string, ReturnType<typeof toDecimal>>();
  for (const row of dispatches) {
    if (!row.transporterId) continue;
    if (!inDateRange(isoDay(row.dispatchDate), dateStart, dateEnd)) continue;
    const billed = freightBilledAmount(row.freight, row.dispatchedQuantity);
    const current = freightByTransporter.get(row.transporterId) ?? toDecimal(0);
    freightByTransporter.set(row.transporterId, current.plus(billed));
  }

  const paymentsByTransporter = new Map<string, typeof payments>();
  for (const payment of payments) {
    if (!payment.transporterId) continue;
    if (!inDateRange(isoDay(payment.date), dateStart, dateEnd)) continue;
    const list = paymentsByTransporter.get(payment.transporterId) ?? [];
    list.push(payment);
    paymentsByTransporter.set(payment.transporterId, list);
  }

  const rows: TransportDueRow[] = [];

  for (const transporter of transporters) {
    const freightBilled =
      freightByTransporter.get(transporter.id) ?? toDecimal(0);
    const transporterPayments = paymentsByTransporter.get(transporter.id) ?? [];

    let paid = toDecimal(0);
    let received = toDecimal(0);
    let lastFundPaid: (typeof transporterPayments)[number] | null = null;
    for (const payment of transporterPayments) {
      if (payment.direction === "SENT") {
        paid = paid.plus(payment.amount);
        if (!lastFundPaid) lastFundPaid = payment;
      } else {
        received = received.plus(payment.amount);
      }
    }

    const due = computeTransporterDue(
      transporter.openingDue,
      freightBilled,
      paid,
      received,
    );

    const transporterDue = computeTransporterPayableDue(
      transporter.openingDue,
      freightBilled,
      paid,
      received,
    );

    if (due.isZero() && transporterDue.isZero()) continue;

    rows.push({
      id: transporter.id,
      name: transporter.name,
      ownerName: transporter.ownerName,
      ownerContactNumber1: transporter.ownerContactNumber1,
      city: transporter.city,
      state: transporter.state,
      openingDue: transporter.openingDue.toDecimalPlaces(2).toString(),
      freightBilled: freightBilled.toDecimalPlaces(2).toString(),
      paid: paid.toDecimalPlaces(2).toString(),
      received: received.toDecimalPlaces(2).toString(),
      due: due.toString(),
      transporterDue: transporterDue.toString(),
      lastFundPaidDate: lastFundPaid
        ? lastFundPaid.date.toISOString().slice(0, 10)
        : null,
      lastFundPaidAmount: lastFundPaid ? lastFundPaid.amount.toString() : null,
    });
  }

  rows.sort((a, b) => Number(b.due) - Number(a.due));
  return rows;
}
