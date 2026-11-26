"use server";

import { PaymentDirection } from "@/generated/prisma";
import { requirePage } from "@/lib/auth/access";
import {
  displayOrderBalance,
  displayOrderQuantity,
  formatAmount,
  formatBankAmount,
  formatDateDdMmYyyy,
  formatOrderStatusForDisplay,
  formatQualityClass,
  formatSaleOrderMt,
} from "@/lib/domain/format";
import { toDecimal, withPurchaseOrderComputed } from "@/lib/domain/computations";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PAGE_KEY = "reports-do-in-hand";
const PAGE_PATH = "/reports/do-in-hand";

export type DoInHandPurchaseOrderRow = {
  id: string;
  poNumber: string;
  date: string;
  dateIso: string;
  vendor: string;
  vessel: string;
  qualityClass: string;
  quantity: string;
  dispatched: string;
  balance: string;
  /** PO quantity × final rate. */
  totalAmount: string;
  /** Sum of Fund Paid (SENT) for this vendor + vessel. */
  fundPaid: string;
  /** Block amount stored on the purchase order. */
  blockAmount: string;
  /** PO quantity × final rate − fund paid. */
  balanceAmountToPay: string;
  /**
   * ((Fund Paid − Block Amount) ÷ DO Rate) − Dispatched.
   */
  deliveryOrder: string;
};

export type DoInHandVesselOption = {
  id: string;
  name: string;
};

export type DoInHandFundRow = {
  id: string;
  date: string;
  dateIso: string;
  vendorId: string;
  vendorName: string;
  accountName: string;
  amount: string;
  direction: "RECEIVED" | "SENT";
  directionLabel: string;
  doVesselId: string | null;
  doVesselName: string | null;
  doStatus: "PENDING" | "COMPLETED";
  vessels: DoInHandVesselOption[];
};

async function openBalancePurchaseOrders() {
  const rows = await prisma.purchaseOrder.findMany({
    include: {
      importer: { select: { id: true, name: true } },
      vessel: { select: { id: true, vesselName: true } },
      qualityClass: {
        include: {
          origin: { select: { name: true } },
          qualityOption: { select: { name: true } },
        },
      },
    },
    orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
  });

  // Same rule as PO list Status column: displayed balance must not be 0.
  return rows
    .map(withPurchaseOrderComputed)
    .filter((row) => formatOrderStatusForDisplay(row) === "Running");
}

function vendorVesselKey(vendorId: string, vesselId: string): string {
  return `${vendorId}::${vesselId}`;
}

/**
 * Delivery Order MT = ((fund paid − block amount) ÷ DO rate) − dispatched.
 * Returns null when DO rate is missing or not positive.
 */
function computeDeliveryOrderMt(
  fundPaid: ReturnType<typeof toDecimal>,
  blockAmount: ReturnType<typeof toDecimal> | null | undefined,
  doRate: ReturnType<typeof toDecimal> | null | undefined,
  dispatched: ReturnType<typeof toDecimal>,
): ReturnType<typeof toDecimal> | null {
  if (doRate == null || !doRate.gt(0)) return null;
  const block = blockAmount != null ? blockAmount : toDecimal(0);
  return fundPaid.minus(block).div(doRate).minus(dispatched);
}

/**
 * Fund Paid total per vendor + assigned DO vessel (SENT payments only).
 */
async function fundPaidByVendorVessel(
  vendorIds: string[],
): Promise<Map<string, ReturnType<typeof toDecimal>>> {
  const totals = new Map<string, ReturnType<typeof toDecimal>>();
  if (vendorIds.length === 0) return totals;

  const payments = await prisma.payment.findMany({
    where: {
      customerId: { in: vendorIds },
      transporterId: null,
      investmentCompanyId: null,
      direction: PaymentDirection.SENT,
      doVesselId: { not: null },
    },
    select: {
      customerId: true,
      doVesselId: true,
      amount: true,
    },
  });

  for (const payment of payments) {
    if (!payment.customerId || !payment.doVesselId) continue;
    const key = vendorVesselKey(payment.customerId, payment.doVesselId);
    const prev = totals.get(key) ?? toDecimal(0);
    totals.set(key, prev.plus(toDecimal(payment.amount)));
  }

  return totals;
}

export async function listDoInHandRunningPurchaseOrders(): Promise<
  DoInHandPurchaseOrderRow[]
