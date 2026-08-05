"use server";

import { ReceiptStatus, type Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  diffInQuantity,
  lineProfit,
  toDecimal,
} from "@/lib/domain/computations";

const qualityClassInclude = {
  origin: { select: { id: true, name: true } },
  qualityOption: { select: { id: true, name: true } },
} as const;

export type DispatchFilters = {
  receiptStatus?: ReceiptStatus | "";
  poNumber?: string;
  purchasePoNumber?: string;
  vesselId?: string;
  vendorId?: string;
  customerId?: string;
  dispatchDate?: string;
};

export async function listDispatches(filters: DispatchFilters = {}) {
  const where: Prisma.DispatchWhereInput = {};
  if (filters.receiptStatus) where.receiptStatus = filters.receiptStatus;
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
  if (filters.dispatchDate) {
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
      dispatchDate: row.dispatchDate,
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
