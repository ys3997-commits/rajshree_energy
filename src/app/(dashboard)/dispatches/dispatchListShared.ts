import { DispatchTerms, ReceiptStatus } from "@/generated/prisma";
import { listDispatches, type DispatchFilters } from "@/lib/actions/receipts";
import { listCustomers } from "@/lib/actions/customers";
import { listOrdersWithBalance } from "@/lib/actions/orders";
import {
  listPurchaseOrdersWithBalance,
  suggestNextPurchasePoNumber,
} from "@/lib/actions/purchaseOrders";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import {
  suggestNextDispatchNumber,
  suggestNextPoNumber,
} from "@/lib/actions/dispatch";
import { listPortOptions } from "@/lib/actions/ports";
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatDispatchTerms,
  formatLorryNumber,
  formatQualityClass,
  formatAmount,
} from "@/lib/domain/format";
import { computeGst, toDecimal, type DecimalLike } from "@/lib/domain/computations";
import {
  parsePurchaseOrderSequence,
  parseSaleOrderSequence,
} from "@/lib/domain/orderNumbers";
import { PURCHASE_TCS_RATE } from "@/lib/domain/purchaseRate";
import { SALE_TCS_RATE, saleTcsApplies } from "@/lib/domain/saleRate";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";

export type DispatchSearchParams = {
  receiptStatus?: string;
  purchaseUpdateStatus?: string;
  saleUpdateStatus?: string;
  receivedQtyStatus?: string;
  reconciliationStatus?: string;
  poNumber?: string;
  purchasePoNumber?: string;
  vesselId?: string;
  vendorId?: string;
  customerId?: string;
  dispatchTerms?: string;
  dispatchDate?: string;
  dispatchDateStart?: string;
  dispatchDateEnd?: string;
  coalOrigin?: string;
  portId?: string;
};

export function displayOrderDigits(
  poNumber: string,
  kind: "sale" | "purchase",
): string {
  const seq =
    kind === "sale"
      ? parseSaleOrderSequence(poNumber)
      : parsePurchaseOrderSequence(poNumber);
  if (seq != null) return String(seq).padStart(4, "0");
  return poNumber.replace(/^(SO|PO)\s+/i, "").trim() || poNumber;
}

export function formatPurchaseBasicAmount(
  weight: DecimalLike,
  basicRate: DecimalLike | null | undefined,
): string {
  if (basicRate == null) return "—";
  return formatAmount(toDecimal(weight).mul(toDecimal(basicRate)));
}

export function formatPurchaseGstAmount(
  weight: DecimalLike,
  basicRate: DecimalLike | null | undefined,
): string {
  const gst = computeGst({
    rate: basicRate != null ? toDecimal(basicRate) : null,
    quantity: toDecimal(weight),
  });
  if (gst == null) return "—";
  return formatAmount(gst);
}

export function formatPurchaseTcsAmount(
  weight: DecimalLike,
  basicRate: DecimalLike | null | undefined,
): string {
  const gst = computeGst({
    rate: basicRate != null ? toDecimal(basicRate) : null,
    quantity: toDecimal(weight),
  });
  if (gst == null || basicRate == null) return "—";
  const tcs = toDecimal(weight)
    .mul(toDecimal(basicRate))
    .plus(gst)
    .mul(PURCHASE_TCS_RATE);
  return formatAmount(tcs);
}

export function formatPurchaseTotalAmount(
  weight: DecimalLike,
  basicRate: DecimalLike | null | undefined,
): string {
  if (basicRate == null) return "—";
  const basicAmount = toDecimal(weight).mul(basicRate);
  const gst = computeGst({
    rate: toDecimal(basicRate),
    quantity: toDecimal(weight),
  });
  if (gst == null) return "—";
  const tcs = basicAmount.plus(gst).mul(PURCHASE_TCS_RATE);
  return formatAmount(basicAmount.plus(gst).plus(tcs));
}

export function formatSaleGstAmount(
  weight: DecimalLike,
  basicRate: DecimalLike | null | undefined,
): string {
  return formatPurchaseGstAmount(weight, basicRate);
}

