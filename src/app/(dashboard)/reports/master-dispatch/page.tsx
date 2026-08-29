import Link from "next/link";
import { listMasterDispatchReport } from "@/lib/actions/reports";
import { listCustomers } from "@/lib/actions/customers";
import { listQualityClasses } from "@/lib/actions/qualities";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatLorryNumber,
  formatQualityClass,
  formatAmount,
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
    { key: "weight", header: "Weight", align: "right" as const },
    { key: "vesselName", header: "Vessel name" },
    { key: "quality", header: "Quality" },
    { key: "gstState", header: "GST state" },
    { key: "received", header: "Received", align: "right" as const },
    { key: "diff", header: "Diff", align: "right" as const },
    { key: "purchasePo", header: "PO no" },
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
    { key: "purchaseInvoice", header: "Purchase invoice" },
    { key: "salePo", header: "SO no" },
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
    { key: "saleInvoice", header: "Sale invoice" },
    { key: "transporter", header: "Transporter name" },
    { key: "freightPmt", header: "Freight PMT", align: "right" as const },
    {
      key: "freightAmount",
      header: "Freight amount",
      align: "right" as const,
    },
  ];

  const exportRows = rows.map((row) => ({
    date: formatDateDdMmYyyy(
      new Date(row.dispatchDate).toISOString().slice(0, 10),
    ),
    lorryNumber: formatLorryNumber(row.lorryNumber) ?? "—",
    weight: formatDispatchMt(row.dispatchedQuantity),
    vesselName: row.vesselName,
    quality: formatQualityClass(row.qualityClass),
    gstState: row.gstState ?? "—",
    received: formatDispatchMt(row.receivingQuantity),
    diff: formatDispatchMt(row.diffInQuantity),
    purchasePo: displayOrderDigits(row.purchasePoNumber, "purchase"),
    vendor: row.vendorName ?? "—",
    purchaseBasic: formatAmount(row.purchaseBasicRate),
    purchaseTotal: formatAmount(row.purchaseTotalRate),
    purchaseInvoice: row.purchaseInvoiceNumber ?? "—",
    salePo: displayOrderDigits(row.salePoNumber, "sale"),
    customer: row.customerName ?? "—",
    saleBasic: formatAmount(row.saleBasicRate),
    saleTotal: formatAmount(row.saleTotalRate),
    saleInvoice: row.saleInvoiceNumber ?? "—",
    transporter: row.transporterName ?? "—",
    freightPmt: formatAmount(row.freight),
    freightAmount: formatAmount(row.freightAmount),
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Dispatch
            <span aria-hidden="true"> · </span>
            Dispatch Register
          </p>
          <h1 className="page-title">Dispatch Register</h1>
          <p className="page-subtitle">
            One row per dispatch — purchase, sale, and freight.
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
          title="Dispatch Register"
          filenameBase="master-dispatch-report"
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll dispatch-register-table-wrap">
        <div className="table-h-scroll"><table className="data report-table dispatch-register-table">
          <thead>
            <tr className="report-group-row">
              <th colSpan={8}>Dispatch</th>
              <th colSpan={5}>Purchase</th>
              <th colSpan={5}>Sale</th>
              <th colSpan={3}>Transport</th>
            </tr>
            <tr>
              <th>Date</th>
              <th>Lorry No</th>
              <th className="cell-num">Weight</th>
              <th>Vessel Name</th>
              <th>Quality</th>
              <th>GST State</th>
              <th className="cell-num">Received</th>
              <th className="cell-num">Diff</th>
              <th>PO No</th>
              <th>Vendor</th>
              <th className="cell-num">Basic Price</th>
              <th className="cell-num">Total Price</th>
              <th>Purchase Invoice</th>
              <th>SO No</th>
              <th className="report-customer-col">Customer Name</th>
              <th className="cell-num">Basic Price</th>
              <th className="cell-num">Total Price</th>
              <th>Sale Invoice</th>
              <th>Transporter Name</th>
              <th className="cell-num">Freight PMT</th>
              <th className="cell-num">Freight Amount</th>
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
                <td className="cell-num">
                  {formatDispatchMt(row.dispatchedQuantity)}
                </td>
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
                  {formatDispatchMt(row.receivingQuantity)}
                </td>
                <td
                  className={
                    row.diffInQuantity != null ? "cell-num" : "cell-center"
                  }
                >
                  {formatDispatchMt(row.diffInQuantity)}
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
                <td className="cell-num">
                  {formatAmount(row.purchaseBasicRate)}
                </td>
                <td className="cell-num">
                  {formatAmount(row.purchaseTotalRate)}
                </td>
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
                <td
                  className={
                    row.customerName
                      ? "report-customer-col"
                      : "report-customer-col cell-center"
                  }
                >
                  {row.customerName ?? "—"}
                </td>
                <td className="cell-num">{formatAmount(row.saleBasicRate)}</td>
                <td className="cell-num">{formatAmount(row.saleTotalRate)}</td>
                <td
                  className={
                    row.saleInvoiceNumber ? undefined : "cell-center"
                  }
                >
                  {row.saleInvoiceNumber ?? "—"}
                </td>
                <td
                  className={
                    row.transporterName ? undefined : "cell-center"
                  }
                >
                  {row.transporterName ?? "—"}
                </td>
                <td className="cell-num">{formatAmount(row.freight)}</td>
                <td className="cell-num">{formatAmount(row.freightAmount)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={21}>No dispatches match filters.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
