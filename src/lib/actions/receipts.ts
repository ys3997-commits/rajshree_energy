"use server";

import { DispatchTerms, ReceiptStatus, type Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  diffInQuantity,
  lineProfit,
  toDecimal,
} from "@/lib/domain/computations";
import { ensureDispatchNumbers } from "@/lib/actions/dispatch";
import { getCurrentAccess } from "@/lib/auth/access";
import {
  canEditPurchaseChecklist,
  canEditSaleChecklist,
} from "@/lib/auth/checklistEditAccess";
import { sameDayEntryPermissions } from "@/lib/auth/sameDayEntryModify";

const qualityClassInclude = {
  origin: { select: { id: true, name: true } },
  qualityOption: { select: { id: true, name: true } },
} as const;

export type DispatchFilters = {
  receiptStatus?: ReceiptStatus | "";
  purchaseUpdateStatus?: "PENDING" | "RECEIVED" | "";
  saleUpdateStatus?: "PENDING" | "RECEIVED" | "";
  poNumber?: string;
  purchasePoNumber?: string;
  vesselId?: string;
  vendorId?: string;
  customerId?: string;
  dispatchTerms?: DispatchTerms | "";
  dispatchDate?: string;
  dispatchDateStart?: string;
  dispatchDateEnd?: string;
};