export function formatSaleTcsAmount(
  weight: DecimalLike,
  basicRate: DecimalLike | null | undefined,
  category: string | null | undefined,
): string {
  if (!saleTcsApplies(category)) return "—";
  const gst = computeGst({
    rate: basicRate != null ? toDecimal(basicRate) : null,
    quantity: toDecimal(weight),
  });
  if (gst == null || basicRate == null) return "—";
  const tcs = toDecimal(weight)
    .mul(toDecimal(basicRate))
    .plus(gst)
    .mul(SALE_TCS_RATE);
  return formatAmount(tcs);
}

export function formatSaleTotalAmount(
  weight: DecimalLike,
  basicRate: DecimalLike | null | undefined,
  category: string | null | undefined,
): string {
  if (basicRate == null) return "—";
  const basicAmount = toDecimal(weight).mul(toDecimal(basicRate));
  const gst = computeGst({
    rate: toDecimal(basicRate),
    quantity: toDecimal(weight),
  });
  if (gst == null) return "—";
  if (saleTcsApplies(category)) {
    const tcs = basicAmount.plus(gst).mul(SALE_TCS_RATE);
    return formatAmount(basicAmount.plus(gst).plus(tcs));
  }
  return formatAmount(basicAmount.plus(gst));
}

export const dispatchExportColumns = [
  { key: "dispatchNumber", header: "Dispatch\nno" },
  { key: "date", header: "Date" },
  { key: "lorryNumber", header: "Lorry\nno" },
  { key: "weight", header: "Weight", align: "right" as const },
  { key: "vesselName", header: "Vessel\nname" },
  { key: "quality", header: "Quality" },
  { key: "gstState", header: "GST\nstate" },
  { key: "purchasePo", header: "PO\nno" },
  { key: "purchaseInvoice", header: "Purchase\ninvoice" },
  { key: "vendor", header: "Vendor" },
  {
    key: "purchaseBasic",
    header: "Purchase basic\nprice",
    align: "right" as const,
  },
  {
    key: "purchaseGstAmount",
    header: "GST",
    align: "right" as const,
  },
  {
    key: "purchaseTcsAmount",
    header: "TCS",
    align: "right" as const,
  },
  {
    key: "purchaseTotalAmount",
    header: "Invoice\nAmount",
    align: "right" as const,
  },
  { key: "salePo", header: "SO\nno" },
  { key: "saleInvoice", header: "Sale\ninvoice" },
  { key: "customer", header: "Customer\nname" },
  {
    key: "saleBasic",
    header: "Sale basic\nprice",
    align: "right" as const,
  },
  {
    key: "saleGstAmount",
    header: "GST",
    align: "right" as const,
  },
  {
    key: "saleTcsAmount",
    header: "TCS",
    align: "right" as const,
  },
  {
    key: "saleTotalAmount",
    header: "Invoice\nAmount",
    align: "right" as const,
  },
  { key: "deliveryTerms", header: "Delivery\nterms" },
  { key: "transporter", header: "Transporter\nname" },
  { key: "freightPmt", header: "Freight\nPMT", align: "right" as const },
  {
    key: "freightAmount",
    header: "Freight\namount",
    align: "right" as const,
  },
  { key: "received", header: "Received", align: "right" as const },
  { key: "diff", header: "Diff", align: "right" as const },
  { key: "purchaseInTally", header: "Purchase\nin tally" },
];

export const dispatchExportColumnsReconciliation = [
  { key: "dispatchNumber", header: "Dispatch\nno" },
  { key: "date", header: "Date" },
  { key: "lorryNumber", header: "Lorry\nno" },
  { key: "weight", header: "Weight", align: "right" as const },
  { key: "gstState", header: "GST\nstate" },
  { key: "purchasePo", header: "PO\nno" },
  { key: "purchaseInvoice", header: "Purchase\ninvoice" },
  { key: "vendor", header: "Vendor" },
  {
    key: "purchaseBasic",
    header: "Purchase basic\nprice",
    align: "right" as const,
  },
  {
    key: "purchaseGstAmount",
    header: "GST",
    align: "right" as const,
  },
  {
    key: "purchaseTcsAmount",
    header: "TCS",
    align: "right" as const,
  },
  {
    key: "purchaseTotalAmount",
    header: "Total\nAmount",
    align: "right" as const,
  },
  { key: "salePo", header: "SO\nno" },
  { key: "saleInvoice", header: "Sale\ninvoice" },
  { key: "customer", header: "Customer\nname" },
  {
    key: "saleBasic",
    header: "Sale basic\nprice",
    align: "right" as const,
  },
  {
    key: "saleGstAmount",
    header: "GST",
    align: "right" as const,
  },
  {
    key: "saleTcsAmount",
    header: "TCS",
    align: "right" as const,
  },
  {
    key: "saleTotalAmount",
    header: "Total\nAmount",
    align: "right" as const,
  },
  { key: "deliveryTerms", header: "Delivery\nterms" },
  { key: "reconciled", header: "Reconciled" },
];

