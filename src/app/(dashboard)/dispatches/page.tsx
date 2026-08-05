import Link from "next/link";
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
import { suggestNextPoNumber } from "@/lib/actions/dispatch";
import { CreateDispatchButton } from "@/components/CreateDispatchButton";
import { EditDispatchButton } from "@/components/EditDispatchButton";
import { EditDispatchPurchaseButton } from "@/components/EditDispatchPurchaseButton";
import { EditDispatchSaleButton } from "@/components/EditDispatchSaleButton";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
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

function displayOrderDigits(
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

type SearchParams = Promise<{
  receiptStatus?: string;
  poNumber?: string;
  purchasePoNumber?: string;
  vesselId?: string;
  vendorId?: string;
  customerId?: string;
  dispatchDate?: string;
}>;

export default async function DispatchesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [
    dispatches,
    customers,
    vessels,
    balanceOrders,
    balancePurchases,
    transporters,
    suggestedPo,
    suggestedPurchasePo,
  ] = await Promise.all([
    listDispatches({
      receiptStatus: (sp.receiptStatus as ReceiptStatus) || "",
      poNumber: sp.poNumber || "",
      purchasePoNumber: sp.purchasePoNumber || "",
      vesselId: sp.vesselId || "",
      vendorId: sp.vendorId || "",
      customerId: sp.customerId || "",
      dispatchDate: sp.dispatchDate || "",
    }),
    listCustomers({ activeOnly: true }),
    listVessels(),
    listOrdersWithBalance(),
    listPurchaseOrdersWithBalance(),
    listTransporters(),
    suggestNextPoNumber(),
    suggestNextPurchasePoNumber(),
  ]);

  const customerOpts = customers.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
  }));
  const activeVessels = vessels.filter((v) => v.active);

  const exportColumns = [
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

  const exportRows = dispatches.map((row) => {
    const isExPort = row.dispatchTerms === DispatchTerms.EX_PORT;
    const receivedQty = isExPort
      ? row.dispatchedQuantity
      : row.receivingQuantity;
    const diffQty = isExPort ? 0 : row.diffInQuantity;
    return {
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispatches</h1>
          <p className="page-subtitle">
            All truck movements, receipts, and quantity diffs.
          </p>
        </div>
        <CreateDispatchButton
          orders={balanceOrders.map((o) => ({
            poNumber: o.poNumber,
            balanceOrder: o.balanceOrder?.toString() ?? null,
            rate: o.rate?.toString() ?? null,
            customer: o.customer,
          }))}
          purchaseOrders={balancePurchases.map((p) => ({
            poNumber: p.poNumber,
            balanceOrder: p.balanceOrder?.toString() ?? null,
            rate: p.rate?.toString() ?? null,
            importer: p.importer,
            vessel: p.vessel,
            qualityClass: p.qualityClass,
          }))}
          transporters={transporters.map((t) => ({ id: t.id, name: t.name }))}
          customers={customerOpts}
          vessels={activeVessels.map((v) => ({
            id: v.id,
            vesselName: v.vesselName,
          }))}
          suggestedPo={suggestedPo}
          suggestedPurchasePo={suggestedPurchasePo}
        />
      </div>

      <form className="filters" method="get">
        <label>
          Receipt status
          <select
            name="receiptStatus"
            defaultValue={sp.receiptStatus ?? ""}
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="RECEIVED">RECEIVED</option>
          </select>
        </label>
        <label>
          Sale PO
          <input
            name="poNumber"
            defaultValue={sp.poNumber ?? ""}
            placeholder="Search sale PO"
          />
        </label>
        <label>
          Purchase PO
          <input
            name="purchasePoNumber"
            defaultValue={sp.purchasePoNumber ?? ""}
            placeholder="Search purchase PO"
          />
        </label>
        <label>
          Dispatch date
          <input
            type="date"
            name="dispatchDate"
            defaultValue={sp.dispatchDate ?? ""}
          />
        </label>
        <label>
          Vessel
          <select name="vesselId" defaultValue={sp.vesselId ?? ""}>
            <option value="">All</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vesselName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vendor
          <select name="vendorId" defaultValue={sp.vendorId ?? ""}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Customer
          <select name="customerId" defaultValue={sp.customerId ?? ""}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        <TableDownloadButtons
          title="Dispatches"
          filenameBase="dispatches"
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll">
        <table className="data report-table report-table-dispatches">
          <thead>
            <tr className="report-group-row">
              <th colSpan={6}>Dispatch</th>
              <th colSpan={5}>Purchase</th>
              <th colSpan={5}>Sale</th>
              <th colSpan={4}>Transport</th>
              <th colSpan={1}>Margin</th>
              <th colSpan={3}>Status</th>
              <th colSpan={1}></th>
            </tr>
            <tr>
              <th>Date</th>
              <th>Lorry no</th>
              <th className="cell-num">Weight (MT)</th>
              <th>Vessel name</th>
              <th>Quality</th>
              <th>GST state</th>
              <th>PO no</th>
              <th>Purchase invoice</th>
              <th>Vendor</th>
              <th className="cell-num">Basic price (Rs)</th>
              <th className="cell-num">Total price (Rs)</th>
              <th>SO no</th>
              <th>Sale invoice</th>
              <th>Customer name</th>
              <th className="cell-num">Basic price (Rs)</th>
              <th className="cell-num">Total price (Rs)</th>
              <th>Delivery terms</th>
              <th>Transporter name</th>
              <th className="cell-num">Freight PMT (Rs)</th>
              <th className="cell-num">Freight amount (Rs)</th>
              <th className="cell-num">Profit (Rs)</th>
              <th className="cell-num">Received (MT)</th>
              <th className="cell-num">Diff (MT)</th>
              <th className="cell-center">Purchase in tally</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((row) => {
              const isExPort = row.dispatchTerms === DispatchTerms.EX_PORT;
              const receivedQty = isExPort
                ? row.dispatchedQuantity
                : row.receivingQuantity;
              const diffQty = isExPort ? 0 : row.diffInQuantity;
              return (
              <tr key={row.id}>
                <td>
                  {formatDateDdMmYyyy(
                    new Date(row.dispatchDate).toISOString().slice(0, 10),
                  )}
                </td>
                <td className={row.lorryNumber ? undefined : "cell-center"}>
                  {formatLorryNumber(row.lorryNumber) ?? "—"}
                </td>
                <td className="cell-num">
                  {formatDispatchMt(row.dispatchedQuantity)}
                </td>
                <td>{row.vesselName}</td>
                <td>{formatQualityClass(row.qualityClass)}</td>
                <td className={row.gstState ? undefined : "cell-center"}>
                  {row.gstState ?? "—"}
                </td>
                <td>
                  {row.purchaseOrderId ? (
                    <Link
                      href={`/purchase-orders/${row.purchaseOrderId}`}
                      className="font-medium"
                    >
                      {displayOrderDigits(row.purchasePoNumber, "purchase")}
                    </Link>
                  ) : (
                    displayOrderDigits(row.purchasePoNumber, "purchase")
                  )}
                </td>
                <td
                  className={
                    row.purchaseInvoiceNumber ? undefined : "cell-center"
                  }
                >
                  {row.purchaseInvoiceNumber ?? "—"}
                </td>
                <td className={row.vendorName ? undefined : "cell-center"}>
                  {row.vendorName ?? "—"}
                </td>
                <td className="cell-num">{formatRs(row.purchaseBasicRate)}</td>
                <td className="cell-num">{formatRs(row.purchaseTotalRate)}</td>
                <td>
                  {row.orderId ? (
                    <Link
                      href={`/orders/${row.orderId}`}
                      className="font-medium"
                    >
                      {displayOrderDigits(row.salePoNumber, "sale")}
                    </Link>
                  ) : (
                    displayOrderDigits(row.salePoNumber, "sale")
                  )}
                </td>
                <td
                  className={row.saleInvoiceNumber ? undefined : "cell-center"}
                >
                  {row.saleInvoiceNumber ?? "—"}
                </td>
                <td className={row.customerName ? undefined : "cell-center"}>
                  {row.customerName ?? "—"}
                </td>
                <td className="cell-num">{formatRs(row.saleBasicRate)}</td>
                <td className="cell-num">{formatRs(row.saleTotalRate)}</td>
                <td>{formatDispatchTerms(row.dispatchTerms)}</td>
                <td
                  className={row.transporterName ? undefined : "cell-center"}
                >
                  {row.transporterName ?? "—"}
                </td>
                <td className="cell-num">{formatRs(row.freight)}</td>
                <td className="cell-num">{formatRs(row.freightAmount)}</td>
                <td className="cell-num">{formatRs(row.lineProfit)}</td>
                <td
                  className={
                    receivedQty != null ? "cell-num" : "cell-center"
                  }
                >
                  {formatDispatchMt(receivedQty)}
                </td>
                <td
                  className={
                    diffQty != null ? "cell-num" : "cell-center"
                  }
                >
                  {formatDispatchMt(diffQty)}
                </td>
                <td className="cell-center">
                  {row.entryInTally ? "Yes" : "—"}
                </td>
                <td>
                  <div className="dispatch-edit-actions">
                    <EditDispatchButton
                      dispatchId={row.id}
                      dispatchDate={new Date(row.dispatchDate)
                        .toISOString()
                        .slice(0, 10)}
                      lorryNumber={row.lorryNumber}
                      dispatchedQuantity={row.dispatchedQuantity.toString()}
                      purchasePoNumber={row.purchasePoNumber}
                      salePoNumber={row.salePoNumber}
                      dispatchTerms={row.dispatchTerms}
                      transporterId={row.transporterId}
                      freight={row.freight?.toString() ?? null}
                      saleInvoiceNumber={row.saleInvoiceNumber}
                      purchaseInvoiceNumber={row.purchaseInvoiceNumber}
                      receivingQuantity={
                        row.receivingQuantity?.toString() ?? null
                      }
                      entryInTally={row.entryInTally}
                      orders={balanceOrders.map((o) => ({
                        poNumber: o.poNumber,
                        balanceOrder: o.balanceOrder?.toString() ?? null,
                        customerName: o.customer?.name ?? null,
                      }))}
                      purchaseOrders={balancePurchases.map((p) => ({
                        poNumber: p.poNumber,
                        balanceOrder: p.balanceOrder?.toString() ?? null,
                        vendorName: p.importer?.name ?? null,
                        vesselName: p.vessel?.vesselName ?? null,
                      }))}
                      transporters={transporters.map((t) => ({
                        id: t.id,
                        name: t.name,
                      }))}
                    />
                    <EditDispatchPurchaseButton
                      dispatchId={row.id}
                      purchaseInvoiceNumber={row.purchaseInvoiceNumber}
                      entryInTally={row.entryInTally}
                    />
                    <EditDispatchSaleButton
                      dispatchId={row.id}
                      saleInvoiceNumber={row.saleInvoiceNumber}
                      dispatchedQuantity={row.dispatchedQuantity.toString()}
                      receivingQuantity={
                        row.receivingQuantity?.toString() ?? null
                      }
                      dispatchTerms={row.dispatchTerms}
                    />
                  </div>
                </td>
              </tr>
              );
            })}
            {dispatches.length === 0 && (
              <tr>
                <td colSpan={25}>No dispatches match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
