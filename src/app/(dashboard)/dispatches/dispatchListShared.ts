import { DispatchTerms, ReceiptStatus } from "@/generated/prisma";
import { listDispatches } from "@/lib/actions/receipts";
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
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatDispatchTerms,
  formatLorryNumber,
  formatQualityClass,
  formatAmount,
  formatRs,
} from "@/lib/domain/format";
import { computeGst, toDecimal } from "@/lib/domain/computations";
import {
  parsePurchaseOrderSequence,
  parseSaleOrderSequence,
} from "@/lib/domain/orderNumbers";
import { PURCHASE_TCS_RATE } from "@/lib/domain/purchaseRate";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";

export type DispatchSearchParams = {
  receiptStatus?: string;
  purchaseUpdateStatus?: string;
  saleUpdateStatus?: string;
  poNumber?: string;
  purchasePoNumber?: string;
  vesselId?: string;
  vendorId?: string;
  customerId?: string;
  dispatchDate?: string;
  dispatchDateStart?: string;
  dispatchDateEnd?: string;
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
  weight: { toString(): string } | number | string,
  basicRate: { toString(): string } | number | string | null | undefined,
): string {
  if (basicRate == null) return "—";
  return formatAmount(toDecimal(weight).mul(basicRate));
}

export function formatPurchaseGstAmount(
  weight: { toString(): string } | number | string,
  basicRate: { toString(): string } | number | string | null | undefined,
): string {
  const gst = computeGst({
    rate: basicRate != null ? toDecimal(basicRate) : null,
    quantity: toDecimal(weight),
  });
  if (gst == null) return "—";
  return formatAmount(gst);
}

export function formatPurchaseTcsAmount(
  weight: { toString(): string } | number | string,
  basicRate: { toString(): string } | number | string | null | undefined,
): string {
  const gst = computeGst({
    rate: basicRate != null ? toDecimal(basicRate) : null,
    quantity: toDecimal(weight),
  });
  if (gst == null || basicRate == null) return "—";
  const tcs = toDecimal(weight).mul(basicRate).plus(gst).mul(PURCHASE_TCS_RATE);
  return formatAmount(tcs);
}