export const dispatchExportColumnsPurchaseInvoiceAfterDate = (() => {
  const columns = [...dispatchExportColumns];
  const moveColumn = (key: string, afterKey: string) => {
    const columnIndex = columns.findIndex((column) => column.key === key);
    const [column] = columns.splice(columnIndex, 1);
    const afterIndex = columns.findIndex((column) => column.key === afterKey);
    columns.splice(afterIndex + 1, 0, column);
  };
  moveColumn("purchaseInvoice", "date");
  moveColumn("purchaseBasic", "weight");
  const purchaseBasicIndex = columns.findIndex(
    (column) => column.key === "purchaseBasic",
  );
  columns.splice(purchaseBasicIndex + 1, 0, {
    key: "purchaseBasicAmount",
    header: "Basic Amount",
    align: "right" as const,
  });
  moveColumn("purchaseGstAmount", "purchaseBasicAmount");
  moveColumn("purchaseTcsAmount", "purchaseGstAmount");
  moveColumn("purchaseTotalAmount", "purchaseTcsAmount");
  moveColumn("vendor", "purchaseTotalAmount");
  moveColumn("gstState", "vendor");
  const hiddenKeys = new Set([
    "salePo",
    "saleInvoice",
    "customer",
    "saleBasic",
    "saleGstAmount",
    "saleTcsAmount",
    "saleTotalAmount",
    "deliveryTerms",
    "transporter",
    "freightPmt",
    "freightAmount",
    "profit",
    "received",
    "diff",
    "vesselName",
    "quality",
    "purchasePo",
  ]);
  return columns
    .filter((column) => !hiddenKeys.has(column.key))
    .map((column) => {
      let header = column.header
        .replace(/\s*\(MT\)/gi, "")
        .replace(/\s*\(Rs\)/gi, "")
        .trim();
      if (column.key === "purchaseBasic") {
        header = "Basic price";
      }
      if (column.key === "purchaseTotalAmount") {
        header = "Total amount";
      }
      return { ...column, header };
    });
})();

export type DispatchRow = Awaited<ReturnType<typeof listDispatches>>[number];

export type DispatchListData = Awaited<ReturnType<typeof loadDispatchListData>>;

export function buildUpdatePurchaseExportRows(dispatches: DispatchRow[]) {
  return buildDispatchExportRows(dispatches).map((row, index) => ({
    ...row,
    purchaseBasic: formatAmount(dispatches[index].purchaseBasicRate),
  }));
}

export const dispatchExportColumnsUpdateSale = [
  { key: "dispatchNumber", header: "Dispatch no" },
  { key: "date", header: "Date" },
  { key: "saleInvoice", header: "Sale invoice" },
  { key: "lorryNumber", header: "Lorry no" },
  { key: "weight", header: "Loading Qty", align: "right" as const },
  {
    key: "saleBasic",
    header: "Basic price",
    align: "right" as const,
  },
  {
    key: "saleGstAmount",
    header: "GST",
    align: "right" as const,
  },
  {
    key: "saleTcsAmount",
    header: "TCS",
    align: "right" as const,
  },
  {
    key: "saleTotalAmount",
    header: "Total Amount",
    align: "right" as const,
  },
  { key: "customer", header: "Customer" },
  { key: "deliveryTerms", header: "Delivery terms" },
  { key: "transporter", header: "Transporter name" },
  { key: "received", header: "Received Qty", align: "right" as const },
  { key: "diff", header: "Diff Qty", align: "right" as const },
];