export async function listDispatches(filters: DispatchFilters = {}) {
  await ensureDispatchNumbers();
  const access = await getCurrentAccess();
  if (access.kind === "none") return [];

  const where: Prisma.DispatchWhereInput = {};
  if (filters.receiptStatus) where.receiptStatus = filters.receiptStatus;
  if (filters.purchaseUpdateStatus === "RECEIVED") {
    where.entryInTally = true;
    where.AND = [
      { purchaseInvoiceNumber: { not: null } },
      { NOT: { purchaseInvoiceNumber: "" } },
    ];
  } else if (filters.purchaseUpdateStatus === "PENDING") {
    where.OR = [
      { entryInTally: false },
      { purchaseInvoiceNumber: null },
      { purchaseInvoiceNumber: "" },
    ];
  }
  if (filters.saleUpdateStatus === "RECEIVED") {
    where.AND = [
      { saleInvoiceNumber: { not: null } },
      { NOT: { saleInvoiceNumber: "" } },
      { receivingQuantity: { not: null } },
    ];
  } else if (filters.saleUpdateStatus === "PENDING") {
    where.OR = [
      { saleInvoiceNumber: null },
      { saleInvoiceNumber: "" },
      { receivingQuantity: null },
    ];
  }
  if (filters.poNumber) {
    where.poNumber = { contains: filters.poNumber, mode: "insensitive" };
  }
  if (filters.purchasePoNumber) {
    where.purchasePoNumber = {
      contains: filters.purchasePoNumber,
      mode: "insensitive",
    };
  }
  if (filters.vesselId) where.vesselId = filters.vesselId;
  if (filters.vendorId) where.importerId = filters.vendorId;
  if (filters.customerId) {
    where.order = { customerId: filters.customerId };
  }
  if (filters.dispatchTerms) {
    where.dispatchTerms = filters.dispatchTerms;
  }
  if (filters.dispatchDateStart || filters.dispatchDateEnd) {
    where.dispatchDate = {};
    if (filters.dispatchDateStart) {
      where.dispatchDate.gte = new Date(
        `${filters.dispatchDateStart}T00:00:00.000Z`,
      );
    }
    if (filters.dispatchDateEnd) {
      where.dispatchDate.lte = new Date(
        `${filters.dispatchDateEnd}T23:59:59.999Z`,
      );
    }
  } else if (filters.dispatchDate) {
    where.dispatchDate = {
      gte: new Date(`${filters.dispatchDate}T00:00:00.000Z`),
      lte: new Date(`${filters.dispatchDate}T23:59:59.999Z`),
    };
  }

  const rows = await prisma.dispatch.findMany({
    where,
    include: {
      vessel: {
        select: {
          id: true,
          vesselName: true,
          qualityClass: { include: qualityClassInclude },
          port: { select: { name: true, state: true } },
        },
      },
      importer: { select: { id: true, name: true } },
      transporter: { select: { id: true, name: true } },
      order: {
        select: {
          id: true,
          poNumber: true,
          rate: true,
          finalRate: true,
          customer: { select: { id: true, name: true } },
          qualityClass: { include: qualityClassInclude },
        },
      },
      purchaseOrder: {
        select: {
          id: true,
          poNumber: true,
          rate: true,
          finalRate: true,
          importer: { select: { id: true, name: true } },
          qualityClass: { include: qualityClassInclude },
        },
      },
    },
    orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
  });

  return rows.map((row) => {
    const freightAmount =
      row.freight != null
        ? toDecimal(row.freight).mul(row.dispatchedQuantity)
        : null;

    const qualityClass =
      row.purchaseOrder?.qualityClass ??
      row.vessel.qualityClass ??
      row.order?.qualityClass ??
      null;

    return {
      id: row.id,
      dispatchNumber: row.dispatchNumber,
      dispatchDate: row.dispatchDate,
      createdAt: row.createdAt,
      createdByStaffId: row.createdByStaffId,
      lorryNumber: row.lorryNumber,
      dispatchedQuantity: row.dispatchedQuantity,
      receivingQuantity: row.receivingQuantity,
      diffInQuantity: diffInQuantity(row),
      vesselName: row.vessel.vesselName,
      gstState: row.vessel.port?.state ?? null,
      qualityClass,
      purchasePoNumber: row.purchasePoNumber,
      purchaseOrderId: row.purchaseOrder?.id ?? null,
      vendorName: row.purchaseOrder?.importer?.name ?? null,
      purchaseBasicRate: row.purchaseOrder?.rate ?? null,
      purchaseTotalRate: row.purchaseOrder?.finalRate ?? null,
      purchaseInvoiceNumber: row.purchaseInvoiceNumber,
      salePoNumber: row.poNumber,
      orderId: row.order?.id ?? null,
      customerName: row.order?.customer?.name ?? null,
      saleBasicRate: row.order?.rate ?? null,
      saleTotalRate: row.order?.finalRate ?? null,
      saleInvoiceNumber: row.saleInvoiceNumber,
      dispatchTerms: row.dispatchTerms,
      transporterId: row.transporterId,
      transporterName: row.transporter?.name ?? null,
      freight: row.freight,
      freightAmount,
      softCopyStatus: row.softCopyStatus,
      entryInTally: row.entryInTally,
      // Profit uses basic rates only (same as master dispatch report).
      lineProfit: lineProfit({
        saleRate: row.order?.rate ?? null,
        costRate: row.purchaseOrder?.rate ?? null,
        quantity: row.dispatchedQuantity,
        dispatchTerms: row.dispatchTerms,
        freight: row.freight,
      }),
      ...sameDayEntryPermissions(access, row),
      canEditPurchase: canEditPurchaseChecklist(access, row),
      canEditSale: canEditSaleChecklist(access, row),
    };
  });
}

export async function listPendingReceipts() {
  return prisma.dispatch.findMany({
    where: { receiptStatus: ReceiptStatus.PENDING },
    include: {
      vessel: { select: { vesselName: true } },
      importer: { select: { name: true } },
      order: { select: { poNumber: true } },
      purchaseOrder: { select: { poNumber: true } },
    },
    orderBy: { dispatchDate: "asc" },
  });
}

export async function listReconciliation() {
  const rows = await prisma.dispatch.findMany({
    where: { receiptStatus: ReceiptStatus.RECEIVED },
    include: {
      vessel: { select: { vesselName: true } },
      importer: { select: { name: true } },
      purchaseOrder: { select: { poNumber: true } },
    },
    orderBy: { receiptDate: "desc" },
  });

  return rows
    .map((row) => ({
      ...row,
      diffInQuantity: diffInQuantity(row),
    }))
    .filter(
      (row) => row.diffInQuantity != null && !row.diffInQuantity.isZero(),
    );
}
