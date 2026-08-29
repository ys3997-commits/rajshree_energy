import Link from "next/link";
import { listMasterDispatchReport } from "@/lib/actions/reports";
import { listCustomers } from "@/lib/actions/customers";
import { listQualityClasses } from "@/lib/actions/qualities";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { toDecimal, type DecimalLike } from "@/lib/domain/computations";
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatLorryNumber,
  formatQualityClass,
  formatAmount,
} from "@/lib/domain/format";

function profitPmtValue(
  profit: DecimalLike | null | undefined,
  weight: DecimalLike | null | undefined,
) {
  if (profit == null || weight == null) return null;
  const qty = toDecimal(weight);
  if (qty.eq(0)) return null;
  return toDecimal(profit).div(qty);
}

function formatProfitPmt(
  profit: DecimalLike | null | undefined,
  weight: DecimalLike | null | undefined,
): string {
  const pmt = profitPmtValue(profit, weight);
  return pmt == null ? "—" : formatAmount(pmt);
}

function formatProfitPercent(
  profit: DecimalLike | null | undefined,
  weight: DecimalLike | null | undefined,
  purchaseBasic: DecimalLike | null | undefined,
  freightPmt: DecimalLike | null | undefined,
): string {
  const pmt = profitPmtValue(profit, weight);
  if (pmt == null || purchaseBasic == null) return "—";
  const cost = toDecimal(purchaseBasic).plus(
    freightPmt == null ? 0 : toDecimal(freightPmt),
  );
  if (cost.eq(0)) return "—";
  return `${pmt.mul(100).div(cost).toFixed(2)}%`;
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
    { key: "vendor", header: "Vendor" },
    {
      key: "purchaseBasic",
      header: "Purchase basic price",
      align: "right" as const,
    },
    { key: "customer", header: "Customer name" },
    {
      key: "saleBasic",
      header: "Sale basic price",
      align: "right" as const,
    },
    { key: "transporter", header: "Transporter name" },
    { key: "freightPmt", header: "Freight PMT", align: "right" as const },
    {
      key: "freightAmount",
      header: "Freight amount",
      align: "right" as const,
    },
    { key: "profit", header: "Profit", align: "right" as const },
    { key: "profitPmt", header: "Profit PMT", align: "right" as const },
    { key: "profitPercent", header: "Profit %", align: "right" as const },
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
    vendor: row.vendorName ?? "—",
    purchaseBasic: formatAmount(row.purchaseBasicRate),
    customer: row.customerName ?? "—",
    saleBasic: formatAmount(row.saleBasicRate),
    transporter: row.transporterName ?? "—",
    freightPmt: formatAmount(row.freight),
    freightAmount: formatAmount(row.freightAmount),
    profit: formatAmount(row.lineProfit),
    profitPmt: formatProfitPmt(row.lineProfit, row.dispatchedQuantity),
    profitPercent: formatProfitPercent(
      row.lineProfit,
      row.dispatchedQuantity,
      row.purchaseBasicRate,
      row.freight,
    ),
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Analysis
            <span aria-hidden="true"> · </span>
            Dispatch Analysis
          </p>
          <h1 className="page-title">Dispatch Analysis</h1>
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
          title="Dispatch Analysis"
          filenameBase="master-dispatch-report"
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div className="table-wrap table-wrap-scroll dispatch-analysis-table-wrap">
        <div className="table-h-scroll"><table className="data report-table dispatch-analysis-table">
          <thead>
            <tr className="report-group-row">
              <th colSpan={6}>Dispatch</th>
              <th colSpan={2}>Purchase</th>
              <th colSpan={2}>Sale</th>
              <th colSpan={3}>Transport</th>
              <th colSpan={3}>Margin</th>
            </tr>
            <tr>
              <th>Date</th>
              <th>Lorry No</th>
              <th className="cell-num">Weight</th>
              <th>Vessel Name</th>
              <th>Quality</th>
              <th>GST State</th>
              <th>Vendor</th>
              <th className="cell-num">Basic Price</th>
              <th className="report-customer-col">Customer Name</th>
              <th className="cell-num">Basic Price</th>
              <th>Transporter Name</th>
              <th className="cell-num">Freight PMT</th>
              <th className="cell-num">Freight Amount</th>
              <th className="cell-num">Profit</th>
              <th className="cell-num">Profit PMT</th>
              <th className="cell-num">Profit %</th>
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
                <td className={row.vendorName ? undefined : "cell-center"}>
                  {row.vendorName ?? "—"}
                </td>
                <td className="cell-num">
                  {formatAmount(row.purchaseBasicRate)}
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
                <td
                  className={
                    row.transporterName ? undefined : "cell-center"
                  }
                >
                  {row.transporterName ?? "—"}
                </td>
                <td className="cell-num">{formatAmount(row.freight)}</td>
                <td className="cell-num">{formatAmount(row.freightAmount)}</td>
                <td className="cell-num">{formatAmount(row.lineProfit)}</td>
                <td className="cell-num">
                  {formatProfitPmt(row.lineProfit, row.dispatchedQuantity)}
                </td>
                <td className="cell-num">
                  {formatProfitPercent(
                    row.lineProfit,
                    row.dispatchedQuantity,
                    row.purchaseBasicRate,
                    row.freight,
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={16}>No dispatches match filters.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