export function formatPurchaseTotalAmount(
  weight: { toString(): string } | number | string,
  basicRate: { toString(): string } | number | string | null | undefined,
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

export const dispatchExportColumns = [
  { key: "dispatchNumber", header: "Dispatch no" },
  { key: "date", header: "Date" },
  { key: "lorryNumber", header: "Lorry no" },
  { key: "weight", header: "Weight", align: "right" as const },
  { key: "vesselName", header: "Vessel name" },
  { key: "quality", header: "Quality" },
  { key: "gstState", header: "GST state" },
  { key: "purchasePo", header: "PO no" },
  { key: "purchaseInvoice", header: "Purchase invoice" },
  { key: "vendor", header: "Vendor" },
  {
    key: "purchaseBasic",
    header: "Purchase basic price",
    align: "right" as const,
  },
  {
    key: "purchaseTotal",
    header: "Purchase total price",
    align: "right" as const,
  },
  { key: "salePo", header: "SO no" },
  { key: "saleInvoice", header: "Sale invoice" },
  { key: "customer", header: "Customer name" },
  {
    key: "saleBasic",
    header: "Sale basic price",
    align: "right" as const,
  },
  {
    key: "saleTotal",
    header: "Sale total price",
    align: "right" as const,
  },
  { key: "deliveryTerms", header: "Delivery terms" },
  { key: "transporter", header: "Transporter name" },
  { key: "freightPmt", header: "Freight PMT", align: "right" as const },
  {
    key: "freightAmount",
    header: "Freight amount",
    align: "right" as const,
  },
  { key: "profit", header: "Profit", align: "right" as const },
  { key: "received", header: "Received", align: "right" as const },
  { key: "diff", header: "Diff", align: "right" as const },
  { key: "purchaseInTally", header: "Purchase in tally" },
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
  columns.splice(purchaseBasicIndex + 2, 0, {
    key: "purchaseGstAmount",
    header: "GST",
    align: "right" as const,
  });
  columns.splice(purchaseBasicIndex + 3, 0, {
    key: "purchaseTcsAmount",
    header: "TCS",
    align: "right" as const,
  });
  columns.splice(purchaseBasicIndex + 4, 0, {
    key: "purchaseTotalAmount",
    header: "Total amount",
    align: "right" as const,
  });
  moveColumn("vendor", "purchaseTotalAmount");
  moveColumn("gstState", "vendor");
  const hiddenKeys = new Set([
    "salePo",
    "saleInvoice",
    "customer",
    "saleBasic",
    "saleTotal",
    "deliveryTerms",
    "transporter",
    "freightPmt",
    "freightAmount",
    "profit",
    "purchaseTotal",
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
  { key: "weight", header: "Weight", align: "right" as const },
  {
    key: "saleBasic",
    header: "Basic price",
    align: "right" as const,
  },
  {
    key: "saleTotal",
    header: "Total price",
    align: "right" as const,
  },
  { key: "customer", header: "Customer" },
  { key: "deliveryTerms", header: "Delivery terms" },
  { key: "transporter", header: "Transporter name" },
  { key: "received", header: "Received", align: "right" as const },
  { key: "diff", header: "Diff", align: "right" as const },
];

export function buildUpdateSaleExportRows(dispatches: DispatchRow[]) {
  return buildDispatchExportRows(dispatches).map((row, index) => ({
    dispatchNumber: row.dispatchNumber,
    date: row.date,
    saleInvoice: row.saleInvoice,
    lorryNumber: row.lorryNumber,
    weight: row.weight,
    saleBasic: formatAmount(dispatches[index].saleBasicRate),
    saleTotal: formatAmount(dispatches[index].saleTotalRate),
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
      purchaseBasic: formatRs(row.purchaseBasicRate),
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
      purchaseTotal: formatRs(row.purchaseTotalRate),
      salePo: displayOrderDigits(row.salePoNumber, "sale"),
      saleInvoice: row.saleInvoiceNumber ?? "—",
      customer: row.customerName ?? "—",
      saleBasic: formatRs(row.saleBasicRate),
      saleTotal: formatRs(row.saleTotalRate),
      deliveryTerms: formatDispatchTerms(row.dispatchTerms),
      transporter: row.transporterName ?? "—",
      freightPmt: formatRs(row.freight),
      freightAmount: formatRs(row.freightAmount),
      profit: formatRs(row.lineProfit),
      received: formatDispatchMt(receivedQty),
      diff: formatDispatchMt(diffQty),
      purchaseInTally: row.entryInTally ? "Yes" : "—",
    };
  });
}

export async function loadDispatchListData(sp: DispatchSearchParams) {
  const purchaseUpdateStatus =
    sp.purchaseUpdateStatus === "PENDING" ||
    sp.purchaseUpdateStatus === "RECEIVED"
      ? sp.purchaseUpdateStatus
      : "";
  const saleUpdateStatus =
    sp.saleUpdateStatus === "PENDING" || sp.saleUpdateStatus === "RECEIVED"
      ? sp.saleUpdateStatus
      : "";

  const filters = {
    receiptStatus: (sp.receiptStatus as ReceiptStatus) || "",
    purchaseUpdateStatus,
    saleUpdateStatus,
    poNumber: sp.poNumber || "",
    purchasePoNumber: sp.purchasePoNumber || "",
    vesselId: sp.vesselId || "",
    vendorId: sp.vendorId || "",
    customerId: sp.customerId || "",
    dispatchDate: sp.dispatchDate || "",
    dispatchDateStart: sp.dispatchDateStart || "",
    dispatchDateEnd: sp.dispatchDateEnd || "",
  };

  const [
    dispatches,
    customers,
    vessels,
    balanceOrders,
    balancePurchases,
  ] = await Promise.all([
    listDispatches(filters),
    listCustomers({ activeOnly: true }),
    listVessels(),
    listOrdersWithBalance(),
    listPurchaseOrdersWithBalance(),
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
