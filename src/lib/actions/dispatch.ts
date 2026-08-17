"use server";

import {
  DispatchTerms,
  OrderStatus,
  OrderType,
  PurchaseOrderStatus,
  ReceiptStatus,
  type Prisma,
} from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { prisma, type PrismaTx } from "@/lib/prisma";
import {
  computeOrderStatus,
  computePurchaseFinalRate,
  computePurchaseOrderStatus,
  computeSaleFinalRate,
  toDecimal,
  type DecimalLike,
} from "@/lib/domain/computations";
import {
  adjustCustomerDue,
  dispatchedAmount,
  purchaseDispatchDueDelta,
  saleDispatchDueDelta,
} from "@/lib/domain/customerDue";
import { normalizeLorryNumber } from "@/lib/domain/format";
import {
  nextDispatchNumber,
  normalizeDispatchNumber,
} from "@/lib/domain/dispatchNumbers";
import {
  nextSaleOrderNumber,
  normalizePurchaseOrderNumber,
  normalizeSaleOrderNumber,
} from "@/lib/domain/orderNumbers";

/** Create an OPEN purchase order as part of a dispatch (quantity null). */
export type OpenPurchaseForDispatch = {
  poNumber: string;
  importerId: string;
  vesselId: string;
  rate?: DecimalLike | null;
  qualityClassId?: string | null;
};

export type CreateDispatchInput = {
  poNumber: string;
  /** Sequential serial (DN 0001). Allocated if omitted. */
  dispatchNumber?: string;
  /** Existing purchase PO — required unless openPurchase is set. */
  purchasePoNumber?: string;
  /** When set, creates an OPEN purchase order then dispatches against it. */
  openPurchase?: OpenPurchaseForDispatch;
  dispatchDate: Date | string;
  dispatchedQuantity: DecimalLike;
  dispatchTerms: DispatchTerms;
  lorryNumber?: string | null;
  transporterId?: string | null;
  freight?: DecimalLike | null;
  softCopyStatus?: boolean;
  entryInTally?: boolean;
  saleInvoiceNumber?: string | null;
  purchaseInvoiceNumber?: string | null;
};

/** Create an OPEN sale order as part of a dispatch (quantity null). */
export type OpenSaleForDispatch = {
  poNumber: string;
  customerId: string;
  rate?: DecimalLike | null;
  orderById?: string | null;
};

export type UpdateDispatchInput = {
  dispatchedQuantity?: DecimalLike;
  /** Existing purchase PO — ignored when openPurchase is set. */
  purchasePoNumber?: string;
  /** When set, creates an OPEN purchase order and switches the dispatch to it. */
  openPurchase?: OpenPurchaseForDispatch;
  /** Existing sale PO — ignored when openSale is set. */
  poNumber?: string;
  /** When set, creates an OPEN sale order and switches the dispatch to it. */
  openSale?: OpenSaleForDispatch;
  dispatchDate?: Date | string;
  dispatchTerms?: DispatchTerms;
  lorryNumber?: string | null;
  transporterId?: string | null;
  freight?: DecimalLike | null;
  softCopyStatus?: boolean;
  entryInTally?: boolean;
  saleInvoiceNumber?: string | null;
  purchaseInvoiceNumber?: string | null;
  /** When set, updates received qty and marks receipt RECEIVED. Null clears receipt. */
  receivingQuantity?: DecimalLike | null;
};

export type CreateOpenOrderDispatchInput = {
  poNumber: string;
  /** Sequential serial (DN 0001). Allocated if omitted. */
  dispatchNumber?: string;
  /** Optional — open sale orders no longer require a deal-by staff. */
  orderById?: string | null;
  customerId: string;
  rate?: DecimalLike | null;
  /** Existing purchase PO — required unless openPurchase is set. */
  purchasePoNumber?: string;
  /** When set, creates an OPEN purchase order then dispatches against it. */
  openPurchase?: OpenPurchaseForDispatch;
  dispatchDate: Date | string;
  dispatchedQuantity: DecimalLike;
  dispatchTerms: DispatchTerms;
  lorryNumber?: string | null;
  transporterId?: string | null;
  freight?: DecimalLike | null;
  softCopyStatus?: boolean;
  entryInTally?: boolean;
  saleInvoiceNumber?: string | null;
  purchaseInvoiceNumber?: string | null;
};

