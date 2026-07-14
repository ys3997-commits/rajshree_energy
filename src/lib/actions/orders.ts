"use server";

import { OrderStatus, OrderType, type Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  computeOrderStatus,
  toDecimal,
  withOrderComputed,
  type DecimalLike,
} from "@/lib/domain/computations";

export type OrderFilters = {
  status?: OrderStatus | "";
  customerId?: string;
  area?: string;
  orderById?: string;
};

export async function listOrders(filters: OrderFilters = {}) {
  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.orderStatus = filters.status;
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.area) where.area = { contains: filters.area, mode: "insensitive" };
  if (filters.orderById) where.orderById = filters.orderById;

  const rows = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, area: true } },
      orderBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(withOrderComputed);
}

export async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      orderBy: true,
      dispatches: {
        include: {
          vessel: { select: { vesselName: true } },
          transporter: { select: { name: true } },
          purchaseOrder: {
            select: {
              poNumber: true,
              rate: true,
              importer: { select: { name: true } },
              vessel: { select: { vesselName: true } },
            },
          },
        },
        orderBy: { dispatchDate: "desc" },
      },
    },
  });
  if (!order) return null;
  return withOrderComputed(order);
}

export async function listOrdersWithBalance() {
  const rows = await prisma.order.findMany({
    include: { customer: { select: { name: true } } },
    orderBy: { poNumber: "asc" },
  });
  return rows
    .map(withOrderComputed)
    .filter((o) => o.balanceOrder == null || o.balanceOrder.gt(0));
}

export type CreateRegularOrderInput = {
  poNumber: string;
  customerId: string;
  orderDate?: string | null;
  area?: string | null;
  creditDays?: number | null;
  quality?: string | null;
  rate?: DecimalLike | null;
  quantity: DecimalLike;
  orderById?: string | null;
};

export async function createRegularOrder(input: CreateRegularOrderInput) {
  const quantity = toDecimal(input.quantity);
  const rate =
    input.rate === undefined || input.rate === null
      ? null
      : toDecimal(input.rate);

  const orderStatus = computeOrderStatus({
    orderType: OrderType.REGULAR,
    quantity,
    dispatchedOrder: toDecimal(0),
  });

  const order = await prisma.order.create({
    data: {
      poNumber: input.poNumber.trim(),
      orderType: OrderType.REGULAR,
      customerId: input.customerId,
      orderDate: input.orderDate ? new Date(input.orderDate) : null,
      area: input.area || null,
      creditDays: input.creditDays ?? null,
      quality: input.quality || null,
      rate,
      quantity,
      orderById: input.orderById || null,
      orderStatus,
    },
  });

  revalidatePath("/orders");
  return { id: order.id };
}

export async function updateOrderFields(
  id: string,
  data: {
    quantity?: DecimalLike;
    rate?: DecimalLike | null;
    creditDays?: number | null;
    quality?: string | null;
    area?: string | null;
  },
) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) throw new Error("Order not found");

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

  const order = await prisma.order.update({
    where: { id },
    data: {
      quantity,
      rate,
      creditDays: data.creditDays === undefined ? undefined : data.creditDays,
      quality: data.quality === undefined ? undefined : data.quality,
      area: data.area === undefined ? undefined : data.area,
      orderStatus,
    },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return { id: order.id };
}
