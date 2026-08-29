"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { CustomerCategory } from "@/generated/prisma";
import type { CustomerAnalysisListRow } from "@/lib/actions/reports";
import {
  formatCustomerCategory,
  formatAmount,
  formatSaleOrderMt,
} from "@/lib/domain/format";

type CategoryFilter = "" | "industry" | "trader";
type SortKey =
  | "name"
  | "openingDue"
  | "totalQuantity"
  | "due"
  | "totalProfit"
  | "marginPmt";
type SortDir = "asc" | "desc";

const NUMERIC_SORT_KEYS: ReadonlySet<SortKey> = new Set([
  "openingDue",
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

function customerDetailHref(
  id: string,
  dateFrom: string,
  dateTo: string,
): string {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const qs = params.toString();
  return `/reports/customer-analysis/${id}${qs ? `?${qs}` : ""}`;
}

export function CustomerAnalysisList({
  customers,
  dateFrom,
  dateTo,
}: {
  customers: CustomerAnalysisListRow[];
  dateFrom: string;
  dateTo: string;
}) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
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

  const categoryFiltered = useMemo(() => {
    if (categoryFilter === "industry") {
      return customers.filter((c) => c.category === CustomerCategory.INDUSTRY);
    }
    if (categoryFilter === "trader") {
      return customers.filter((c) => c.category === CustomerCategory.TRADER);
    }
    return customers;
  }, [customers, categoryFilter]);

  const summary = useMemo(() => {
    let totalQty = 0;
    let totalDue = 0;
    let totalMargin: number | null = null;
    for (const c of categoryFiltered) {
      totalQty += numericValue(c.totalQuantity);
      totalDue += numericValue(c.due);
      if (c.totalProfit != null) {
        const p = numericValue(c.totalProfit);
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
  }, [categoryFiltered]);

  const filtered = useMemo(() => {
    if (!sortKey) return categoryFiltered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...categoryFiltered].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      return (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir;
    });
  }, [categoryFiltered, sortKey, sortDir]);

  const exportColumns = [
    { key: "customer", header: "Customer" },
    { key: "openingDue", header: "Opening due", align: "right" as const },
    { key: "category", header: "Category" },
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
      filtered.map((c) => ({
        customer: c.name,
        openingDue: formatAmount(c.openingDue),
        category: formatCustomerCategory(c.category),
        totalQuantity: formatSaleOrderMt(c.totalQuantity),
        totalDue: formatAmount(c.due),
        totalMargin: formatAmount(c.totalProfit),
        marginPmt: formatAmount(c.marginPmt),
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
          <h1 className="page-title">Customer analysis</h1>
          <p className="page-subtitle">
            Pick a customer to see buy-side and sell-side volume, balance, and
            margin.
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
        <label>
          Category
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as CategoryFilter)
            }
          >
            <option value="">All</option>
            <option value="industry">Industry</option>
            <option value="trader">Trader</option>
          </select>
        </label>
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
            <Link href="/reports/customer-analysis" className="btn-link">
              Clear
            </Link>
          )}
        </form>
        <TableDownloadButtons
          title="Customer analysis"
          filenameBase="customer-analysis"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>
      <p className="filter-hint">
        Dates filter total quantities, total margin, and margin PMT. Total
        margin is dispatch profit plus discount received minus discount paid.
        Opening due is the carry-forward balance. Total due is as of the end
        date when set, otherwise the current outstanding.
      </p>

      {filtered.length === 0 ? (
        <p className="home-empty">No customers match your filter.</p>
      ) : (
        <div className="table-wrap">
          <div className="table-h-scroll"><table className="data">
            <thead>
              <tr>
                <th className="report-customer-col">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("name")}
                  >
                    Customer
                    {sortIndicator(sortKey === "name", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("openingDue")}
                  >
                    Opening due
                    {sortIndicator(sortKey === "openingDue", sortDir)}
                  </button>
                </th>
                <th>Category</th>
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
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={
                    c.active
                      ? "ca-list-row"
                      : "ca-list-row customer-row-inactive"
                  }
                >
                  <td className="report-customer-col">
                    <Link
                      href={customerDetailHref(c.id, dateFrom, dateTo)}
                      className="ca-list-link"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="cell-num">{formatAmount(c.openingDue)}</td>
                  <td>{formatCustomerCategory(c.category)}</td>
                  <td className="cell-num">
                    {formatSaleOrderMt(c.totalQuantity)}
                  </td>
                  <td className="cell-num">{formatAmount(c.due)}</td>
                  <td className="cell-num">{formatAmount(c.totalProfit)}</td>
                  <td className="cell-num">{formatAmount(c.marginPmt)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
