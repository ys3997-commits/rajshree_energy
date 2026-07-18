"use server";

import { ReceiptStatus, type Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  diffInQuantity,
  lineProfit,
  purchaseCostRate,
  saleRevenueRate,
} from "@/lib/domain/computations";

export type DispatchFilters = {
  receiptStatus?: ReceiptStatus | "";
  poNumber?: string;
  purchasePoNumber?: string;
  vesselId?: string;
  importerId?: string;
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
  if (filters.importerId) where.importerId = filters.importerId;
  if (filters.dispatchDate) {
    where.dispatchDate = {
      gte: new Date(`${filters.dispatchDate}T00:00:00.000Z`),
      lte: new Date(`${filters.dispatchDate}T23:59:59.999Z`),
    };
  }

  const rows = await prisma.dispatch.findMany({
    where,
    include: {
      vessel: { select: { id: true, vesselName: true } },
      importer: { select: { id: true, name: true } },
      transporter: { select: { id: true, name: true } },
      order: {
        select: {
          id: true,
          poNumber: true,
          orderType: true,
          rate: true,
          finalRate: true,
        },
      },
      purchaseOrder: {
        select: {
          id: true,
          poNumber: true,
          rate: true,
          finalRate: true,
          importer: { select: { name: true } },
          vessel: { select: { vesselName: true } },
        },
      },
    },
    orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
  });

  return rows.map((row) => ({
    ...row,
    diffInQuantity: diffInQuantity(row),
    lineProfit: lineProfit({
      saleRate: row.order ? saleRevenueRate(row.order) : null,
      costRate: row.purchaseOrder
        ? purchaseCostRate(row.purchaseOrder)
        : null,
      quantity: row.dispatchedQuantity,
      dispatchTerms: row.dispatchTerms,
      freight: row.freight,
    }),
  }));
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