export type CompleteOpenOrderInput = {
  quantity: DecimalLike;
  rate?: DecimalLike | null;
  creditDays?: number | null;
  qualityClassId?: string | null;
  portId?: string | null;
};

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function normalizeInvoiceNumber(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveDispatchTermsFields(input: {
  dispatchTerms: DispatchTerms;
  transporterId?: string | null;
  freight?: DecimalLike | null;
}): { transporterId: string | null; freight: Decimal | null } {
  if (input.dispatchTerms === DispatchTerms.FOR) {
    if (!input.transporterId) {
      throw new Error("Transporter is required for FOR dispatches");
    }
    if (
      input.freight === undefined ||
      input.freight === null ||
      input.freight === ""
    ) {
      throw new Error("Freight (Rs/MT) is required for FOR dispatches");
    }
    const freight = toDecimal(input.freight);
    if (freight.lt(0)) {
      throw new Error("Freight cannot be negative");
    }
    return { transporterId: input.transporterId, freight };
  }

  return { transporterId: null, freight: null };
}

async function resolvePurchaseForDispatch(
  tx: PrismaTx,
  input: {
    purchasePoNumber?: string;
    openPurchase?: OpenPurchaseForDispatch;
    dispatchDate: Date | string;
  },
): Promise<{
  purchasePoNumber: string;
  vesselId: string;
  importerId: string;
  qualityClassId: string | null;
}> {
  if (input.openPurchase) {
    const poNumber = normalizePurchaseOrderNumber(input.openPurchase.poNumber);
    if (!input.openPurchase.importerId) {
      throw new Error("Vendor is required");
    }
    if (!input.openPurchase.vesselId) {
      throw new Error("Vessel is required");
    }

    const existing = await tx.purchaseOrder.findUnique({ where: { poNumber } });
    if (existing) {
      throw new Error(`Purchase PO number ${poNumber} is already taken`);
    }

    const vessel = await tx.vessel.findUnique({
      where: { id: input.openPurchase.vesselId },
    });
    if (!vessel) throw new Error("Vessel not found");

    const rate =
      input.openPurchase.rate === undefined || input.openPurchase.rate === null
        ? null
        : toDecimal(input.openPurchase.rate);
    const finalRate = computePurchaseFinalRate(rate);
    const qualityClassId =
      input.openPurchase.qualityClassId || vessel.qualityClassId || null;

    const purchase = await tx.purchaseOrder.create({
      data: {
        poNumber,
        orderType: OrderType.OPEN,
        importerId: input.openPurchase.importerId,
        vesselId: input.openPurchase.vesselId,
        orderDate: asDate(input.dispatchDate),
        qualityClassId,
        rate,
        finalRate,
        quantity: null,
        orderStatus: PurchaseOrderStatus.RUNNING,
        dispatchedOrder: new Decimal(0),
      },
    });

    return {
      purchasePoNumber: purchase.poNumber,
      vesselId: purchase.vesselId,
      importerId: purchase.importerId,
      qualityClassId,
    };
  }

  const purchasePoNumber = input.purchasePoNumber?.trim();
  if (!purchasePoNumber) {
    throw new Error("Select a purchase order");
  }

  const purchase = await tx.purchaseOrder.findUnique({
    where: { poNumber: purchasePoNumber },
    include: { vessel: { select: { qualityClassId: true } } },
  });
  if (!purchase) {
    throw new Error(`Purchase order ${purchasePoNumber} not found`);
  }

  return {
    purchasePoNumber: purchase.poNumber,
    vesselId: purchase.vesselId,
    importerId: purchase.importerId,
    qualityClassId:
      purchase.qualityClassId || purchase.vessel.qualityClassId || null,
  };
}

function revalidateDispatchPaths() {
  revalidatePath("/orders");
  revalidatePath("/purchase-orders");
  revalidatePath("/dispatches");
  revalidatePath("/vessels");
  revalidatePath("/receipts/pending");
  revalidatePath("/reconciliation");
  revalidatePath("/customers");
  revalidatePath("/payments");
  revalidatePath("/reports/transport/due");
}

/**
 * Number existing rows from the earliest dispatch (date, then created).
 * New dispatches continue from the highest serial.
 */
export async function ensureDispatchNumbers(): Promise<void> {
  const missing = await prisma.dispatch.count({
    where: { dispatchNumber: null },
  });
  if (missing === 0) return;

  await prisma.$executeRaw`
    WITH numbered AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          ORDER BY "dispatchDate" ASC, "createdAt" ASC, id ASC
        ) AS seq
      FROM "Dispatch"
      WHERE "dispatchNumber" IS NULL
    ),
    max_existing AS (
      SELECT COALESCE(
        MAX(
          CASE
            WHEN "dispatchNumber" ~* '^DN[[:space:]]*[0-9]+$'
              THEN CAST(regexp_replace("dispatchNumber", '[^0-9]', '', 'g') AS INTEGER)
            WHEN "dispatchNumber" ~ '^[0-9]+$'
              THEN CAST("dispatchNumber" AS INTEGER)
            ELSE NULL
          END
        ),
        0
      ) AS max_seq
      FROM "Dispatch"
      WHERE "dispatchNumber" IS NOT NULL
    )
    UPDATE "Dispatch" AS d
    SET "dispatchNumber" = 'DN ' || LPAD((n.seq + m.max_seq)::text, 4, '0')
    FROM numbered AS n, max_existing AS m
    WHERE d.id = n.id
  `;
}

async function allocateDispatchNumber(
  tx: PrismaTx,
  requested?: string,
): Promise<string> {
  const dispatchNumber = requested
    ? normalizeDispatchNumber(requested)
    : nextDispatchNumber(
        (
          await tx.dispatch.findMany({
            select: { dispatchNumber: true },
          })
        ).map((row) => row.dispatchNumber),
      );

  const existing = await tx.dispatch.findUnique({
    where: { dispatchNumber },
  });
  if (existing) {
    throw new Error(`Dispatch number ${dispatchNumber} is already taken`);
  }

  return dispatchNumber;
}

async function applyDispatchDelta(
  tx: PrismaTx,
  args: {
    poNumber: string;
    purchasePoNumber: string;
    qty: Decimal;
  },
) {
  const order = await tx.order.findUnique({ where: { poNumber: args.poNumber } });
  if (!order) {
    throw new Error(`Sale order with poNumber ${args.poNumber} not found`);
  }

  const purchase = await tx.purchaseOrder.findUnique({
    where: { poNumber: args.purchasePoNumber },
  });
  if (!purchase) {
    throw new Error(
      `Purchase order with poNumber ${args.purchasePoNumber} not found`,
    );
  }

  const vessel = await tx.vessel.findUnique({ where: { id: purchase.vesselId } });
  if (!vessel) {
    throw new Error(`Vessel ${purchase.vesselId} not found`);
  }

  // Dispatched qty may exceed purchase / sale order balances (over-dispatch allowed).
  if (args.qty.lt(0)) {
    if (order.dispatchedOrder.plus(args.qty).lt(0)) {
      throw new Error("Cannot reverse more than sale order.dispatchedOrder");
    }
    if (purchase.dispatchedOrder.plus(args.qty).lt(0)) {
      throw new Error(
        "Cannot reverse more than purchase order.dispatchedOrder",
      );
    }
  }

  const nextDispatchedOrder = order.dispatchedOrder.plus(args.qty);
  const nextSaleStatus = computeOrderStatus({
    orderType: order.orderType,
    quantity: order.quantity,
    dispatchedOrder: nextDispatchedOrder,
    closingQuantity: order.closingQuantity,
  });

  await tx.order.update({
    where: { id: order.id },
    data: {
      dispatchedOrder: nextDispatchedOrder,
      orderStatus: nextSaleStatus,
    },
  });

  if (order.finalRate != null && !args.qty.isZero()) {
    await adjustCustomerDue(
      tx,
      order.customerId,
      saleDispatchDueDelta(order.finalRate, args.qty),
    );
  }

  const nextPurchaseDispatched = purchase.dispatchedOrder.plus(args.qty);
  const nextPurchaseStatus = computePurchaseOrderStatus({
    quantity: purchase.quantity,
    dispatchedOrder: nextPurchaseDispatched,
    closingQuantity: purchase.closingQuantity,
  });

  await tx.purchaseOrder.update({
    where: { id: purchase.id },
    data: {
      dispatchedOrder: nextPurchaseDispatched,
      orderStatus: nextPurchaseStatus,
    },
  });

  if (purchase.finalRate != null && !args.qty.isZero()) {
    await adjustCustomerDue(
      tx,
      purchase.importerId,
      purchaseDispatchDueDelta(purchase.finalRate, args.qty),
    );
  }

  return { vesselId: purchase.vesselId, importerId: purchase.importerId };
}

/**
 * Suggest next sequential sale order number (SO 0001, SO 0002, …).
 * Considers current SO format and legacy numeric / PO-YYYY-#### values.
 */
export async function suggestNextPoNumber(): Promise<string> {
  const rows = await prisma.order.findMany({
    select: { poNumber: true },
  });

  return nextSaleOrderNumber(rows.map((row) => row.poNumber));
}

/** Suggest next sequential dispatch number (DN 0001, DN 0002, …). */
export async function suggestNextDispatchNumber(): Promise<string> {
  await ensureDispatchNumbers();
  const rows = await prisma.dispatch.findMany({
    select: { dispatchNumber: true },
  });
  return nextDispatchNumber(rows.map((row) => row.dispatchNumber));
}

export async function createDispatch(
  input: CreateDispatchInput,
): Promise<{ id: string }> {
  const qty = toDecimal(input.dispatchedQuantity);
  if (qty.lte(0)) {
    throw new Error("Dispatched quantity must be positive");
  }

  const termsFields = resolveDispatchTermsFields(input);
  await ensureDispatchNumbers();

  const dispatch = await prisma.$transaction(async (tx) => {
    const purchase = await resolvePurchaseForDispatch(tx, input);

    await applyDispatchDelta(tx, {
      poNumber: input.poNumber,
      purchasePoNumber: purchase.purchasePoNumber,
      qty,
    });

    const dispatchNumber = await allocateDispatchNumber(
      tx,
      input.dispatchNumber,
    );

    return tx.dispatch.create({
      data: {
        dispatchNumber,
        poNumber: input.poNumber,
        purchasePoNumber: purchase.purchasePoNumber,
        vesselId: purchase.vesselId,
        dispatchDate: asDate(input.dispatchDate),
        dispatchedQuantity: qty,
        dispatchTerms: input.dispatchTerms,
        lorryNumber: normalizeLorryNumber(input.lorryNumber) ?? null,
        transporterId: termsFields.transporterId,
        freight: termsFields.freight,
        importerId: purchase.importerId,
        softCopyStatus: input.softCopyStatus ?? false,
        entryInTally: input.entryInTally ?? false,
        saleInvoiceNumber: normalizeInvoiceNumber(input.saleInvoiceNumber) ?? null,
        purchaseInvoiceNumber:
          normalizeInvoiceNumber(input.purchaseInvoiceNumber) ?? null,
        ...(input.dispatchTerms === DispatchTerms.EX_PORT
          ? {
              receiptStatus: ReceiptStatus.RECEIVED,
              receivingQuantity: qty,
              receiptDate: new Date(),
            }
          : {
              receiptStatus: ReceiptStatus.PENDING,
              receivingQuantity: null,
              receiptDate: null,
            }),
      },
    });
  });

  revalidateDispatchPaths();
  return { id: dispatch.id };
}

export async function createOpenOrderDispatch(
  input: CreateOpenOrderDispatchInput,
): Promise<{ id: string }> {
  const poNumber = normalizeSaleOrderNumber(input.poNumber);
  if (!input.customerId) throw new Error("Customer is required");

  const existing = await prisma.order.findUnique({ where: { poNumber } });
  if (existing) {
    throw new Error(`PO number ${poNumber} is already taken`);
  }

  const qty = toDecimal(input.dispatchedQuantity);
  if (qty.lte(0)) {
    throw new Error("Dispatched quantity must be positive");
  }

  const termsFields = resolveDispatchTermsFields(input);
  await ensureDispatchNumbers();

  const dispatch = await prisma.$transaction(async (tx) => {
    const purchase = await resolvePurchaseForDispatch(tx, input);

    const customer = await tx.customer.findUnique({
      where: { id: input.customerId },
      select: { category: true },
    });
    if (!customer) throw new Error("Customer not found");

    const rate =
      input.rate === undefined || input.rate === null || input.rate === ""
        ? null
        : toDecimal(input.rate);
    const finalRate = computeSaleFinalRate(rate, customer.category);

    await tx.order.create({
      data: {
        poNumber,
        orderType: OrderType.OPEN,
        customerId: input.customerId,
        orderDate: asDate(input.dispatchDate),
        orderById: input.orderById || null,
        quantity: null,
        rate,
        finalRate,
        creditDays: null,
        portId: null,
        qualityClassId: purchase.qualityClassId,
        orderStatus: OrderStatus.RUNNING,
        dispatchedOrder: new Decimal(0),
      },
    });

    await applyDispatchDelta(tx, {
      poNumber,
      purchasePoNumber: purchase.purchasePoNumber,
      qty,
    });

    const dispatchNumber = await allocateDispatchNumber(
      tx,
      input.dispatchNumber,
    );

    return tx.dispatch.create({
      data: {
        dispatchNumber,
        poNumber,
        purchasePoNumber: purchase.purchasePoNumber,
        vesselId: purchase.vesselId,
        dispatchDate: asDate(input.dispatchDate),
        dispatchedQuantity: qty,
        dispatchTerms: input.dispatchTerms,
        lorryNumber: normalizeLorryNumber(input.lorryNumber) ?? null,
        transporterId: termsFields.transporterId,
        freight: termsFields.freight,
        importerId: purchase.importerId,
        softCopyStatus: input.softCopyStatus ?? false,
        entryInTally: input.entryInTally ?? false,
        saleInvoiceNumber: normalizeInvoiceNumber(input.saleInvoiceNumber) ?? null,
        purchaseInvoiceNumber:
          normalizeInvoiceNumber(input.purchaseInvoiceNumber) ?? null,
        ...(input.dispatchTerms === DispatchTerms.EX_PORT
          ? {
              receiptStatus: ReceiptStatus.RECEIVED,
              receivingQuantity: qty,
              receiptDate: new Date(),
            }
          : {
              receiptStatus: ReceiptStatus.PENDING,
              receivingQuantity: null,
              receiptDate: null,
            }),
      },
    });
  });

  revalidateDispatchPaths();
  return { id: dispatch.id };
}

export async function updateDispatch(
  id: string,
  changes: UpdateDispatchInput,
): Promise<{ id: string }> {
  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.dispatch.findUnique({ where: { id } });
    if (!existing) throw new Error("Dispatch not found");

    const nextQty =
      changes.dispatchedQuantity !== undefined
        ? toDecimal(changes.dispatchedQuantity)
        : existing.dispatchedQuantity;
    const nextTerms = changes.dispatchTerms ?? existing.dispatchTerms;
    const nextDispatchDate =
      changes.dispatchDate !== undefined
        ? changes.dispatchDate
        : existing.dispatchDate;

    let nextPurchasePo =
      changes.purchasePoNumber ?? existing.purchasePoNumber;
    let nextPo = changes.poNumber ?? existing.poNumber;

    if (changes.openPurchase) {
      const purchase = await resolvePurchaseForDispatch(tx, {
        openPurchase: changes.openPurchase,
        dispatchDate: nextDispatchDate,
      });
      nextPurchasePo = purchase.purchasePoNumber;
    }

    if (changes.openSale) {
      const poNumber = normalizeSaleOrderNumber(changes.openSale.poNumber);
      if (!changes.openSale.customerId) {
        throw new Error("Customer is required");
      }

      const existingSale = await tx.order.findUnique({ where: { poNumber } });
      if (existingSale) {
        throw new Error(`PO number ${poNumber} is already taken`);
      }

      const customer = await tx.customer.findUnique({
        where: { id: changes.openSale.customerId },
        select: { category: true },
      });
      if (!customer) throw new Error("Customer not found");

      const rate =
        changes.openSale.rate === undefined ||
        changes.openSale.rate === null ||
        changes.openSale.rate === ""
          ? null
          : toDecimal(changes.openSale.rate);
      const finalRate = computeSaleFinalRate(rate, customer.category);

      const purchaseForQuality = await tx.purchaseOrder.findUnique({
        where: { poNumber: nextPurchasePo },
        select: {
          qualityClassId: true,
          vessel: { select: { qualityClassId: true } },
        },
      });
      const qualityClassId =
        purchaseForQuality?.qualityClassId ||
        purchaseForQuality?.vessel.qualityClassId ||
        null;

      await tx.order.create({
        data: {
          poNumber,
          orderType: OrderType.OPEN,
          customerId: changes.openSale.customerId,
          orderDate: asDate(nextDispatchDate),
          orderById: changes.openSale.orderById || null,
          quantity: null,
          rate,
          finalRate,
          creditDays: null,
          portId: null,
          qualityClassId,
          orderStatus: OrderStatus.RUNNING,
          dispatchedOrder: new Decimal(0),
        },
      });

      nextPo = poNumber;
    }

    const balanceAffecting =
      !nextQty.eq(existing.dispatchedQuantity) ||
      nextPurchasePo !== existing.purchasePoNumber ||
      nextPo !== existing.poNumber;

    const termsChanging =
      changes.dispatchTerms !== undefined ||
      changes.transporterId !== undefined ||
      changes.freight !== undefined;

    let vesselId = existing.vesselId;
    let importerId = existing.importerId;

    if (balanceAffecting) {
      if (nextQty.lte(0)) {
        throw new Error("Dispatched quantity must be positive");
      }

      await applyDispatchDelta(tx, {
        poNumber: existing.poNumber,
        purchasePoNumber: existing.purchasePoNumber,
        qty: existing.dispatchedQuantity.neg(),
      });

      const targetOrder = await tx.order.findUnique({
        where: { poNumber: nextPo },
      });
      if (!targetOrder) {
        throw new Error(`Sale order ${nextPo} not found`);
      }

      const targetPurchase = await tx.purchaseOrder.findUnique({
        where: { poNumber: nextPurchasePo },
      });
      if (!targetPurchase) {
        throw new Error(`Purchase order ${nextPurchasePo} not found`);
      }

      await applyDispatchDelta(tx, {
        poNumber: nextPo,
        purchasePoNumber: nextPurchasePo,
        qty: nextQty,
      });

      vesselId = targetPurchase.vesselId;
      importerId = targetPurchase.importerId;
    }

    // Use checked UpdateInput (relation connect) — scalar FKs like
    // transporterId/vesselId are rejected when Prisma picks this path.
    const data: Prisma.DispatchUpdateInput = {};

    if (changes.dispatchedQuantity !== undefined || balanceAffecting) {
      data.dispatchedQuantity = nextQty;
    }

    if (balanceAffecting) {
      data.order = { connect: { poNumber: nextPo } };
      data.purchaseOrder = { connect: { poNumber: nextPurchasePo } };
      data.vessel = { connect: { id: vesselId } };
      data.importer = importerId
        ? { connect: { id: importerId } }
        : { disconnect: true };
    }

    if (termsChanging) {
      const termsFields = resolveDispatchTermsFields({
        dispatchTerms: nextTerms,
        transporterId:
          changes.transporterId !== undefined
            ? changes.transporterId
            : existing.transporterId,
        freight:
          changes.freight !== undefined ? changes.freight : existing.freight,
      });
      data.dispatchTerms = nextTerms;
      data.freight = termsFields.freight;
      data.transporter = termsFields.transporterId
        ? { connect: { id: termsFields.transporterId } }
        : { disconnect: true };
    }

    if (changes.dispatchDate !== undefined) {
      data.dispatchDate = asDate(changes.dispatchDate);
    }
    if (changes.lorryNumber !== undefined) {
      data.lorryNumber = normalizeLorryNumber(changes.lorryNumber) ?? null;
    }
    if (changes.softCopyStatus !== undefined) {
      data.softCopyStatus = changes.softCopyStatus;
    }
    if (changes.entryInTally !== undefined) {
      data.entryInTally = changes.entryInTally;
    }
    if (changes.saleInvoiceNumber !== undefined) {
      data.saleInvoiceNumber = normalizeInvoiceNumber(changes.saleInvoiceNumber);
    }
    if (changes.purchaseInvoiceNumber !== undefined) {
      data.purchaseInvoiceNumber = normalizeInvoiceNumber(
        changes.purchaseInvoiceNumber,
      );
    }

    if (nextTerms === DispatchTerms.EX_PORT) {
      // Ex-Port: received qty tracks weight automatically; diff is 0.
      data.receivingQuantity = nextQty;
      data.receiptStatus = ReceiptStatus.RECEIVED;
      if (existing.receiptDate == null) {
        data.receiptDate = new Date();
      }
    } else if (changes.receivingQuantity !== undefined) {
      if (changes.receivingQuantity === null || changes.receivingQuantity === "") {
        data.receivingQuantity = null;
        data.receiptDate = null;
        data.receiptStatus = ReceiptStatus.PENDING;
      } else {
        const qty = toDecimal(changes.receivingQuantity);
        if (qty.lt(0)) {
          throw new Error("Receiving quantity must be non-negative");
        }
        data.receivingQuantity = qty;
        data.receiptStatus = ReceiptStatus.RECEIVED;
        if (existing.receiptDate == null) {
          data.receiptDate = new Date();
        }
      }
    }

    return tx.dispatch.update({
      where: { id },
      data,
    });
  });

  revalidateDispatchPaths();
  return { id: updated.id };
}

