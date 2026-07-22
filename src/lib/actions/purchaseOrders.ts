"use server";

import {
  OrderType,
  PurchaseOrderStatus,
  type Prisma,
} from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  computePurchaseFinalRate,
  computePurchaseOrderStatus,
  toDecimal,
  withPurchaseOrderComputed,
  type DecimalLike,
} from "@/lib/domain/computations";
import {
  nextPurchaseOrderNumber,
  normalizePurchaseOrderNumber,
} from "@/lib/domain/orderNumbers";

export type PurchaseOrderFilters = {
  status?: PurchaseOrderStatus | "";
  importerId?: string;
  vesselId?: string;
};

export async function listPurchaseOrders(filters: PurchaseOrderFilters = {}) {
  const where: Prisma.PurchaseOrderWhereInput = {};
  if (filters.status) where.orderStatus = filters.status;
  if (filters.importerId) where.importerId = filters.importerId;
  if (filters.vesselId) where.vesselId = filters.vesselId;

  const rows = await prisma.purchaseOrder.findMany({
    where,
    include: {
      importer: { select: { id: true, name: true } },
      vessel: { select: { id: true, vesselName: true } },
      qualityClass: {
        include: {
          origin: { select: { id: true, name: true } },
          qualityOption: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(withPurchaseOrderComputed);
}

export async function getPurchaseOrder(id: string) {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      importer: true,
      vessel: true,
      qualityClass: {
        include: {
          origin: { select: { id: true, name: true } },
          qualityOption: { select: { id: true, name: true } },
        },
      },
      dispatches: {
        include: {
          order: {
            select: { id: true, poNumber: true, rate: true, finalRate: true },
          },
          transporter: { select: { name: true } },
        },
        orderBy: { dispatchDate: "desc" },
      },
    },
  });
  if (!order) return null;
  return withPurchaseOrderComputed(order);
}

export async function listPurchaseOrdersWithBalance() {
  const rows = await prisma.purchaseOrder.findMany({
    include: {
      importer: { select: { name: true } },
      vessel: { select: { vesselName: true } },
      qualityClass: {
        include: {
          origin: { select: { name: true } },
          qualityOption: { select: { name: true } },
        },
      },
    },
    orderBy: { poNumber: "asc" },
  });
  return rows
    .map(withPurchaseOrderComputed)
    .filter((o) => o.balanceOrder == null || o.balanceOrder.gt(0));
}

/** Suggest next sequential purchase order number (PO 0001, PO 0002, …). */
export async function suggestNextPurchasePoNumber(): Promise<string> {
  const rows = await prisma.purchaseOrder.findMany({
    select: { poNumber: true },
  });

  return nextPurchaseOrderNumber(rows.map((row) => row.poNumber));
}

export type CreateRegularPurchaseOrderInput = {
  poNumber: string;
  importerId: string;
  vesselId: string;
  orderDate?: string | null;
  qualityClassId?: string | null;
  rate?: DecimalLike | null;
  quantity: DecimalLike;
};

export async function createRegularPurchaseOrder(
  input: CreateRegularPurchaseOrderInput,
) {
  const quantity = toDecimal(input.quantity);
  if (quantity.lt(0)) throw new Error("Quantity must be non-negative");

  const vessel = await prisma.vessel.findUnique({
    where: { id: input.vesselId },
  });
  if (!vessel) throw new Error("Vessel not found");

  const rate =
    input.rate === undefined || input.rate === null
      ? null
      : toDecimal(input.rate);
  const finalRate = computePurchaseFinalRate(rate);

  const orderStatus = computePurchaseOrderStatus({
    quantity,
    dispatchedOrder: toDecimal(0),
  });

  // Prefer vessel quality when not explicitly provided.
  const qualityClassId =
    input.qualityClassId || vessel.qualityClassId || null;

  const order = await prisma.purchaseOrder.create({
    data: {
      poNumber: normalizePurchaseOrderNumber(input.poNumber),
      orderType: OrderType.REGULAR,
      importerId: input.importerId,
      vesselId: input.vesselId,
      orderDate: input.orderDate ? new Date(input.orderDate) : null,
      qualityClassId,
      rate,
      finalRate,
      quantity,
      orderStatus,
    },
  });

  revalidatePath("/purchase-orders");
  revalidatePath("/dispatches");
  return { id: order.id };
}

export type CreateOpenPurchaseOrderInput = {
  poNumber: string;
  importerId: string;
  vesselId: string;
  orderDate?: string | null;
  qualityClassId?: string | null;
  rate?: DecimalLike | null;
};

export async function createOpenPurchaseOrder(
  input: CreateOpenPurchaseOrderInput,
) {
  const vessel = await prisma.vessel.findUnique({
    where: { id: input.vesselId },
  });
  if (!vessel) throw new Error("Vessel not found");

  const rate =
    input.rate === undefined || input.rate === null
      ? null
      : toDecimal(input.rate);
  const finalRate = computePurchaseFinalRate(rate);

  const qualityClassId =
    input.qualityClassId || vessel.qualityClassId || null;

  const order = await prisma.purchaseOrder.create({
    data: {
      poNumber: normalizePurchaseOrderNumber(input.poNumber),
      orderType: OrderType.OPEN,
      importerId: input.importerId,
      vesselId: input.vesselId,
      orderDate: input.orderDate ? new Date(input.orderDate) : null,
      qualityClassId,
      rate,
      finalRate,
      quantity: null,
      orderStatus: PurchaseOrderStatus.RUNNING,
      dispatchedOrder: toDecimal(0),
    },
  });

  revalidatePath("/purchase-orders");
  revalidatePath("/dispatches");
  return { id: order.id };
}

export async function updatePurchaseOrderFields(
  id: string,
  data: {
    poNumber?: string;
    quantity?: DecimalLike;
    rate?: DecimalLike | null;
    qualityClassId?: string | null;
  },
) {
  const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!existing) throw new Error("Purchase order not found");

  let poNumber = existing.poNumber;
  if (data.poNumber !== undefined) {
    poNumber = normalizePurchaseOrderNumber(data.poNumber);
    if (poNumber !== existing.poNumber) {
      const taken = await prisma.purchaseOrder.findUnique({ where: { poNumber } });
      if (taken) {
        throw new Error(`Purchase order number ${poNumber} is already taken`);
      }
    }
  }

  const quantity =
    data.quantity !== undefined ? toDecimal(data.quantity) : existing.quantity;

  if (quantity != null && quantity.lt(existing.dispatchedOrder)) {
    throw new Error(
      `Cannot set quantity (${quantity}) below dispatchedOrder (${existing.dispatchedOrder})`,
    );
  }

  let rate = existing.rate;
  if (data.rate !== undefined) {
    rate = data.rate === null ? null : toDecimal(data.rate);
  }
  const finalRate =
    data.rate !== undefined ? computePurchaseFinalRate(rate) : undefined;

  const orderStatus = computePurchaseOrderStatus({
    quantity,
    dispatchedOrder: existing.dispatchedOrder,
  });

  const order = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      poNumber,
      quantity,
      rate,
      ...(finalRate !== undefined ? { finalRate } : {}),
      qualityClassId:
        data.qualityClassId === undefined ? undefined : data.qualityClassId,
      orderStatus,
    },
  });

  revalidatePath("/purchase-orders");
  revalidatePath(`/purchase-orders/${id}`);
  return { id: order.id };
}

