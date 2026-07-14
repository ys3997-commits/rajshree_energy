"use server";

import { OrderStatus, OrderType, type Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  computeOrderStatus,
  toDecimal,
  withPurchaseOrderComputed,
  type DecimalLike,
} from "@/lib/domain/computations";

export type PurchaseOrderFilters = {
  status?: OrderStatus | "";
  importerId?: string;
  vesselId?: string;
  orderById?: string;
};

export async function listPurchaseOrders(filters: PurchaseOrderFilters = {}) {
  const where: Prisma.PurchaseOrderWhereInput = {};
  if (filters.status) where.orderStatus = filters.status;
  if (filters.importerId) where.importerId = filters.importerId;
  if (filters.vesselId) where.vesselId = filters.vesselId;
  if (filters.orderById) where.orderById = filters.orderById;

  const rows = await prisma.purchaseOrder.findMany({
    where,
    include: {
      importer: { select: { id: true, name: true } },
      vessel: { select: { id: true, vesselName: true } },
      orderBy: { select: { id: true, name: true } },
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
      orderBy: true,
      dispatches: {
        include: {
          order: { select: { id: true, poNumber: true, rate: true } },
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
    },
    orderBy: { poNumber: "asc" },
  });
  return rows
    .map(withPurchaseOrderComputed)
    .filter((o) => o.balanceOrder == null || o.balanceOrder.gt(0));
}

/** Suggest next sequential purchase PO like PU-1, PU-2, … */
export async function suggestNextPurchasePoNumber(): Promise<string> {
  const rows = await prisma.purchaseOrder.findMany({
    select: { poNumber: true },
  });

  let max = 0;
  for (const row of rows) {
    const m = /^PU-(\d+)$/i.exec(row.poNumber);
    if (m) max = Math.max(max, Number(m[1]));
  }

  return `PU-${max + 1}`;
}

export type CreateRegularPurchaseOrderInput = {
  poNumber: string;
  importerId: string;
  vesselId: string;
  orderDate?: string | null;
  quality?: string | null;
  rate?: DecimalLike | null;
  quantity: DecimalLike;
  orderById?: string | null;
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

  const orderStatus = computeOrderStatus({
    orderType: OrderType.REGULAR,
    quantity,
    dispatchedOrder: toDecimal(0),
  });

  const order = await prisma.purchaseOrder.create({
    data: {
      poNumber: input.poNumber.trim(),
      orderType: OrderType.REGULAR,
      importerId: input.importerId,
      vesselId: input.vesselId,
      orderDate: input.orderDate ? new Date(input.orderDate) : null,
      quality: input.quality || null,
      rate,
      quantity,
      orderById: input.orderById || null,
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
  quality?: string | null;
  rate?: DecimalLike | null;
  orderById?: string | null;
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

  const order = await prisma.purchaseOrder.create({
    data: {
      poNumber: input.poNumber.trim(),
      orderType: OrderType.OPEN,
      importerId: input.importerId,
      vesselId: input.vesselId,
      orderDate: input.orderDate ? new Date(input.orderDate) : null,
      quality: input.quality || null,
      rate,
      quantity: null,
      orderById: input.orderById || null,
      orderStatus: OrderStatus.OPEN,
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
    quantity?: DecimalLike;
    rate?: DecimalLike | null;
    quality?: string | null;
  },
) {
  const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!existing) throw new Error("Purchase order not found");

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

  const orderStatus = computeOrderStatus({
    orderType: existing.orderType,
    quantity,
    dispatchedOrder: existing.dispatchedOrder,
  });

  const order = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      quantity,
      rate,
      quality: data.quality === undefined ? undefined : data.quality,
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
  quality?: string | null;
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

    const nextStatus = computeOrderStatus({
      orderType: order.orderType,
      quantity,
      dispatchedOrder: order.dispatchedOrder,
    });

    await tx.purchaseOrder.update({
      where: { id: orderId },
      data: {
        quantity,
        rate,
        quality: details.quality === undefined ? undefined : details.quality,
        orderStatus: nextStatus,
      },
    });
  });

  revalidatePath("/purchase-orders");
  revalidatePath(`/purchase-orders/${orderId}`);
}
