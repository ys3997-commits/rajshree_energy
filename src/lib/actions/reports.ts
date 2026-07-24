"use server";

import type { Prisma } from "@/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import {
  balanceOrder,
  computeOrderStatus,
  computePurchaseOrderStatus,
  diffInQuantity,
  effectiveSaleRate,
  lineProfit,
  purchaseCostRate,
  saleRevenueRate,
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

export type CustomerAnalysisFilters = {
  dateFrom?: string;
  dateTo?: string;
};

export type CustomerSideMetrics = {
  orderCount: number;
  /** Current open balance (MT); not date-filtered. */
  balanceOrder: string | null;
  dispatchedVolume: string;
  totalProfit: string | null;
  avgProfitPerMt: string | null;
  marginPercent: string | null;
  lastDispatchDate: string | null;
};

export type CustomerAnalysisOrderRow = {
  id: string;
  poNumber: string;
  status: string;
  quantity: string | null;
  dispatchedOrder: string;
  balanceOrder: string | null;
};

export type CustomerAnalysisDispatchRow = {
  id: string;
  side: "sale" | "purchase";
  dispatchDate: string;
  dispatchedQuantity: string;
  vesselName: string;
  salePoNumber: string;
  orderId: string | null;
  purchasePoNumber: string;
  purchaseOrderId: string | null;
  lineProfit: string | null;
};

function sumOpenBalances(
  orders: { quantity: Decimal | null; dispatchedOrder: Decimal }[],
): Decimal | null {
  let total = new Decimal(0);
  let any = false;
  for (const order of orders) {
    const bal = balanceOrder(order);
    if (bal == null || bal.lte(0)) continue;
    any = true;
    total = total.plus(bal);
  }
  return any ? total : null;
}

