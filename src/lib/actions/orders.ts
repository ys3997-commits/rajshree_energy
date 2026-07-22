"use server";

import { OrderStatus, OrderType, type Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  computeOrderStatus,
  computeSaleFinalRate,
  toDecimal,
  withOrderComputed,
  type DecimalLike,
} from "@/lib/domain/computations";
import { normalizeSaleOrderNumber } from "@/lib/domain/orderNumbers";

export type OrderFilters = {
  status?: OrderStatus | "";
  customerId?: string;
  portId?: string;
  orderById?: string;
};

export async function listOrders(filters: OrderFilters = {}) {
  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.orderStatus = filters.status;
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.portId) where.portId = filters.portId;
  if (filters.orderById) where.orderById = filters.orderById;

  const rows = await prisma.order.findMany({
    where,
    include: {
      customer: {
        select: { id: true, name: true, city: true, state: true, category: true },
      },
      orderBy: { select: { id: true, name: true } },
      port: { select: { id: true, name: true } },
      qualityClass: {
        include: {
          origin: { select: { id: true, name: true } },
          qualityOption: { select: { id: true, name: true } },
        },
      },
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
      port: { select: { id: true, name: true } },
      qualityClass: {
        include: {
          origin: { select: { id: true, name: true } },
          qualityOption: { select: { id: true, name: true } },
        },
      },
      dispatches: {
        include: {
          vessel: { select: { vesselName: true } },
          transporter: { select: { name: true } },
          purchaseOrder: {
            select: {
              poNumber: true,
              rate: true,
              finalRate: true,
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
  portId?: string | null;
  creditDays?: number | null;
  qualityClassId?: string | null;
  rate?: DecimalLike | null;
  quantity: DecimalLike;
  orderById?: string | null;
};

async function resolveCustomerCategory(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { category: true },
  });
  if (!customer) throw new Error("Customer not found");
  return customer.category;
}

export async function createRegularOrder(input: CreateRegularOrderInput) {
  const quantity = toDecimal(input.quantity);
  const rate =
    input.rate === undefined || input.rate === null
      ? null
      : toDecimal(input.rate);
  const category = await resolveCustomerCategory(input.customerId);
  const finalRate = computeSaleFinalRate(rate, category);

  const orderStatus = computeOrderStatus({
    orderType: OrderType.REGULAR,
    quantity,
    dispatchedOrder: toDecimal(0),
  });

  const order = await prisma.order.create({
    data: {
      poNumber: normalizeSaleOrderNumber(input.poNumber),
      orderType: OrderType.REGULAR,
      customerId: input.customerId,
      orderDate: input.orderDate ? new Date(input.orderDate) : null,
      portId: input.portId || null,
      creditDays: input.creditDays ?? null,
      qualityClassId: input.qualityClassId || null,
      rate,
      finalRate,
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
    poNumber?: string;
    quantity?: DecimalLike;
    rate?: DecimalLike | null;
    creditDays?: number | null;
    qualityClassId?: string | null;
    portId?: string | null;
  },
) {
  const existing = await prisma.order.findUnique({
    where: { id },
    include: { customer: { select: { category: true } } },
  });
  if (!existing) throw new Error("Order not found");

  let poNumber = existing.poNumber;
  if (data.poNumber !== undefined) {
    poNumber = normalizeSaleOrderNumber(data.poNumber);
    if (poNumber !== existing.poNumber) {
      const taken = await prisma.order.findUnique({ where: { poNumber } });
      if (taken) {
        throw new Error(`Sale order number ${poNumber} is already taken`);
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
    data.rate !== undefined
      ? computeSaleFinalRate(rate, existing.customer.category)
      : undefined;

  const orderStatus = computeOrderStatus({
    orderType: existing.orderType,
    quantity,
    dispatchedOrder: existing.dispatchedOrder,
  });

  const order = await prisma.order.update({
    where: { id },
    data: {
      poNumber,
      quantity,
      rate,
      ...(finalRate !== undefined ? { finalRate } : {}),
      creditDays: data.creditDays === undefined ? undefined : data.creditDays,
      qualityClassId:
        data.qualityClassId === undefined ? undefined : data.qualityClassId,
      portId: data.portId === undefined ? undefined : data.portId || null,
      orderStatus,
    },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return { id: order.id };
}
