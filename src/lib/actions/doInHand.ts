"use server";

import { DoStatus } from "@/generated/prisma";
import { requirePage } from "@/lib/auth/access";
import {
  displayOrderBalance,
  displayOrderQuantity,
  formatBankAmount,
  formatDateDdMmYyyy,
  formatOrderStatusForDisplay,
  formatQualityClass,
  formatRs,
  formatSaleOrderMt,
} from "@/lib/domain/format";
import { withPurchaseOrderComputed } from "@/lib/domain/computations";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PAGE_KEY = "reports-do-in-hand";
const PAGE_PATH = "/reports/do-in-hand";

export type DoInHandPurchaseOrderRow = {
  id: string;
  poNumber: string;
  date: string;
  vendor: string;
  vessel: string;
  qualityClass: string;
  quantity: string;
  dispatched: string;
  closing: string;
  balance: string;
  basicRate: string;
  finalRate: string;
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

export async function listDoInHandRunningPurchaseOrders(): Promise<
  DoInHandPurchaseOrderRow[]
> {
  await requirePage(PAGE_KEY);

  const rows = await openBalancePurchaseOrders();

  return rows.map((row) => ({
    id: row.id,
    poNumber: row.poNumber,
    date: formatDateDdMmYyyy(row.orderDate?.toISOString() ?? null),
    vendor: row.importer.name,
    vessel: row.vessel.vesselName,
    qualityClass: formatQualityClass(row.qualityClass),
    quantity: formatSaleOrderMt(displayOrderQuantity(row)),
    dispatched: formatSaleOrderMt(row.dispatchedOrder),
    closing: formatSaleOrderMt(row.closingQuantity),
    balance: formatSaleOrderMt(displayOrderBalance(row)),
    basicRate: formatRs(row.rate),
    finalRate: formatRs(row.finalRate),
  }));
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
    select: { id: true, customerId: true, doStatus: true },
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

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      doVesselId: vesselId,
      ...(vesselId == null && payment.doStatus === DoStatus.COMPLETED
        ? { doStatus: DoStatus.PENDING }
        : {}),
    },
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
    select: { id: true, doVesselId: true },
  });
  if (!payment) throw new Error("Payment not found");
  if (input.status === "COMPLETED" && !payment.doVesselId) {
    throw new Error("Select a vessel before marking DO");
  }

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
