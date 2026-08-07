import Link from "next/link";
import { listMasterDispatchReport } from "@/lib/actions/reports";
import { listCustomers } from "@/lib/actions/customers";
import { listQualityClasses } from "@/lib/actions/qualities";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import {
  formatDateDdMmYyyy,
  formatIndianNumber,
  formatLorryNumber,
  formatMt,
  formatQualityClass,
} from "@/lib/domain/format";
import {
  parsePurchaseOrderSequence,
  parseSaleOrderSequence,
} from "@/lib/domain/orderNumbers";

function formatWeightMt(
  value: { toString(): string } | number | string | null | undefined,
): string {
  return formatIndianNumber(value, 2);
}

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
  customerId?: string;
  transporterId?: string;
  vesselId?: string;
  vendorId?: string;
  qualityClassId?: string;
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function MasterDispatchReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = {
    customerId: sp.customerId || "",
    transporterId: sp.transporterId || "",
    vesselId: sp.vesselId || "",
    vendorId: sp.vendorId || "",
    qualityClassId: sp.qualityClassId || "",
    dateFrom: sp.dateFrom || "",
    dateTo: sp.dateTo || "",
  };

  const [rows, customers, transporters, vessels, qualityClasses] =
    await Promise.all([
      listMasterDispatchReport(filters),
      listCustomers({ activeOnly: true }),
      listTransporters(),
      listVessels(),
      listQualityClasses(),
    ]);

  const exportColumns = [
    { key: "date", header: "Date" },
    { key: "lorryNumber", header: "Lorry no" },
    { key: "weight", header: "Weight (MT)", align: "right" as const },
    { key: "vesselName", header: "Vessel name" },
    { key: "quality", header: "Quality" },
    { key: "gstState", header: "GST state" },
    { key: "received", header: "Received (MT)", align: "right" as const },
    { key: "diff", header: "Diff (MT)", align: "right" as const },
    { key: "purchasePo", header: "PO no" },
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
    { key: "purchaseInvoice", header: "Purchase invoice" },
    { key: "salePo", header: "SO no" },
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
    { key: "saleInvoice", header: "Sale invoice" },
    { key: "transporter", header: "Transporter name" },
    { key: "freightPmt", header: "Freight PMT (Rs)", align: "right" as const },
    {
      key: "freightAmount",
      header: "Freight amount (Rs)",
      align: "right" as const,
    },
    { key: "profit", header: "Profit (Rs)", align: "right" as const },
  ];

  const exportRows = rows.map((row) => ({
    date: formatDateDdMmYyyy(
      new Date(row.dispatchDate).toISOString().slice(0, 10),
    ),
    lorryNumber: formatLorryNumber(row.lorryNumber) ?? "—",
    weight: formatWeightMt(row.dispatchedQuantity),
    vesselName: row.vesselName,
    quality: formatQualityClass(row.qualityClass),
    gstState: row.gstState ?? "—",
    received: formatWeightMt(row.receivingQuantity),
    diff: formatWeightMt(row.diffInQuantity),
    purchasePo: displayOrderDigits(row.purchasePoNumber, "purchase"),
    vendor: row.vendorName ?? "—",
    purchaseBasic: formatMt(row.purchaseBasicRate),
    purchaseTotal: formatMt(row.purchaseTotalRate),
    purchaseInvoice: row.purchaseInvoiceNumber ?? "—",
    salePo: displayOrderDigits(row.salePoNumber, "sale"),
    customer: row.customerName ?? "—",
    saleBasic: formatMt(row.saleBasicRate),
    saleTotal: formatMt(row.saleTotalRate),
    saleInvoice: row.saleInvoiceNumber ?? "—",
    transporter: row.transporterName ?? "—",
    freightPmt: formatMt(row.freight),
    freightAmount: formatMt(row.freightAmount),
    profit: formatMt(row.lineProfit),
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            Reports
          </p>
          <h1 className="page-title">Master dispatch report</h1>
          <p className="page-subtitle">
            One row per dispatch — purchase, sale, freight, and profit on basic
            rates.
          </p>
        </div>
      </div>

      <form className="filters" method="get">
        <label>
          Customer
          <select name="customerId" defaultValue={filters.customerId}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vendor
          <select name="vendorId" defaultValue={filters.vendorId}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Transporter
          <select name="transporterId" defaultValue={filters.transporterId}>
            <option value="">All</option>
            {transporters.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vessel
          <select name="vesselId" defaultValue={filters.vesselId}>
            <option value="">All</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vesselName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quality
          <select name="qualityClassId" defaultValue={filters.qualityClassId}>
            <option value="">All</option>
            {qualityClasses.map((qc) => (
              <option key={qc.id} value={qc.id}>
                {formatQualityClass(qc)}
              </option>
            ))}
          </select>
        </label>
        <label>
          From date
          <input
            type="date"
            name="dateFrom"
            defaultValue={filters.dateFrom}
          />
        </label>
        <label>
          To date
          <input type="date" name="dateTo" defaultValue={filters.dateTo} />
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        <TableDownloadButtons
          title="Master dispatch report"
          filenameBase="master-dispatch-report"
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll">
        <table className="data report-table">
          <thead>
            <tr className="report-group-row">
              <th colSpan={8}>Dispatch</th>
              <th colSpan={5}>Purchase</th>
              <th colSpan={5}>Sale</th>
              <th colSpan={3}>Transport</th>
              <th colSpan={1}>Margin</th>
            </tr>
            <tr>
              <th>Date</th>
              <th>Lorry no</th>
              <th className="cell-num">Weight (MT)</th>
              <th>Vessel name</th>
              <th>Quality</th>
              <th>GST state</th>
              <th className="cell-num">Received (MT)</th>
              <th className="cell-num">Diff (MT)</th>
              <th>PO no</th>
              <th>Vendor</th>
              <th className="cell-num">Basic price (Rs)</th>
              <th className="cell-num">Total price (Rs)</th>
              <th>Purchase invoice</th>
              <th>SO no</th>
              <th>Customer name</th>
              <th className="cell-num">Basic price (Rs)</th>
              <th className="cell-num">Total price (Rs)</th>
              <th>Sale invoice</th>
              <th>Transporter name</th>
              <th className="cell-num">Freight PMT (Rs)</th>
              <th className="cell-num">Freight amount (Rs)</th>
              <th className="cell-num">Profit (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {formatDateDdMmYyyy(
                    new Date(row.dispatchDate).toISOString().slice(0, 10),
                  )}
                </td>
                <td className={row.lorryNumber ? undefined : "cell-center"}>
                  {formatLorryNumber(row.lorryNumber) ?? "—"}
                </td>
                <td className="cell-num">{formatWeightMt(row.dispatchedQuantity)}</td>
                <td>{row.vesselName}</td>
                <td>{formatQualityClass(row.qualityClass)}</td>
                <td className={row.gstState ? undefined : "cell-center"}>
                  {row.gstState ?? "—"}
                </td>
                <td
                  className={
                    row.receivingQuantity != null ? "cell-num" : "cell-center"
                  }
                >
                  {formatWeightMt(row.receivingQuantity)}
                </td>
                <td
                  className={
                    row.diffInQuantity != null ? "cell-num" : "cell-center"
                  }
                >
                  {formatWeightMt(row.diffInQuantity)}
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
                <td className={row.vendorName ? undefined : "cell-center"}>
                  {row.vendorName ?? "—"}
                </td>
                <td className="cell-num">{formatMt(row.purchaseBasicRate)}</td>
                <td className="cell-num">{formatMt(row.purchaseTotalRate)}</td>
                <td
                  className={
                    row.purchaseInvoiceNumber ? undefined : "cell-center"
                  }
                >
                  {row.purchaseInvoiceNumber ?? "—"}
                </td>
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
                <td className={row.customerName ? undefined : "cell-center"}>
                  {row.customerName ?? "—"}
                </td>
                <td className="cell-num">{formatMt(row.saleBasicRate)}</td>
                <td className="cell-num">{formatMt(row.saleTotalRate)}</td>
                <td
                  className={row.saleInvoiceNumber ? undefined : "cell-center"}
                >
                  {row.saleInvoiceNumber ?? "—"}
                </td>
                <td
                  className={row.transporterName ? undefined : "cell-center"}
                >
                  {row.transporterName ?? "—"}
                </td>
                <td className="cell-num">{formatMt(row.freight)}</td>
                <td className="cell-num">{formatMt(row.freightAmount)}</td>
                <td className="cell-num">{formatMt(row.lineProfit)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={22}>No dispatches match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
