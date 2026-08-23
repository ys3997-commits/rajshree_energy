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
  formatRs,
} from "@/lib/domain/format";
import {
  parsePurchaseOrderSequence,
  parseSaleOrderSequence,
} from "@/lib/domain/orderNumbers";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";

export type DispatchSearchParams = {
  receiptStatus?: string;
  poNumber?: string;
  purchasePoNumber?: string;
  vesselId?: string;
  vendorId?: string;
  customerId?: string;
  dispatchDate?: string;
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

export const dispatchExportColumns = [
  { key: "dispatchNumber", header: "Dispatch no" },
  { key: "date", header: "Date" },
  { key: "lorryNumber", header: "Lorry no" },
  { key: "weight", header: "Weight (MT)", align: "right" as const },
  { key: "vesselName", header: "Vessel name" },
  { key: "quality", header: "Quality" },
  { key: "gstState", header: "GST state" },
  { key: "purchasePo", header: "PO no" },
  { key: "purchaseInvoice", header: "Purchase invoice" },
  { key: "vendor", header: "Vendor" },
  {
    key: "purchaseBasic",
    header: "Purchase basic price (Rs)",
    align: "right" as const,
  },
  {
    key: "purchaseTotal",
    header: "Purchase total price (Rs)",
    align: "right" as const,
  },
  { key: "salePo", header: "SO no" },
  { key: "saleInvoice", header: "Sale invoice" },
  { key: "customer", header: "Customer name" },
  {
    key: "saleBasic",
    header: "Sale basic price (Rs)",
    align: "right" as const,
  },
  {
    key: "saleTotal",
    header: "Sale total price (Rs)",
    align: "right" as const,
  },
  { key: "deliveryTerms", header: "Delivery terms" },
  { key: "transporter", header: "Transporter name" },
  { key: "freightPmt", header: "Freight PMT (Rs)", align: "right" as const },
  {
    key: "freightAmount",
    header: "Freight amount (Rs)",
    align: "right" as const,
  },
  { key: "profit", header: "Profit (Rs)", align: "right" as const },
  { key: "received", header: "Received (MT)", align: "right" as const },
  { key: "diff", header: "Diff (MT)", align: "right" as const },
  { key: "purchaseInTally", header: "Purchase in tally" },
];

export type DispatchRow = Awaited<ReturnType<typeof listDispatches>>[number];

export type DispatchListData = Awaited<ReturnType<typeof loadDispatchListData>>;

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
  const filters = {
    receiptStatus: (sp.receiptStatus as ReceiptStatus) || "",
    poNumber: sp.poNumber || "",
    purchasePoNumber: sp.purchasePoNumber || "",
    vesselId: sp.vesselId || "",
    vendorId: sp.vendorId || "",
    customerId: sp.customerId || "",
    dispatchDate: sp.dispatchDate || "",
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