> {
  await requirePage(PAGE_KEY);

  const rows = await openBalancePurchaseOrders();
  const vendorIds = [...new Set(rows.map((row) => row.importerId))];
  const fundPaidMap = await fundPaidByVendorVessel(vendorIds);

  return rows.map((row) => {
    const key = vendorVesselKey(row.importerId, row.vesselId);
    const fundPaid = fundPaidMap.get(key) ?? toDecimal(0);
    const finalRate = row.finalRate != null ? toDecimal(row.finalRate) : null;
    const doRate = row.doRate != null ? toDecimal(row.doRate) : null;
    const blockAmount =
      row.blockAmount != null ? toDecimal(row.blockAmount) : null;

    let deliveryOrderDisplay = "—";
    let totalAmountDisplay = "—";
    let balanceAmountToPayDisplay = "—";
    const orderQty = toDecimal(displayOrderQuantity(row) ?? 0);
    if (finalRate != null && finalRate.gt(0)) {
      // Total amount = PO quantity × final rate
      const totalAmount = orderQty.times(finalRate);
      totalAmountDisplay = formatAmount(totalAmount);
      // Balance amount to pay = PO quantity × final rate − fund paid
      balanceAmountToPayDisplay = formatAmount(totalAmount.minus(fundPaid));
    }

    const dispatched = toDecimal(row.dispatchedOrder);
    const deliveryOrder = computeDeliveryOrderMt(
      fundPaid,
      blockAmount,
      doRate,
      dispatched,
    );
    if (deliveryOrder != null) {
      deliveryOrderDisplay = formatSaleOrderMt(deliveryOrder);
    }

    const orderDateIso = row.orderDate?.toISOString() ?? null;
    return {
      id: row.id,
      poNumber: row.poNumber,
      date: formatDateDdMmYyyy(orderDateIso),
      dateIso: orderDateIso?.slice(0, 10) ?? "",
      vendor: row.importer.name,
      vessel: row.vessel.vesselName,
      qualityClass: formatQualityClass(row.qualityClass),
      quantity: formatSaleOrderMt(displayOrderQuantity(row)),
      dispatched: formatSaleOrderMt(row.dispatchedOrder),
      balance: formatSaleOrderMt(displayOrderBalance(row)),
      totalAmount: totalAmountDisplay,
      fundPaid: formatAmount(fundPaid),
      blockAmount:
        row.blockAmount != null ? formatAmount(row.blockAmount) : "—",
      balanceAmountToPay: balanceAmountToPayDisplay,
      deliveryOrder: deliveryOrderDisplay,
    };
  });
}

export type HomeDoInHandRow = {
  id: string;
  vendorName: string;
  vesselName: string;
  origin: string;
  quality: string;
  doInHand: string;
};

/**
 * Home DO in Hand lists: domestic / imported, one row per running PO.
 * Includes computable DO (including 0 MT). Hides uncomputable rows.
 */
export async function getHomeDoInHandLists(): Promise<{
  domestic: HomeDoInHandRow[];
  imported: HomeDoInHandRow[];
}> {
  const rows = await openBalancePurchaseOrders();
  const vendorIds = [...new Set(rows.map((row) => row.importerId))];
  const fundPaidMap = await fundPaidByVendorVessel(vendorIds);

  const mapped = rows
    .filter((row) => row.qualityClass != null)
    .map((row) => {
      const key = vendorVesselKey(row.importerId, row.vesselId);
      const fundPaid = fundPaidMap.get(key) ?? toDecimal(0);
      const doRate = row.doRate != null ? toDecimal(row.doRate) : null;
      const blockAmount =
        row.blockAmount != null ? toDecimal(row.blockAmount) : null;
      const qc = row.qualityClass!;

      const dispatched = toDecimal(row.dispatchedOrder);
      const deliveryOrder = computeDeliveryOrderMt(
        fundPaid,
        blockAmount,
        doRate,
        dispatched,
      );

      return {
        id: row.id,
        vendorName: row.importer.name,
        vesselName: row.vessel.vesselName,
        domestic: qc.domestic === true,
        origin: qc.origin.name,
        quality: qc.qualityOption.name,
        doInHand: deliveryOrder?.toString() ?? null,
      };
    })
    // Running POs only (from openBalancePurchaseOrders). Show 0 MT rows too.
    .filter((row) => row.doInHand != null);

  function toList(domestic: boolean): HomeDoInHandRow[] {
    return mapped
      .filter((row) => row.domestic === domestic)
      .map(({ id, vendorName, vesselName, origin, quality, doInHand }) => ({
        id,
        vendorName,
        vesselName,
        origin,
        quality,
        doInHand: doInHand!,
      }));
  }

  return {
    domestic: toList(true),
    imported: toList(false),
  };
}