export async function deleteDispatch(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.dispatch.findUnique({ where: { id } });
    if (!existing) throw new Error("Dispatch not found");

    if (existing.receiptStatus !== ReceiptStatus.PENDING) {
      throw new Error(
        "Can only delete a dispatch while receiptStatus is PENDING",
      );
    }

    await applyDispatchDelta(tx, {
      poNumber: existing.poNumber,
      purchasePoNumber: existing.purchasePoNumber,
      qty: existing.dispatchedQuantity.neg(),
    });

    await tx.dispatch.delete({ where: { id } });
  });

  revalidateDispatchPaths();
}

export async function completeOpenOrder(
  orderId: string,
  details: CompleteOpenOrderInput,
): Promise<void> {
  const quantity = toDecimal(details.quantity);
  if (quantity.lt(0)) {
    throw new Error("Quantity must be non-negative");
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { customer: { select: { category: true } } },
    });
    if (!order) throw new Error("Order not found");
    if (order.orderType !== OrderType.OPEN) {
      throw new Error("Only OPEN orders can be completed this way");
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
    const nextFinalRate =
      details.rate === undefined
        ? order.finalRate
        : computeSaleFinalRate(rate, order.customer.category);

    const nextStatus = OrderStatus.COMPLETED;

    const oldAmount = dispatchedAmount(order.finalRate, order.dispatchedOrder);
    const newAmount = dispatchedAmount(nextFinalRate, order.dispatchedOrder);

    await tx.order.update({
      where: { id: orderId },
      data: {
        quantity,
        rate,
        ...(details.rate !== undefined ? { finalRate: nextFinalRate } : {}),
        creditDays:
          details.creditDays === undefined ? undefined : details.creditDays,
        qualityClassId:
          details.qualityClassId === undefined
            ? undefined
            : details.qualityClassId,
        portId:
          details.portId === undefined ? undefined : details.portId || null,
        orderStatus: nextStatus,
      },
    });

    await adjustCustomerDue(
      tx,
      order.customerId,
      newAmount.minus(oldAmount),
    );
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/customers");
}

export async function confirmReceipt(
  dispatchId: string,
  receivingQuantity: DecimalLike,
): Promise<{ id: string }> {
  const qty = toDecimal(receivingQuantity);
  if (qty.lt(0)) {
    throw new Error("Receiving quantity must be non-negative");
  }

  const updated = await prisma.dispatch.update({
    where: { id: dispatchId },
    data: {
      receivingQuantity: qty,
      receiptDate: new Date(),
      receiptStatus: ReceiptStatus.RECEIVED,
    },
  });

  revalidatePath("/receipts/pending");
  revalidatePath("/reconciliation");
  revalidatePath("/orders");
  revalidatePath("/dispatches");
  return { id: updated.id };
}