function dispatchDateWhere(
  filters: CustomerAnalysisFilters,
): Prisma.DateTimeFilter | undefined {
  if (!filters.dateFrom && !filters.dateTo) return undefined;
  const range: Prisma.DateTimeFilter = {};
  if (filters.dateFrom) {
    range.gte = new Date(`${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters.dateTo) {
    range.lte = new Date(`${filters.dateTo}T23:59:59.999Z`);
  }
  return range;
}

function aggregateSide(args: {
  orderCount: number;
  balance: Decimal | null;
  dispatches: {
    dispatchedQuantity: Decimal;
    dispatchDate: Date;
    dispatchTerms: NonNullable<
      Parameters<typeof lineProfit>[0]["dispatchTerms"]
    >;
    freight: Decimal | null;
    order: {
      rate: Decimal | null;
      finalRate: Decimal | null;
    } | null;
    purchaseOrder: {
      rate: Decimal | null;
      finalRate: Decimal | null;
    } | null;
  }[];
}): CustomerSideMetrics {
  let volume = new Decimal(0);
  let profitTotal: Decimal | null = null;
  let revenueTotal: Decimal | null = null;
  let lastDispatchDate: Date | null = null;

  for (const d of args.dispatches) {
    volume = volume.plus(d.dispatchedQuantity);
    if (
      lastDispatchDate == null ||
      d.dispatchDate.getTime() > lastDispatchDate.getTime()
    ) {
      lastDispatchDate = d.dispatchDate;
    }

    const saleRate = d.order ? saleRevenueRate(d.order) : null;
    const costRate = d.purchaseOrder
      ? purchaseCostRate(d.purchaseOrder)
      : null;

    const profit = lineProfit({
      saleRate,
      costRate,
      quantity: d.dispatchedQuantity,
      dispatchTerms: d.dispatchTerms,
      freight: d.freight,
    });
    if (profit != null) {
      profitTotal = profitTotal == null ? profit : profitTotal.plus(profit);
    }

    const goodsRate = effectiveSaleRate({
      saleRate,
      dispatchTerms: d.dispatchTerms,
      freight: d.freight,
    });
    if (goodsRate != null) {
      const revenue = goodsRate.mul(d.dispatchedQuantity);
      revenueTotal =
        revenueTotal == null ? revenue : revenueTotal.plus(revenue);
    }
  }

  const avgProfitPerMt =
    profitTotal != null && volume.gt(0) ? profitTotal.div(volume) : null;
  const marginPercent =
    profitTotal != null && revenueTotal != null && revenueTotal.gt(0)
      ? profitTotal.div(revenueTotal).mul(100)
      : null;

  return {
    orderCount: args.orderCount,
    balanceOrder: args.balance?.toString() ?? null,
    dispatchedVolume: volume.toString(),
    totalProfit: profitTotal?.toDecimalPlaces(2).toString() ?? null,
    avgProfitPerMt: avgProfitPerMt?.toDecimalPlaces(2).toString() ?? null,
    marginPercent: marginPercent?.toFixed(2) ?? null,
    lastDispatchDate: lastDispatchDate?.toISOString() ?? null,
  };
}

const dispatchInclude = {
  vessel: { select: { id: true, vesselName: true } },
  order: {
    select: {
      id: true,
      poNumber: true,
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
    },
  },
} as const;

export async function getCustomerAnalysis(
  customerId: string,
  filters: CustomerAnalysisFilters = {},
) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) return null;

  const dateFilter = dispatchDateWhere(filters);
  const dateWhere = dateFilter ? { dispatchDate: dateFilter } : {};

  const [saleOrders, purchaseOrders, saleDispatches, purchaseDispatches] =
    await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          poNumber: true,
          orderType: true,
          quantity: true,
          dispatchedOrder: true,
        },
      }),
      prisma.purchaseOrder.findMany({
        where: { importerId: customerId },
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          poNumber: true,
          quantity: true,
          dispatchedOrder: true,
        },
      }),
      prisma.dispatch.findMany({
        where: { order: { customerId }, ...dateWhere },
        include: dispatchInclude,
        orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
      }),
      prisma.dispatch.findMany({
        where: { purchaseOrder: { importerId: customerId }, ...dateWhere },
        include: dispatchInclude,
        orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
      }),
    ]);

  const saleSide = aggregateSide({
    orderCount: saleOrders.length,
    balance: sumOpenBalances(saleOrders),
    dispatches: saleDispatches,
  });

  const purchaseSide = aggregateSide({
    orderCount: purchaseOrders.length,
    balance: sumOpenBalances(purchaseOrders),
    dispatches: purchaseDispatches,
  });

  function mapDispatch(
    row: (typeof saleDispatches)[number],
    side: "sale" | "purchase",
  ): CustomerAnalysisDispatchRow {
    return {
      id: row.id,
      side,
      dispatchDate: row.dispatchDate.toISOString(),
      dispatchedQuantity: row.dispatchedQuantity.toString(),
      vesselName: row.vessel.vesselName,
      salePoNumber: row.poNumber,
      orderId: row.order?.id ?? null,
      purchasePoNumber: row.purchasePoNumber,
      purchaseOrderId: row.purchaseOrder?.id ?? null,
      lineProfit:
        lineProfit({
          saleRate: row.order ? saleRevenueRate(row.order) : null,
          costRate: row.purchaseOrder
            ? purchaseCostRate(row.purchaseOrder)
            : null,
          quantity: row.dispatchedQuantity,
          dispatchTerms: row.dispatchTerms,
          freight: row.freight,
        })?.toString() ?? null,
    };
  }

  const seen = new Set<string>();
  const dispatches: CustomerAnalysisDispatchRow[] = [];
  for (const row of saleDispatches) {
    seen.add(row.id);
    dispatches.push(mapDispatch(row, "sale"));
  }
  for (const row of purchaseDispatches) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    dispatches.push(mapDispatch(row, "purchase"));
  }
  dispatches.sort((a, b) => b.dispatchDate.localeCompare(a.dispatchDate));

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      category: customer.category,
      active: customer.active,
      due: customer.due.toString(),
      city: customer.city,
      state: customer.state,
      creditDays: customer.creditDays,
      saleExecutive: customer.saleExecutive,
      ownerName: customer.ownerName,
      ownerContact: customer.ownerContact,
      sector: customer.sector,
      email: customer.email,
    },
    saleSide,
    purchaseSide,
    saleOrders: saleOrders.map(
      (o): CustomerAnalysisOrderRow => ({
        id: o.id,
        poNumber: o.poNumber,
        status: computeOrderStatus(o),
        quantity: o.quantity?.toString() ?? null,
        dispatchedOrder: o.dispatchedOrder.toString(),
        balanceOrder: balanceOrder(o)?.toString() ?? null,
      }),
    ),
    purchaseOrders: purchaseOrders.map(
      (o): CustomerAnalysisOrderRow => ({
        id: o.id,
        poNumber: o.poNumber,
        status: computePurchaseOrderStatus(o),
        quantity: o.quantity?.toString() ?? null,
        dispatchedOrder: o.dispatchedOrder.toString(),
        balanceOrder: balanceOrder(o)?.toString() ?? null,
      }),
    ),
    dispatches,
  };
}
