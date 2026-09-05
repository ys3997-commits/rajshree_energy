"use server";

import { DispatchTerms } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import {
  computeTransporterDue,
  computeTransporterPayableDue,
  freightBilledAmount,
  TRANSPORTER_FREIGHT_DUE_FACTOR,
} from "@/lib/domain/transporterDue";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export type TransportLedgerTransporterOption = {
  id: string;
  name: string;
};

export type TransportLedgerRow = {
  id: string;
  sortDate: string;
  sortKey: string;
  /** Dispatch date (freight side). */
  date: string | null;
  lorryNumber: string | null;
  weight: string | null;
  freightPerMt: string | null;
  freightAmount: string | null;
  freightAmountAfterTds: string | null;
  customerName: string | null;
  portName: string | null;
  /** Payment / discount date. */
  fundDate: string | null;
  fundType:
    | "Fund paid"
    | "Fund received"
    | "Discount paid"
    | "Discount received"
    | null;
  fundAmount: string | null;
};

export type TransportLedgerRange = {
  dateFrom?: string;
  dateTo?: string;
};

export type TransportLedgerResult = {
  transporter: TransportLedgerTransporterOption;
  /** Balance at the start of the selected range (original opening if no start date). */
  openingDue: string;
  /** Due for the selected range (or full ledger if no dates). */
  due: string;
  /** Payable due after 1% TDS hold-back. */
  dueAfterTds: string;
  rows: TransportLedgerRow[];
};

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function isoDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1] : null;
}

function rowDate(row: TransportLedgerRow): string | null {
  return row.date ?? row.fundDate;
}

function amountOrZero(value: string | null | undefined): Decimal {
  if (value == null || value === "") return new Decimal(0);
  const n = toDecimal(value);
  return n.isFinite() ? n : new Decimal(0);
}

function sumFreight(rows: TransportLedgerRow[]): Decimal {
  return rows
    .filter((r) => r.date != null)
    .reduce((sum, r) => sum.plus(amountOrZero(r.freightAmount)), toDecimal(0));
}

function sumPaid(rows: TransportLedgerRow[]): Decimal {
  return rows
    .filter(
      (r) => r.fundType === "Fund paid" || r.fundType === "Discount paid",
    )
    .reduce((sum, r) => sum.plus(amountOrZero(r.fundAmount)), toDecimal(0));
}

function sumReceived(rows: TransportLedgerRow[]): Decimal {
  return rows
    .filter(
      (r) =>
        r.fundType === "Fund received" || r.fundType === "Discount received",
    )
    .reduce((sum, r) => sum.plus(amountOrZero(r.fundAmount)), toDecimal(0));
}

/** Transporters for the ledger dropdown (name ascending). */
export async function listTransportLedgerTransporters(): Promise<
  TransportLedgerTransporterOption[]
> {
  const rows = await prisma.transporter.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return rows.map((row) => ({ id: row.id, name: row.name }));
}

