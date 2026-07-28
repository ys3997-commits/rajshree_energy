"use server";

import { OrderStatus, OrderType, type Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  balanceOrder,
  computeOrderStatus,
  computeSaleFinalRate,
  toDecimal,
  withOrderComputed,
  type DecimalLike,
} from "@/lib/domain/computations";
import {
  adjustCustomerDue,
  billedAmount,
} from "@/lib/domain/customerDue";
import { normalizeSaleOrderNumber } from "@/lib/domain/orderNumbers";

export type OrderFilters = {
  status?: string;
  customerId?: string;
  portId?: string;
  orderById?: string;
};

/** Accept only current enum values; map legacy sale statuses to Running. */
function normalizeOrderStatusFilter(
  status: string | null | undefined,
): OrderStatus | undefined {
  if (!status) return undefined;
  if (status === OrderStatus.RUNNING || status === OrderStatus.COMPLETED) {
    return status;
  }
  if (
    status === "PENDING" ||
    status === "OPEN" ||
    status === "PARTIALLY_DISPATCHED"
  ) {
    return OrderStatus.RUNNING;
  }
  return undefined;
}

export async function listOrders(filters: OrderFilters = {}) {
  const where: Prisma.OrderWhereInput = {};
  const status = normalizeOrderStatusFilter(filters.status);
  if (status) where.orderStatus = status;
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
      _count: { select: { dispatches: true } },
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
    where: { orderType: OrderType.REGULAR },
    include: { customer: { select: { name: true, category: true } } },
    orderBy: { poNumber: "asc" },
  });
  return rows
    .map(withOrderComputed)
    .filter((o) => o.balanceOrder != null && o.balanceOrder.gt(0));
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
  numberOfLorries?: number | null;
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
  const numberOfLorries =
    input.numberOfLorries === undefined || input.numberOfLorries === null
      ? null
      : Number(input.numberOfLorries);
  if (
    numberOfLorries != null &&
    (!Number.isInteger(numberOfLorries) || numberOfLorries < 0)
  ) {
    throw new Error("Number of lorries must be a whole number ≥ 0");
  }
  const category = await resolveCustomerCategory(input.customerId);
  const finalRate = computeSaleFinalRate(rate, category);

  const orderStatus = computeOrderStatus({
    orderType: OrderType.REGULAR,
    quantity,
    dispatchedOrder: toDecimal(0),
  });

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
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
        numberOfLorries,
        orderById: input.orderById || null,
        orderStatus,
      },
    });

    await adjustCustomerDue(
      tx,
      input.customerId,
      billedAmount(finalRate, quantity),
    );

    return created;
  });

  revalidatePath("/orders");
  revalidatePath("/customers");
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
      : existing.finalRate;

  const orderStatus = computeOrderStatus({
    orderType: existing.orderType,
    quantity,
    dispatchedOrder: existing.dispatchedOrder,
    closingQuantity: existing.closingQuantity,
  });

  const oldAmount = billedAmount(
    existing.finalRate,
    existing.quantity,
    existing.dispatchedOrder,
    existing.closingQuantity,
  );
  const newAmount = billedAmount(
    finalRate,
    quantity,
    existing.dispatchedOrder,
    existing.closingQuantity,
  );
  const dueDelta = newAmount.minus(oldAmount);

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: {
        poNumber,
        quantity,
        rate,
        ...(data.rate !== undefined ? { finalRate } : {}),
        creditDays: data.creditDays === undefined ? undefined : data.creditDays,
        qualityClassId:
          data.qualityClassId === undefined ? undefined : data.qualityClassId,
        portId: data.portId === undefined ? undefined : data.portId || null,
        orderStatus,
      },
    });

    await adjustCustomerDue(tx, existing.customerId, dueDelta);
    return updated;
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  revalidatePath("/customers");
  return { id: order.id };
}

/**
 * Write off the remaining balance as closingQuantity and mark the order completed.
 * Balance becomes 0; further dispatches are blocked by the zero balance check.
 */
export async function closeOrderQuantity(id: string) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) throw new Error("Order not found");
  if (existing.quantity == null) {
    throw new Error("Set order quantity before closing");
  }
  if (existing.closingQuantity != null) {
    throw new Error("Quantity already closed for this order");
  }

  const bal = balanceOrder(existing);
  if (bal == null || !bal.gt(0)) {
    throw new Error("No remaining balance to close");
  }

  const oldAmount = billedAmount(
    existing.finalRate,
    existing.quantity,
    existing.dispatchedOrder,
    existing.closingQuantity,
  );
  const newAmount = billedAmount(
    existing.finalRate,
    existing.quantity,
    existing.dispatchedOrder,
    bal,
  );

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: {
        closingQuantity: bal,
        orderStatus: OrderStatus.COMPLETED,
      },
    });
    await adjustCustomerDue(tx, existing.customerId, newAmount.minus(oldAmount));
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  revalidatePath("/customers");
  revalidatePath("/");
  return { id, closingQuantity: bal.toString() };
}