export async function listDoInHandFunds(): Promise<DoInHandFundRow[]> {
  await requirePage(PAGE_KEY);

  const openOrders = await openBalancePurchaseOrders();
  if (openOrders.length === 0) return [];

  const vendorIds = [...new Set(openOrders.map((row) => row.importerId))];

  const vesselsByVendor = new Map<string, DoInHandVesselOption[]>();
  for (const row of openOrders) {
    const list = vesselsByVendor.get(row.importerId) ?? [];
    if (!list.some((v) => v.id === row.vessel.id)) {
      list.push({ id: row.vessel.id, name: row.vessel.vesselName });
    }
    vesselsByVendor.set(row.importerId, list);
  }
  for (const [vendorId, list] of vesselsByVendor) {
    vesselsByVendor.set(
      vendorId,
      [...list].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  // Only fund paid / fund received for vendors who still have a PO with balance ≠ 0
  // (e.g. Umang Arya while that purchase is still open).
  const vendorIdSet = new Set(vendorIds);
  const payments = await prisma.payment.findMany({
    where: {
      customerId: { in: vendorIds },
      transporterId: null,
      investmentCompanyId: null,
    },
    include: {
      customer: { select: { id: true, name: true } },
      bankAccount: { select: { accountName: true, bankName: true } },
      doVessel: { select: { id: true, vesselName: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  const mapped: DoInHandFundRow[] = payments
    .filter(
      (row) =>
        !!row.customerId &&
        !!row.customer &&
        vendorIdSet.has(row.customerId) &&
        vesselsByVendor.has(row.customerId),
    )
    .map((row) => {
      const vendorId = row.customerId!;
      const accountName = row.bankAccount
        ? row.bankAccount.bankName
          ? `${row.bankAccount.accountName} (${row.bankAccount.bankName})`
          : row.bankAccount.accountName
        : "—";
      return {
        id: row.id,
        date: formatDateDdMmYyyy(row.date.toISOString()),
        dateIso: row.date.toISOString().slice(0, 10),
        vendorId,
        vendorName: row.customer!.name,
        accountName,
        amount: formatBankAmount(row.amount),
        direction: row.direction,
        directionLabel:
          row.direction === "RECEIVED" ? "Fund received" : "Fund paid",
        doVesselId: row.doVesselId,
        doVesselName: row.doVessel?.vesselName ?? null,
        doStatus: row.doStatus,
        vessels: vesselsByVendor.get(vendorId) ?? [],
      };
    });

  mapped.sort((a, b) => {
    if (a.doStatus !== b.doStatus) {
      return a.doStatus === "PENDING" ? -1 : 1;
    }
    return b.dateIso.localeCompare(a.dateIso);
  });

  return mapped;
}

export async function updateDoInHandVessel(input: {
  paymentId: string;
  vesselId: string | null;
}): Promise<DoInHandFundRow> {
  await requirePage(PAGE_KEY);

  const paymentId = input.paymentId.trim();
  if (!paymentId) throw new Error("Payment not found");

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, customerId: true },
  });
  if (!payment?.customerId) throw new Error("Payment not found");

  const vesselId = input.vesselId?.trim() || null;
  if (vesselId) {
    const openOrders = await openBalancePurchaseOrders();
    const link = openOrders.find(
      (row) =>
        row.importerId === payment.customerId && row.vesselId === vesselId,
    );
    if (!link) {
      throw new Error("Vessel does not have an open balance for this vendor");
    }
  }

  // Null vessel = Non-Vessel Adjustment (amount adjusted, not tied to a vessel).
  await prisma.payment.update({
    where: { id: paymentId },
    data: { doVesselId: vesselId },
  });

  revalidatePath(PAGE_PATH);
  const rows = await listDoInHandFunds();
  const updated = rows.find((row) => row.id === paymentId);
  if (!updated) throw new Error("Payment not found on DO in Hand list");
  return updated;
}

export async function updateDoInHandStatus(input: {
  paymentId: string;
  status: "PENDING" | "COMPLETED";
}): Promise<DoInHandFundRow> {
  await requirePage(PAGE_KEY);

  const paymentId = input.paymentId.trim();
  if (!paymentId) throw new Error("Payment not found");
  if (input.status !== "PENDING" && input.status !== "COMPLETED") {
    throw new Error("Invalid DO status");
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true },
  });
  if (!payment) throw new Error("Payment not found");
  // COMPLETED with no vessel is allowed for Non-Vessel Adjustment.

  await prisma.payment.update({
    where: { id: paymentId },
    data: { doStatus: input.status },
  });

  revalidatePath(PAGE_PATH);
  const rows = await listDoInHandFunds();
  const updated = rows.find((row) => row.id === paymentId);
  if (!updated) throw new Error("Payment not found on DO in Hand list");
  return updated;
}
