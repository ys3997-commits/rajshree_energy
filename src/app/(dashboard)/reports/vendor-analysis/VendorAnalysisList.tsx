"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { CustomerAnalysisListRow } from "@/lib/actions/reports";
import { formatAmount, formatSaleOrderMt } from "@/lib/domain/format";

type SortKey = "name" | "totalQuantity" | "due" | "totalProfit" | "marginPmt";
type SortDir = "asc" | "desc";

const NUMERIC_SORT_KEYS: ReadonlySet<SortKey> = new Set([
  "totalQuantity",
  "due",
  "totalProfit",
  "marginPmt",
]);

function numericValue(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

function vendorDetailHref(
  id: string,
  dateFrom: string,
  dateTo: string,
): string {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const qs = params.toString();
  return `/reports/vendor-analysis/${id}${qs ? `?${qs}` : ""}`;
}

export function VendorAnalysisList({
  vendors,
  dateFrom,
  dateTo,
}: {
  vendors: CustomerAnalysisListRow[];
  dateFrom: string;
  dateTo: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(NUMERIC_SORT_KEYS.has(key) ? "desc" : "asc");
  }

  const summary = useMemo(() => {
    let totalQty = 0;
    let totalDue = 0;
    let totalMargin: number | null = null;
    for (const v of vendors) {
      totalQty += numericValue(v.totalQuantity);
      totalDue += numericValue(v.due);
      if (v.totalProfit != null) {
        const p = numericValue(v.totalProfit);
        totalMargin = totalMargin == null ? p : totalMargin + p;
      }
    }
    const marginPmt =
      totalMargin != null && totalQty > 0
        ? (totalMargin / totalQty).toFixed(2)
        : null;
    return {
      totalQuantity: totalQty.toString(),
      totalDue: totalDue.toFixed(2),
      totalMargin: totalMargin?.toFixed(2) ?? null,
      marginPmt,
    };
  }, [vendors]);

  const filtered = useMemo(() => {
    if (!sortKey) return vendors;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...vendors].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      return (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir;
    });
  }, [vendors, sortKey, sortDir]);

  const exportColumns = [
    { key: "vendor", header: "Vendor" },
    {
      key: "totalQuantity",
      header: "Total quantities",
      align: "right" as const,
    },
    { key: "totalDue", header: "Total due", align: "right" as const },
    { key: "totalMargin", header: "Total Margin", align: "right" as const },
    { key: "marginPmt", header: "Margin PMT", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((v) => ({
        vendor: v.name,
        totalQuantity: formatSaleOrderMt(v.totalQuantity),
        totalDue: formatAmount(v.due),
        totalMargin: formatAmount(v.totalProfit),
        marginPmt: formatAmount(v.marginPmt),
      })),
    [filtered],
  );

  return (
    <div className="customer-analysis-list">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            Reports
          </p>
          <h1 className="page-title">Vendor analysis</h1>
          <p className="page-subtitle">
            Pick a vendor to see purchase-side volume, balance, and margin.
          </p>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Total quantities</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(summary.totalQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Total due</span>
            <span className="detail-stat-value">
              {formatAmount(summary.totalDue)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Total Margin</span>
            <span className="detail-stat-value">
              {formatAmount(summary.totalMargin)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Margin PMT</span>
            <span className="detail-stat-value">
              {formatAmount(summary.marginPmt)}
            </span>
          </div>
        </div>
      </div>

      <div className="filters">
        <form className="sale-analysis-date-form" method="get">
          <label>
            Start date
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom}
              max={dateTo || undefined}
            />
          </label>
          <label>
            End date
            <input
              type="date"
              name="dateTo"
              defaultValue={dateTo}
              min={dateFrom || undefined}
            />
          </label>
          <button type="submit" className="btn">
            Apply dates
          </button>
          {(dateFrom || dateTo) && (
            <Link href="/reports/vendor-analysis" className="btn-link">
              Clear
            </Link>
          )}
        </form>
        <TableDownloadButtons
          title="Vendor analysis"
          filenameBase="vendor-analysis"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>
      <p className="filter-hint">
        Dates filter total quantities, total margin, and margin PMT. Total
        margin is dispatch profit plus discount received minus discount paid.
        Total due is as of the end date when set, otherwise the current
        outstanding.
      </p>

      {filtered.length === 0 ? (
        <p className="home-empty">No vendors found.</p>
      ) : (
        <div className="table-wrap">
          <div className="table-h-scroll"><table className="data">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("name")}
                  >
                    Vendor
                    {sortIndicator(sortKey === "name", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("totalQuantity")}
                  >
                    Total quantities
                    {sortIndicator(sortKey === "totalQuantity", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("due")}
                  >
                    Total due
                    {sortIndicator(sortKey === "due", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("totalProfit")}
                  >
                    Total Margin
                    {sortIndicator(sortKey === "totalProfit", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("marginPmt")}
                  >
                    Margin PMT
                    {sortIndicator(sortKey === "marginPmt", sortDir)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  className={
                    v.active
                      ? "ca-list-row"
                      : "ca-list-row customer-row-inactive"
                  }
                >
                  <td>
                    <Link
                      href={vendorDetailHref(v.id, dateFrom, dateTo)}
                      className="ca-list-link"
                    >
                      {v.name}
                    </Link>
                  </td>
                  <td className="cell-num">
                    {formatSaleOrderMt(v.totalQuantity)}
                  </td>
                  <td className="cell-num">{formatAmount(v.due)}</td>
                  <td className="cell-num">{formatAmount(v.totalProfit)}</td>
                  <td className="cell-num">{formatAmount(v.marginPmt)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
