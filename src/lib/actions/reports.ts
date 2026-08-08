"use server";

import { CustomerCategory, type Prisma } from "@/generated/prisma";
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

export type CustomerAnalysisListRow = {
  id: string;
  name: string;
  category: CustomerCategory;
  active: boolean;
  city: string | null;
  state: string | null;
  totalQuantity: string;
  totalProfit: string | null;
  marginPmt: string | null;
};

export async function listCustomerAnalysisReport(): Promise<
  CustomerAnalysisListRow[]
> {
  const customers = await prisma.customer.findMany({
    where: {
      category: {
        in: [CustomerCategory.INDUSTRY, CustomerCategory.TRADER],
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      active: true,
      city: true,
      state: true,
    },
  });

  const dispatches = await prisma.dispatch.findMany({
    select: {
      dispatchedQuantity: true,
      dispatchTerms: true,
      freight: true,
      order: {
        select: {
          customerId: true,
          rate: true,
          finalRate: true,
        },
      },
      purchaseOrder: {
        select: {
          rate: true,
          finalRate: true,
        },
      },
    },
  });

  const byCustomer = new Map<
    string,
    { volume: Decimal; profit: Decimal | null }
  >();

  for (const d of dispatches) {
    const customerId = d.order.customerId;
    let agg = byCustomer.get(customerId);
    if (!agg) {
      agg = { volume: new Decimal(0), profit: null };
      byCustomer.set(customerId, agg);
    }
    agg.volume = agg.volume.plus(d.dispatchedQuantity);

    const profit = lineProfit({
      saleRate: saleRevenueRate(d.order),
      costRate: d.purchaseOrder ? purchaseCostRate(d.purchaseOrder) : null,
      quantity: d.dispatchedQuantity,
      dispatchTerms: d.dispatchTerms,
      freight: d.freight,
    });
    if (profit != null) {
      agg.profit = agg.profit == null ? profit : agg.profit.plus(profit);
    }
  }

  return customers.map((c) => {
    const agg = byCustomer.get(c.id);
    const totalQuantity = (agg?.volume ?? new Decimal(0)).toString();
    const totalProfit = agg?.profit?.toDecimalPlaces(2).toString() ?? null;
    const marginPmt =
      agg?.profit != null && agg.volume.gt(0)
        ? agg.profit.div(agg.volume).toDecimalPlaces(2).toString()
        : null;

    return {
      id: c.id,
      name: c.name,
      category: c.category,
      active: c.active,
      city: c.city,
      state: c.state,
      totalQuantity,
      totalProfit,
      marginPmt,
    };
  });
}

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

export type VesselReportListRow = {
  id: string;
  vesselName: string;
  active: boolean;
  portName: string | null;
  portState: string | null;
  qualityClass: {
    origin: { name: string };
    domestic: boolean;
    qualityOption: { name: string };
  } | null;
  orderQuantity: string;
  dispatchedQuantity: string;
  closingQuantity: string;
  balanceQuantity: string;
  purchaseOrderCount: number;
};

export type VesselReportPoRow = {
  id: string;
  poNumber: string;
  orderDate: string | null;
  orderType: string;
  orderStatus: string;
  quantity: string | null;
  dispatchedOrder: string;
  closingQuantity: string | null;
  balanceOrder: string | null;
  vendorName: string;
  rate: string | null;
  finalRate: string | null;
};

function sumDecimal(values: (Decimal | null | undefined)[]): Decimal {
  let total = new Decimal(0);
  for (const v of values) {
    if (v != null) total = total.plus(v);
  }
  return total;
}

/** Aggregate order qty the same way the PO list displays it (open → dispatched). */
function displayOrderQtyValue(order: {
  orderType: string;
  quantity: Decimal | null;
  dispatchedOrder: Decimal;
}): Decimal {
  if (order.orderType === "OPEN") return order.dispatchedOrder;
  return order.quantity ?? new Decimal(0);
}

function displayBalanceValue(order: {
  orderType: string;
  quantity: Decimal | null;
  dispatchedOrder: Decimal;
  closingQuantity: Decimal | null;
}): Decimal {
  if (order.orderType === "OPEN" && order.quantity == null) {
    return new Decimal(0);
  }
  return balanceOrder(order) ?? new Decimal(0);
}

export async function listVesselReport(): Promise<VesselReportListRow[]> {
  const vessels = await prisma.vessel.findMany({
    include: {
      qualityClass: { include: qualityClassInclude },
      port: { select: { name: true, state: true } },
      purchaseOrders: {
        select: {
          orderType: true,
          quantity: true,
          dispatchedOrder: true,
          closingQuantity: true,
        },
      },
    },
    orderBy: { vesselName: "asc" },
  });

  return vessels.map((v) => {
    const pos = v.purchaseOrders;
    return {
      id: v.id,
      vesselName: v.vesselName,
      active: v.active,
      portName: v.port?.name ?? null,
      portState: v.port?.state ?? null,
      qualityClass: v.qualityClass,
      orderQuantity: sumDecimal(pos.map(displayOrderQtyValue)).toString(),
      dispatchedQuantity: sumDecimal(pos.map((o) => o.dispatchedOrder)).toString(),
      closingQuantity: sumDecimal(pos.map((o) => o.closingQuantity)).toString(),
      balanceQuantity: sumDecimal(pos.map(displayBalanceValue)).toString(),
      purchaseOrderCount: pos.length,
    };
  });
}

export async function getVesselReport(vesselId: string) {
  const vessel = await prisma.vessel.findUnique({
    where: { id: vesselId },
    include: {
      qualityClass: { include: qualityClassInclude },
      port: { select: { id: true, name: true, state: true } },
      purchaseOrders: {
        include: {
          importer: { select: { id: true, name: true } },
        },
        orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!vessel) return null;

  const pos = vessel.purchaseOrders;
  const totals = {
    orderQuantity: sumDecimal(pos.map(displayOrderQtyValue)).toString(),
    dispatchedQuantity: sumDecimal(pos.map((o) => o.dispatchedOrder)).toString(),
    closingQuantity: sumDecimal(pos.map((o) => o.closingQuantity)).toString(),
    balanceQuantity: sumDecimal(pos.map(displayBalanceValue)).toString(),
  };

  return {
    vessel: {
      id: vessel.id,
      vesselName: vessel.vesselName,
      active: vessel.active,
      portName: vessel.port?.name ?? null,
      portState: vessel.port?.state ?? null,
      qualityClass: vessel.qualityClass,
    },
    totals,
    purchaseOrders: pos.map(
      (o): VesselReportPoRow => ({
        id: o.id,
        poNumber: o.poNumber,
        orderDate: o.orderDate?.toISOString() ?? null,
        orderType: o.orderType,
        orderStatus: computePurchaseOrderStatus(o),
        quantity: o.quantity?.toString() ?? null,
        dispatchedOrder: o.dispatchedOrder.toString(),
        closingQuantity: o.closingQuantity?.toString() ?? null,
        balanceOrder: balanceOrder(o)?.toString() ?? null,
        vendorName: o.importer.name,
        rate: o.rate?.toString() ?? null,
        finalRate: o.finalRate?.toString() ?? null,
      }),
    ),
  };
}

export type VesselSuppliedListRow = {
  id: string;
  vesselName: string;
  active: boolean;
  qualityClass: {
    origin: { name: string };
    domestic: boolean;
    qualityOption: { name: string };
  } | null;
  totalQuantity: string;
  industryQuantity: string;
  traderVendorQuantity: string;
};

export async function listVesselSuppliedReport(): Promise<
  VesselSuppliedListRow[]
> {
  const vessels = await prisma.vessel.findMany({
    include: {
      qualityClass: { include: qualityClassInclude },
      dispatches: {
        select: {
          dispatchedQuantity: true,
          order: {
            select: {
              customer: { select: { category: true } },
            },
          },
        },
      },
    },
    orderBy: { vesselName: "asc" },
  });

  return vessels.map((v) => {
    let total = new Decimal(0);
    let industry = new Decimal(0);
    let traderVendor = new Decimal(0);

    for (const d of v.dispatches) {
      const qty = d.dispatchedQuantity;
      total = total.plus(qty);
      const category = d.order.customer.category;
      if (category === CustomerCategory.INDUSTRY) {
        industry = industry.plus(qty);
      } else if (
        category === CustomerCategory.TRADER ||
        category === CustomerCategory.SUPPLIER
      ) {
        traderVendor = traderVendor.plus(qty);
      }
    }

    return {
      id: v.id,
      vesselName: v.vesselName,
      active: v.active,
      qualityClass: v.qualityClass,
      totalQuantity: total.toString(),
      industryQuantity: industry.toString(),
      traderVendorQuantity: traderVendor.toString(),
    };
  });
}

export type VesselSuppliedCustomerRow = {
  customerId: string;
  customerName: string;
  category: CustomerCategory;
  totalQuantity: string;
  profit: string | null;
};

export async function getVesselSuppliedReport(vesselId: string) {
  const vessel = await prisma.vessel.findUnique({
    where: { id: vesselId },
    include: {
      qualityClass: { include: qualityClassInclude },
      dispatches: {
        select: {
          dispatchedQuantity: true,
          dispatchTerms: true,
          freight: true,
          order: {
            select: {
              rate: true,
              customer: {
                select: { id: true, name: true, category: true },
              },
            },
          },
          purchaseOrder: {
            select: { rate: true },
          },
        },
      },
    },
  });
  if (!vessel) return null;

  const byCustomer = new Map<
    string,
    {
      customerId: string;
      customerName: string;
      category: CustomerCategory;
      totalQuantity: Decimal;
      profit: Decimal | null;
    }
  >();

  for (const d of vessel.dispatches) {
    const customer = d.order.customer;
    let row = byCustomer.get(customer.id);
    if (!row) {
      row = {
        customerId: customer.id,
        customerName: customer.name,
        category: customer.category,
        totalQuantity: new Decimal(0),
        profit: null,
      };
      byCustomer.set(customer.id, row);
    }

    row.totalQuantity = row.totalQuantity.plus(d.dispatchedQuantity);

    const profit = lineProfit({
      saleRate: d.order.rate,
      costRate: d.purchaseOrder?.rate ?? null,
      quantity: d.dispatchedQuantity,
      dispatchTerms: d.dispatchTerms,
      freight: d.freight,
    });
    if (profit != null) {
      row.profit = row.profit == null ? profit : row.profit.plus(profit);
    }
  }

  const customers: VesselSuppliedCustomerRow[] = [...byCustomer.values()]
    .map((row) => ({
      customerId: row.customerId,
      customerName: row.customerName,
      category: row.category,
      totalQuantity: row.totalQuantity.toString(),
      profit: row.profit?.toDecimalPlaces(2).toString() ?? null,
    }))
    .sort((a, b) => a.customerName.localeCompare(b.customerName));

  return {
    vessel: {
      id: vessel.id,
      vesselName: vessel.vesselName,
      active: vessel.active,
      qualityClass: vessel.qualityClass,
    },
    customers,
  };
}

export type QualityReportListRow = {
  id: string;
  qualityClass: {
    origin: { name: string };
    domestic: boolean;
    qualityOption: { name: string };
  };
  poBalance: string;
  soBalance: string;
  unsoldQuantity: string;
};

export type QualityReportVesselRow = {
  id: string;
  vesselName: string;
  active: boolean;
  portName: string | null;
  portState: string | null;
  balanceQuantity: string;
};

const orderBalanceSelect = {
  orderType: true,
  quantity: true,
  dispatchedOrder: true,
  closingQuantity: true,
} as const;

export async function listQualityReport(): Promise<QualityReportListRow[]> {
  const classes = await prisma.qualityClass.findMany({
    include: {
      ...qualityClassInclude,
      purchaseOrders: { select: orderBalanceSelect },
      orders: { select: orderBalanceSelect },
    },
  });

  const rows = classes.map((qc) => {
    const poBalance = sumDecimal(qc.purchaseOrders.map(displayBalanceValue));
    const soBalance = sumDecimal(qc.orders.map(displayBalanceValue));
    const unsold = poBalance.minus(soBalance);
    return {
      id: qc.id,
      qualityClass: {
        origin: qc.origin,
        domestic: qc.domestic,
        qualityOption: qc.qualityOption,
      },
      poBalance: poBalance.toString(),
      soBalance: soBalance.toString(),
      unsoldQuantity: unsold.toString(),
    };
  });

  rows.sort((a, b) =>
    formatQualityClassLabel(a.qualityClass).localeCompare(
      formatQualityClassLabel(b.qualityClass),
    ),
  );
  return rows;
}

function formatQualityClassLabel(qc: {
  origin: { name: string };
  domestic: boolean;
  qualityOption: { name: string };
}): string {
  const domestic = qc.domestic ? "Domestic" : "Imported";
  return `${domestic} · ${qc.origin.name} · ${qc.qualityOption.name}`;
}

export async function getQualityReport(qualityClassId: string) {
  const qualityClass = await prisma.qualityClass.findUnique({
    where: { id: qualityClassId },
    include: {
      ...qualityClassInclude,
      purchaseOrders: { select: orderBalanceSelect },
      orders: { select: orderBalanceSelect },
    },
  });
  if (!qualityClass) return null;

  const poBalance = sumDecimal(
    qualityClass.purchaseOrders.map(displayBalanceValue),
  );
  const soBalance = sumDecimal(qualityClass.orders.map(displayBalanceValue));
  const unsold = poBalance.minus(soBalance);

  // Vessels with POs of this quality, plus vessels tagged with this quality.
  const vessels = await prisma.vessel.findMany({
    where: {
      OR: [
        { qualityClassId },
        { purchaseOrders: { some: { qualityClassId } } },
      ],
    },
    include: {
      port: { select: { name: true, state: true } },
      purchaseOrders: {
        where: { qualityClassId },
        select: orderBalanceSelect,
      },
    },
    orderBy: { vesselName: "asc" },
  });

  return {
    qualityClass: {
      id: qualityClass.id,
      origin: qualityClass.origin,
      domestic: qualityClass.domestic,
      qualityOption: qualityClass.qualityOption,
    },
    totals: {
      poBalance: poBalance.toString(),
      soBalance: soBalance.toString(),
      unsoldQuantity: unsold.toString(),
    },
    vessels: vessels.map(
      (v): QualityReportVesselRow => ({
        id: v.id,
        vesselName: v.vesselName,
        active: v.active,
        portName: v.port?.name ?? null,
        portState: v.port?.state ?? null,
        balanceQuantity: sumDecimal(
          v.purchaseOrders.map(displayBalanceValue),
        ).toString(),
      }),
    ),
  };
}