export function buildUpdateSaleExportRows(dispatches: DispatchRow[]) {
  return buildDispatchExportRows(dispatches).map((row, index) => ({
    dispatchNumber: row.dispatchNumber,
    date: row.date,
    saleInvoice: row.saleInvoice,
    lorryNumber: row.lorryNumber,
    weight: row.weight,
    saleBasic: formatAmount(dispatches[index].saleBasicRate),
    saleGstAmount: formatSaleGstAmount(
      dispatches[index].dispatchedQuantity,
      dispatches[index].saleBasicRate,
    ),
    saleTcsAmount: formatSaleTcsAmount(
      dispatches[index].dispatchedQuantity,
      dispatches[index].saleBasicRate,
      dispatches[index].customerCategory,
    ),
    saleTotalAmount: formatSaleTotalAmount(
      dispatches[index].dispatchedQuantity,
      dispatches[index].saleBasicRate,
      dispatches[index].customerCategory,
    ),
    customer: row.customer,
    deliveryTerms: row.deliveryTerms,
    transporter: row.transporter,
    received: row.received,
    diff: row.diff,
  }));
}

export function buildDispatchExportRows(dispatches: DispatchRow[]) {
  return dispatches.map((row) => {
    const isExPort = row.dispatchTerms === DispatchTerms.EX_PORT;
    const receivedQty = isExPort
      ? row.dispatchedQuantity
      : row.receivingQuantity;
    const diffQty = isExPort ? 0 : row.diffInQuantity;
    return {
      dispatchNumber: displayDispatchNumber(row.dispatchNumber),
      date: formatDateDdMmYyyy(
        new Date(row.dispatchDate).toISOString().slice(0, 10),
      ),
      lorryNumber: formatLorryNumber(row.lorryNumber) ?? "—",
      weight: formatDispatchMt(row.dispatchedQuantity),
      vesselName: row.vesselName,
      quality: formatQualityClass(row.qualityClass),
      gstState: row.gstState ?? "—",
      purchasePo: displayOrderDigits(row.purchasePoNumber, "purchase"),
      purchaseInvoice: row.purchaseInvoiceNumber ?? "—",
      vendor: row.vendorName ?? "—",
      purchaseBasic: formatAmount(row.purchaseBasicRate),
      purchaseBasicAmount: formatPurchaseBasicAmount(
        row.dispatchedQuantity,
        row.purchaseBasicRate,
      ),
      purchaseGstAmount: formatPurchaseGstAmount(
        row.dispatchedQuantity,
        row.purchaseBasicRate,
      ),
      purchaseTcsAmount: formatPurchaseTcsAmount(
        row.dispatchedQuantity,
        row.purchaseBasicRate,
      ),
      purchaseTotalAmount: formatPurchaseTotalAmount(
        row.dispatchedQuantity,
        row.purchaseBasicRate,
      ),
      purchaseTotal: formatAmount(row.purchaseTotalRate),
      salePo: displayOrderDigits(row.salePoNumber, "sale"),
      saleInvoice: row.saleInvoiceNumber ?? "—",
      customer: row.customerName ?? "—",
      saleBasic: formatAmount(row.saleBasicRate),
      saleGstAmount: formatSaleGstAmount(
        row.dispatchedQuantity,
        row.saleBasicRate,
      ),
      saleTcsAmount: formatSaleTcsAmount(
        row.dispatchedQuantity,
        row.saleBasicRate,
        row.customerCategory,
      ),
      saleTotalAmount: formatSaleTotalAmount(
        row.dispatchedQuantity,
        row.saleBasicRate,
        row.customerCategory,
      ),
      saleTotal: formatAmount(row.saleTotalRate),
      deliveryTerms: formatDispatchTerms(row.dispatchTerms),
      transporter: row.transporterName ?? "—",
      freightPmt: formatAmount(row.freight),
      freightAmount: formatAmount(row.freightAmount),
      received: formatDispatchMt(receivedQty),
      diff: formatDispatchMt(diffQty),
      purchaseInTally: row.entryInTally ? "Yes" : "—",
      reconciled: row.reconciled ? "Yes" : "—",
    };
  });
}

