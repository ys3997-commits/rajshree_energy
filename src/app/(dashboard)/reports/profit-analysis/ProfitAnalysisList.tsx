"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { ProfitAnalysisRow } from "@/lib/actions/reports";
import {
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatIndianNumber,
  formatAmount,
  formatMonthYear,
} from "@/lib/domain/format";

type ProfitAnalysisView = "daily" | "month";

type SortKey =
  | "date"
  | "domesticQuantity"
  | "domesticProfit"
  | "importedQuantity"
  | "importedProfit"
  | "totalQuantity"
  | "totalProfit"
  | "truckCount";
type SortDir = "asc" | "desc";

const VIEW_CONFIG: Record<
  ProfitAnalysisView,
  {
    title: string;
    basePath: string;
    periodLabel: string;
    exportTitle: string;
    exportFilename: string;
    formatPeriod: (value: string) => string;
  }
> = {
  daily: {
    title: "Daily wise",
    basePath: "/reports/profit-analysis/daily",
    periodLabel: "Date",
    exportTitle: "Profit analysis — daily wise",
    exportFilename: "profit-analysis-daily",
    formatPeriod: formatDateDdMmYyyy,
  },
  month: {
    title: "Monthly wise",
    basePath: "/reports/profit-analysis/month-wise",
    periodLabel: "Month",
    exportTitle: "Profit analysis — monthly wise",
    exportFilename: "profit-analysis-month-wise",
    formatPeriod: formatMonthYear,
  },
};

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
  view,
  rows,
  dateFrom,
  dateTo,
}: {
  view: ProfitAnalysisView;
  rows: ProfitAnalysisRow[];
  dateFrom: string;
  dateTo: string;
}) {
  const config = VIEW_CONFIG[view];
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
    { key: "date", header: config.periodLabel },
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
    { key: "truckCount", header: "Trucks", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((row) => ({
        date: config.formatPeriod(row.date),
        domesticQuantity: formatDispatchMt(row.domesticQuantity),
        domesticProfit: formatAmount(row.domesticProfit),
        importedQuantity: formatDispatchMt(row.importedQuantity),
        importedProfit: formatAmount(row.importedProfit),
        truckCount: formatIndianNumber(row.truckCount),
        totalQuantity: formatDispatchMt(row.totalQuantity),
        totalProfit: formatAmount(row.totalProfit),
      })),
    [filtered, config],
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Analysis
            <span aria-hidden="true"> · </span>
            Profit Analysis
            <span aria-hidden="true"> · </span>
            {config.title}
          </p>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-subtitle">Profit analysis</p>
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
              {formatAmount(summary.totalProfit)}
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
              {formatAmount(summary.domesticProfit)}
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
              {formatAmount(summary.importedProfit)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="segment-control"
        role="tablist"
        aria-label="Profit analysis view"
      >
        <Link
          href="/reports/profit-analysis/daily"
          className={`segment-option${view === "daily" ? " segment-option-selected" : ""}`}
          role="tab"
          aria-selected={view === "daily"}
        >
          Daily wise
        </Link>
        <Link
          href="/reports/profit-analysis/month-wise"
          className={`segment-option${view === "month" ? " segment-option-selected" : ""}`}
          role="tab"
          aria-selected={view === "month"}
        >
          Monthly wise
        </Link>
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
            <Link href={config.basePath} className="btn-link">
              Clear
            </Link>
          )}
        </form>
        <TableDownloadButtons
          title={config.exportTitle}
          filenameBase={config.exportFilename}
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="home-empty">
          No dispatches or discounts match your filter.
        </p>
      ) : (
        <div className="table-wrap">
          <div className="table-h-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("date")}
                    >
                      {config.periodLabel}
                      {sortIndicator(sortKey === "date", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("totalQuantity")}
                    >
                      Total quantity
                      {sortIndicator(sortKey === "totalQuantity", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("totalProfit")}
                    >
                      Total profit
                      {sortIndicator(sortKey === "totalProfit", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("domesticQuantity")}
                    >
                      Domestic quantity
                      {sortIndicator(sortKey === "domesticQuantity", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("domesticProfit")}
                    >
                      Domestic profit
                      {sortIndicator(sortKey === "domesticProfit", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("importedQuantity")}
                    >
                      Imported quantity
                      {sortIndicator(sortKey === "importedQuantity", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("importedProfit")}
                    >
                      Imported profit
                      {sortIndicator(sortKey === "importedProfit", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("truckCount")}
                    >
                      Trucks
                      {sortIndicator(sortKey === "truckCount", sortDir)}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.date}>
                    <td>{config.formatPeriod(row.date)}</td>
                    <td className="cell-num">
                      {formatDispatchMt(row.totalQuantity)}
                    </td>
                    <td className="cell-num">{formatAmount(row.totalProfit)}</td>
                    <td className="cell-num">
                      {formatDispatchMt(row.domesticQuantity)}
                    </td>
                    <td className="cell-num">
                      {formatAmount(row.domesticProfit)}
                    </td>
                    <td className="cell-num">
                      {formatDispatchMt(row.importedQuantity)}
                    </td>
                    <td className="cell-num">
                      {formatAmount(row.importedProfit)}
                    </td>
                    <td className="cell-num">
                      {formatIndianNumber(row.truckCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
