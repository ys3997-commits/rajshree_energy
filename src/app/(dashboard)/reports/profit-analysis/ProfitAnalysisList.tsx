"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { ProfitAnalysisRow } from "@/lib/actions/reports";
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatRs,
} from "@/lib/domain/format";

type SortKey =
  | "date"
  | "domesticQuantity"
  | "domesticProfit"
  | "importedQuantity"
  | "importedProfit"
  | "totalQuantity"
  | "totalProfit";
type SortDir = "asc" | "desc";

function numericValue(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

export function ProfitAnalysisList({
  rows,
  dateFrom,
  dateTo,
}: {
  rows: ProfitAnalysisRow[];
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
    setSortDir("desc");
  }

  const summary = useMemo(() => {
    let domesticQty = 0;
    let importedQty = 0;
    let domesticProfit = 0;
    let importedProfit = 0;
    for (const row of rows) {
      domesticQty += numericValue(row.domesticQuantity);
      importedQty += numericValue(row.importedQuantity);
      domesticProfit += numericValue(row.domesticProfit);
      importedProfit += numericValue(row.importedProfit);
    }
    return {
      domesticQuantity: domesticQty.toString(),
      importedQuantity: importedQty.toString(),
      domesticProfit: domesticProfit.toFixed(2),
      importedProfit: importedProfit.toFixed(2),
      totalQuantity: (domesticQty + importedQty).toString(),
      totalProfit: (domesticProfit + importedProfit).toFixed(2),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    if (!sortKey) return rows;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === "date") {
        return a.date.localeCompare(b.date) * dir;
      }
      return (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir;
    });
  }, [rows, sortKey, sortDir]);

  const exportColumns = [
    { key: "date", header: "Date" },
    {
      key: "totalQuantity",
      header: "Total quantity",
      align: "right" as const,
    },
    {
      key: "totalProfit",
      header: "Total profit",
      align: "right" as const,
    },
    {
      key: "domesticQuantity",
      header: "Domestic quantity",
      align: "right" as const,
    },
    {
      key: "domesticProfit",
      header: "Domestic profit",
      align: "right" as const,
    },
    {
      key: "importedQuantity",
      header: "Imported quantity",
      align: "right" as const,
    },
    {
      key: "importedProfit",
      header: "Imported profit",
      align: "right" as const,
    },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((row) => ({
        date: formatDateDdMmYyyy(row.date),
        domesticQuantity: formatDispatchMt(row.domesticQuantity),
        domesticProfit: formatRs(row.domesticProfit),
        importedQuantity: formatDispatchMt(row.importedQuantity),
        importedProfit: formatRs(row.importedProfit),
        totalQuantity: formatDispatchMt(row.totalQuantity),
        totalProfit: formatRs(row.totalProfit),
      })),
    [filtered],
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            Reports
          </p>
          <h1 className="page-title">Profit analysis</h1>
          <p className="page-subtitle">
            Day-wise dispatched quantity and basic-rate profit, split by
            domestic and imported quality.
          </p>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Total quantity</span>
            <span className="detail-stat-value">
              {formatDispatchMt(summary.totalQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Total profit</span>
            <span className="detail-stat-value">
              {formatRs(summary.totalProfit)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Domestic quantity</span>
            <span className="detail-stat-value">
              {formatDispatchMt(summary.domesticQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Domestic profit</span>
            <span className="detail-stat-value">
              {formatRs(summary.domesticProfit)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Imported quantity</span>
            <span className="detail-stat-value">
              {formatDispatchMt(summary.importedQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Imported profit</span>
            <span className="detail-stat-value">
              {formatRs(summary.importedProfit)}
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
            <Link href="/reports/profit-analysis" className="btn-link">
              Clear
            </Link>
          )}
        </form>
        <TableDownloadButtons
          title="Profit analysis"
          filenameBase="profit-analysis"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>
      <p className="filter-hint">
        Dates group dispatches by day. Profit uses basic sale minus basic
        purchase (FOR subtracts freight). Domestic / imported follows quality
        class (purchase, then vessel, then sale order).
      </p>

      {filtered.length === 0 ? (
        <p className="home-empty">No dispatches match your filter.</p>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("date")}
                  >
                    Date
                    {sortIndicator(sortKey === "date", sortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("totalQuantity")}
                  >
                    Total quantity
                    {sortIndicator(sortKey === "totalQuantity", sortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("totalProfit")}
                  >
                    Total profit
                    {sortIndicator(sortKey === "totalProfit", sortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("domesticQuantity")}
                  >
                    Domestic quantity
                    {sortIndicator(sortKey === "domesticQuantity", sortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("domesticProfit")}
                  >
                    Domestic profit
                    {sortIndicator(sortKey === "domesticProfit", sortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("importedQuantity")}
                  >
                    Imported quantity
                    {sortIndicator(sortKey === "importedQuantity", sortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("importedProfit")}
                  >
                    Imported profit
                    {sortIndicator(sortKey === "importedProfit", sortDir)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.date}>
                  <td>{formatDateDdMmYyyy(row.date)}</td>
                  <td className="num">
                    {formatDispatchMt(row.totalQuantity)}
                  </td>
                  <td className="num">{formatRs(row.totalProfit)}</td>
                  <td className="num">
                    {formatDispatchMt(row.domesticQuantity)}
                  </td>
                  <td className="num">{formatRs(row.domesticProfit)}</td>
                  <td className="num">
                    {formatDispatchMt(row.importedQuantity)}
                  </td>
                  <td className="num">{formatRs(row.importedProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
