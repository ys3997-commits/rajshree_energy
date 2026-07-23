"use server";

import type { Prisma } from "@/generated/prisma";
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

export type MasterDispatchReportFilters = {
  customerId?: string;
  transporterId?: string;
  vesselId?: string;
  vendorId?: string;
  qualityClassId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function listMasterDispatchReport(
  filters: MasterDispatchReportFilters = {},
) {
  const where: Prisma.DispatchWhereInput = {};

  if (filters.customerId) {
    where.order = { customerId: filters.customerId };
  }
  if (filters.transporterId) {
    where.transporterId = filters.transporterId;
  }
  if (filters.vesselId) {
    where.vesselId = filters.vesselId;
  }
  if (filters.vendorId) {
    where.purchaseOrder = { importerId: filters.vendorId };
  }
  if (filters.qualityClassId) {
    where.OR = [
      { purchaseOrder: { qualityClassId: filters.qualityClassId } },
      { vessel: { qualityClassId: filters.qualityClassId } },
      { order: { qualityClassId: filters.qualityClassId } },
    ];
  }
  if (filters.dateFrom || filters.dateTo) {
    where.dispatchDate = {};
    if (filters.dateFrom) {
      where.dispatchDate.gte = new Date(`${filters.dateFrom}T00:00:00.000Z`);
    }
    if (filters.dateTo) {
      where.dispatchDate.lte = new Date(`${filters.dateTo}T23:59:59.999Z`);
    }
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
      transporterName: row.transporter?.name ?? null,
      freight: row.freight,
      freightAmount,
      dispatchTerms: row.dispatchTerms,
      // Profit uses basic rates only (not final/all-in rates).
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