export async function loadDispatchListData(sp: DispatchSearchParams) {
  const purchaseUpdateStatus: DispatchFilters["purchaseUpdateStatus"] =
    sp.purchaseUpdateStatus === "PENDING" ||
    sp.purchaseUpdateStatus === "RECEIVED"
      ? sp.purchaseUpdateStatus
      : "";
  const saleUpdateStatus: DispatchFilters["saleUpdateStatus"] =
    sp.saleUpdateStatus === "PENDING" || sp.saleUpdateStatus === "RECEIVED"
      ? sp.saleUpdateStatus
      : "";
  const receivedQtyStatus: DispatchFilters["receivedQtyStatus"] =
    sp.receivedQtyStatus === "PENDING" || sp.receivedQtyStatus === "RECEIVED"
      ? sp.receivedQtyStatus
      : "";
  const reconciliationStatus: DispatchFilters["reconciliationStatus"] =
    sp.reconciliationStatus === "PENDING" ||
    sp.reconciliationStatus === "RECONCILED"
      ? sp.reconciliationStatus
      : "";
  const dispatchTerms: DispatchFilters["dispatchTerms"] =
    sp.dispatchTerms === DispatchTerms.FOR ||
    sp.dispatchTerms === DispatchTerms.EX_PORT
      ? sp.dispatchTerms
      : "";
  const coalOrigin: DispatchFilters["coalOrigin"] =
    sp.coalOrigin === "domestic" || sp.coalOrigin === "imported"
      ? sp.coalOrigin
      : "";

  const filters: DispatchFilters = {
    receiptStatus: (sp.receiptStatus as ReceiptStatus) || "",
    purchaseUpdateStatus,
    saleUpdateStatus,
    receivedQtyStatus,
    reconciliationStatus,
    poNumber: sp.poNumber || "",
    purchasePoNumber: sp.purchasePoNumber || "",
    vesselId: sp.vesselId || "",
    vendorId: sp.vendorId || "",
    customerId: sp.customerId || "",
    dispatchTerms,
    dispatchDate: sp.dispatchDate || "",
    dispatchDateStart: sp.dispatchDateStart || "",
    dispatchDateEnd: sp.dispatchDateEnd || "",
    coalOrigin,
    portId: sp.portId || "",
  };

  const [
    dispatches,
    customers,
    vessels,
    balanceOrders,
    balancePurchases,
    ports,
  ] = await Promise.all([
    listDispatches(filters),
    listCustomers({ activeOnly: true }),
    listVessels(),
    listOrdersWithBalance(),
    listPurchaseOrdersWithBalance(),
    listPortOptions(),
  ]);

  const [transporters, suggestedPo, suggestedPurchasePo, suggestedDispatchNumber] =
    await Promise.all([
      listTransporters(),
      suggestNextPoNumber(),
      suggestNextPurchasePoNumber(),
      suggestNextDispatchNumber(),
    ]);

  const customerOpts = customers.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
  }));
  const activeVessels = vessels
    .filter((v) => v.active)
    .map((v) => ({ id: v.id, vesselName: v.vesselName }));

  return {
    filters,
    dispatches,
    customers: customers.map((c) => ({ id: c.id, name: c.name })),
    vessels: vessels.map((v) => ({ id: v.id, vesselName: v.vesselName })),
    ports: ports.map((p) => ({ id: p.id, name: p.name })),
    balanceOrders: balanceOrders.map((o) => ({
      poNumber: o.poNumber,
      balanceOrder: o.balanceOrder?.toString() ?? null,
      rate: o.rate?.toString() ?? null,
      customer: o.customer,
    })),
    balancePurchases: balancePurchases.map((p) => ({
      poNumber: p.poNumber,
      balanceOrder: p.balanceOrder?.toString() ?? null,
      rate: p.rate?.toString() ?? null,
      importer: p.importer,
      vessel: p.vessel,
      qualityClass: p.qualityClass,
    })),
    transporters: transporters.map((t) => ({ id: t.id, name: t.name })),
    suggestedPo,
    suggestedPurchasePo,
    suggestedDispatchNumber,
    customerOpts,
    activeVessels,
  };
}