/** Chronological transport ledger: FOR freight trips + payments + discounts. */
export async function getTransportLedger(
  transporterId: string,
  range: TransportLedgerRange = {},
): Promise<TransportLedgerResult | null> {
  if (!transporterId) return null;

  const transporter = await prisma.transporter.findUnique({
    where: { id: transporterId },
    select: {
      id: true,
      name: true,
      openingDue: true,
    },
  });
  if (!transporter) return null;

  const [dispatches, payments, discounts] = await Promise.all([
    prisma.dispatch.findMany({
      where: {
        transporterId,
        dispatchTerms: DispatchTerms.FOR,
        freight: { not: null },
      },
      select: {
        id: true,
        dispatchDate: true,
        lorryNumber: true,
        dispatchedQuantity: true,
        freight: true,
        createdAt: true,
        order: {
          select: {
            customer: { select: { name: true } },
            port: { select: { name: true } },
          },
        },
        vessel: { select: { port: { select: { name: true } } } },
      },
      orderBy: [{ dispatchDate: "asc" }, { createdAt: "asc" }],
    }),
    prisma.payment.findMany({
      where: { transporterId },
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
      where: { transporterId },
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

  const rows: TransportLedgerRow[] = [];

  for (const d of dispatches) {
    const freightAmount = freightBilledAmount(d.freight, d.dispatchedQuantity);
    const freightAmountAfterTds = freightAmount
      .mul(TRANSPORTER_FREIGHT_DUE_FACTOR)
      .toDecimalPlaces(2);
    const date = isoDate(d.dispatchDate);
    rows.push({
      id: `dispatch-${d.id}`,
      sortDate: date,
      sortKey: `${date}T${d.createdAt.toISOString()}|d|${d.id}`,
      date,
      lorryNumber: d.lorryNumber,
      weight: d.dispatchedQuantity.toString(),
      freightPerMt: d.freight?.toString() ?? null,
      freightAmount: freightAmount.toDecimalPlaces(2).toString(),
      freightAmountAfterTds: freightAmountAfterTds.toString(),
      customerName: d.order?.customer?.name ?? null,
      portName: d.order?.port?.name ?? d.vessel?.port?.name ?? null,
      fundDate: null,
      fundType: null,
      fundAmount: null,
    });
  }

  for (const p of payments) {
    const date = isoDate(p.date);
    rows.push({
      id: `payment-${p.id}`,
      sortDate: date,
      sortKey: `${date}T${p.createdAt.toISOString()}|p|${p.id}`,
      date: null,
      lorryNumber: null,
      weight: null,
      freightPerMt: null,
      freightAmount: null,
      freightAmountAfterTds: null,
      customerName: null,
      portName: null,
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
      lorryNumber: null,
      weight: null,
      freightPerMt: null,
      freightAmount: null,
      freightAmountAfterTds: null,
      customerName: null,
      portName: null,
      fundDate: date,
      fundType:
        d.status === "RECEIVED" ? "Discount received" : "Discount paid",
      fundAmount: d.amount.toString(),
    });
  }

  rows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const dateFrom = isoDay(range.dateFrom);
  const dateTo = isoDay(range.dateTo);
  const baseOpening = toDecimal(transporter.openingDue);

  let freightBefore = toDecimal(0);
  let paidBefore = toDecimal(0);
  let receivedBefore = toDecimal(0);
  for (const row of rows) {
    const date = rowDate(row);
    if (!dateFrom || !date || date >= dateFrom) continue;
    if (row.date != null) {
      freightBefore = freightBefore.plus(amountOrZero(row.freightAmount));
    } else if (
      row.fundType === "Fund paid" ||
      row.fundType === "Discount paid"
    ) {
      paidBefore = paidBefore.plus(amountOrZero(row.fundAmount));
    } else if (
      row.fundType === "Fund received" ||
      row.fundType === "Discount received"
    ) {
      receivedBefore = receivedBefore.plus(amountOrZero(row.fundAmount));
    }
  }

  const filtered = rows.filter((row) => {
    const date = rowDate(row);
    if (!date) return false;
    if (dateFrom && date < dateFrom) return false;
    if (dateTo && date > dateTo) return false;
    return true;
  });

  const freightBilled = sumFreight(filtered);
  const paid = sumPaid(filtered);
  const received = sumReceived(filtered);

  // With a start date, opening is the due balance at that date:
  // −baseOpening + activity before the range.
  // Otherwise opening is the stored opening due.
  const openingDue = dateFrom
    ? computeTransporterDue(
        baseOpening,
        freightBefore,
        paidBefore,
        receivedBefore,
      )
    : baseOpening;

  const due = dateFrom
    ? openingDue
        .plus(freightBilled)
        .minus(paid)
        .plus(received)
        .toDecimalPlaces(2)
    : computeTransporterDue(baseOpening, freightBilled, paid, received);

  const dueAfterTds = dateFrom
    ? openingDue
        .plus(freightBilled.mul(TRANSPORTER_FREIGHT_DUE_FACTOR))
        .minus(paid)
        .plus(received)
        .toDecimalPlaces(2)
    : computeTransporterPayableDue(
        baseOpening,
        freightBilled,
        paid,
        received,
      );

  return {
    transporter: {
      id: transporter.id,
      name: transporter.name,
    },
    openingDue: openingDue.toDecimalPlaces(2).toString(),
    due: due.toDecimalPlaces(2).toString(),
    dueAfterTds: dueAfterTds.toDecimalPlaces(2).toString(),
    rows: filtered,
  };
}