export type CompleteOpenPurchaseOrderInput = {
  quantity: DecimalLike;
  rate?: DecimalLike | null;
  qualityClassId?: string | null;
};

export async function completeOpenPurchaseOrder(
  orderId: string,
  details: CompleteOpenPurchaseOrderInput,
): Promise<void> {
  const quantity = toDecimal(details.quantity);
  if (quantity.lt(0)) {
    throw new Error("Quantity must be non-negative");
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Purchase order not found");
    if (order.orderType !== OrderType.OPEN) {
      throw new Error("Only OPEN purchase orders can be completed this way");
    }
    if (quantity.lt(order.dispatchedOrder)) {
      throw new Error(
        `Cannot set quantity (${quantity}) below dispatchedOrder (${order.dispatchedOrder})`,
      );
    }

    const rate =
      details.rate === undefined || details.rate === null
        ? null
        : toDecimal(details.rate);
    const finalRate =
      details.rate === undefined ? undefined : computePurchaseFinalRate(rate);

    const nextStatus = computePurchaseOrderStatus({
      quantity,
      dispatchedOrder: order.dispatchedOrder,
    });

    await tx.purchaseOrder.update({
      where: { id: orderId },
      data: {
        quantity,
        rate,
        ...(finalRate !== undefined ? { finalRate } : {}),
        qualityClassId:
          details.qualityClassId === undefined
            ? undefined
            : details.qualityClassId,
        orderStatus: nextStatus,
      },
    });
  });

  revalidatePath("/purchase-orders");
  revalidatePath(`/purchase-orders/${orderId}`);
}
