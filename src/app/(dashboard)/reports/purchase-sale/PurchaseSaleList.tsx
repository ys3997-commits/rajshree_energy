"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { PurchaseSaleRow } from "@/lib/actions/reports";
import {
  formatAmount,
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatIndianNumber,
  formatMonthYear,
} from "@/lib/domain/format";

type PurchaseSaleView = "daily" | "month";

type SortKey =
  | "date"
  | "quantity"
  | "purchaseAmount"
  | "saleAmount"
  | "freightAmount"
  | "profit"
  | "truckCount";
type SortDir = "asc" | "desc";

const VIEW_CONFIG: Record<
  PurchaseSaleView,
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
    basePath: "/reports/purchase-sale/daily",
    periodLabel: "Date",
    exportTitle: "Purchase / Sale — daily wise",
    exportFilename: "purchase-sale-daily",
    formatPeriod: formatDateDdMmYyyy,
  },
  month: {
    title: "Monthly wise",
    basePath: "/reports/purchase-sale/month-wise",
    periodLabel: "Month",
    exportTitle: "Purchase / Sale — monthly wise",
    exportFilename: "purchase-sale-month-wise",
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

export function PurchaseSaleList({
  view,
  rows,
  dateFrom,
  dateTo,
}: {
  view: PurchaseSaleView;
  rows: PurchaseSaleRow[];
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
    let quantity = 0;
    let purchaseAmount = 0;
    let saleAmount = 0;
    let freightAmount = 0;
    let profit = 0;
    let trucks = 0;
    for (const row of rows) {
      quantity += numericValue(row.quantity);
      purchaseAmount += numericValue(row.purchaseAmount);
      saleAmount += numericValue(row.saleAmount);
      freightAmount += numericValue(row.freightAmount);
      profit += numericValue(row.profit);
      trucks += numericValue(row.truckCount);
    }
    return {
      quantity: quantity.toString(),
      purchaseAmount: purchaseAmount.toFixed(2),
      saleAmount: saleAmount.toFixed(2),
      freightAmount: freightAmount.toFixed(2),
      profit: profit.toFixed(2),
      truckCount: String(trucks),
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
    { key: "quantity", header: "Quantity", align: "right" as const },
    {
      key: "purchaseAmount",
      header: "Purchase amount",
      align: "right" as const,
    },
    { key: "saleAmount", header: "Sale amount", align: "right" as const },
    { key: "freightAmount", header: "Freight amount", align: "right" as const },
    { key: "profit", header: "Profit", align: "right" as const },
    { key: "truckCount", header: "Trucks", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((row) => ({
        date: config.formatPeriod(row.date),
        quantity: formatDispatchMt(row.quantity),
        purchaseAmount: formatAmount(row.purchaseAmount),
        saleAmount: formatAmount(row.saleAmount),
        freightAmount: formatAmount(row.freightAmount),
        profit: formatAmount(row.profit),
        truckCount: formatIndianNumber(row.truckCount),
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
            Purchase / Sale
            <span aria-hidden="true"> · </span>
            {config.title}
          </p>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-subtitle">Purchase / Sale</p>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Quantity</span>
            <span className="detail-stat-value">
              {formatDispatchMt(summary.quantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Purchase amount</span>
            <span className="detail-stat-value">
              {formatAmount(summary.purchaseAmount)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Sale amount</span>
            <span className="detail-stat-value">
              {formatAmount(summary.saleAmount)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Freight amount</span>
            <span className="detail-stat-value">
              {formatAmount(summary.freightAmount)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Profit</span>
            <span className="detail-stat-value">
              {formatAmount(summary.profit)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Trucks</span>
            <span className="detail-stat-value">
              {formatIndianNumber(summary.truckCount)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="segment-control"
        role="tablist"
        aria-label="Purchase / Sale view"
      >
        <Link
          href="/reports/purchase-sale/daily"
          className={`segment-option${view === "daily" ? " segment-option-selected" : ""}`}
          role="tab"
          aria-selected={view === "daily"}
        >
          Daily wise
        </Link>
        <Link
          href="/reports/purchase-sale/month-wise"
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
            Start Date
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom}
              max={dateTo || undefined}
            />
          </label>
          <label>
            End Date
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
        <p className="home-empty">No dispatches match your filter.</p>
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
                      onClick={() => toggleSort("quantity")}
                    >
                      Quantity
                      {sortIndicator(sortKey === "quantity", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("purchaseAmount")}
                    >
                      Purchase amount
                      {sortIndicator(sortKey === "purchaseAmount", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("saleAmount")}
                    >
                      Sale amount
                      {sortIndicator(sortKey === "saleAmount", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("freightAmount")}
                    >
                      Freight amount
                      {sortIndicator(sortKey === "freightAmount", sortDir)}
                    </button>
                  </th>
                  <th className="cell-num">
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort("profit")}
                    >
                      Profit
                      {sortIndicator(sortKey === "profit", sortDir)}
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
                      {formatDispatchMt(row.quantity)}
                    </td>
                    <td className="cell-num">
                      {formatAmount(row.purchaseAmount)}
                    </td>
                    <td className="cell-num">{formatAmount(row.saleAmount)}</td>
                    <td className="cell-num">
                      {formatAmount(row.freightAmount)}
                    </td>
                    <td className="cell-num">{formatAmount(row.profit)}</td>
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
