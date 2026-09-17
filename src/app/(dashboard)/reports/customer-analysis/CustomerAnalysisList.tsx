"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { CustomerCategory } from "@/generated/prisma";
import type { CustomerAnalysisListRow } from "@/lib/actions/reports";
import {
  formatCustomerCategory,
  formatAmount,
  formatCreditPeriod,
  formatIndianNumber,
  formatSaleOrderMt,
} from "@/lib/domain/format";

type CategoryFilter = "" | "industry" | "trader";
type SortKey =
  | "name"
  | "openingDue"
  | "totalQuantity"
  | "due"
  | "totalProfit"
  | "marginPmt"
  | "marginVsInvestment"
  | "recoveryOfFund"
  | "creditDays"
  | "recoveryMinusCredit";
type SortDir = "asc" | "desc";

const NUMERIC_SORT_KEYS: ReadonlySet<SortKey> = new Set([
  "openingDue",
  "totalQuantity",
  "due",
  "totalProfit",
  "marginPmt",
  "marginVsInvestment",
  "recoveryOfFund",
  "creditDays",
  "recoveryMinusCredit",
]);

const PROFIT_PCT_TITLE =
  "Total Profit × 100 ÷ (total purchase basic + total freight)";
const DIFF_PERIOD_TITLE =
  "Recovery Period minus Credit period (positive = slower than credit)";

function numericValue(
  value: string | number | null | undefined,
): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatProfitPct(value: string | null): string {
  if (value == null || value === "") return "—";
  return `${value}%`;
}

function profitPctCalcTitle(row: CustomerAnalysisListRow): string {
  if (row.marginVsInvestment == null) {
    return PROFIT_PCT_TITLE;
  }
  const cost = (
    Number(row.purchaseBasic) + Number(row.freightTotal)
  ).toFixed(2);
  return `${formatIndianNumber(row.totalProfit, 2)} × 100 ÷ (${formatIndianNumber(row.purchaseBasic, 2)} purchase basic + ${formatIndianNumber(row.freightTotal, 2)} freight = ${formatIndianNumber(cost, 2)}) = ${formatProfitPct(row.marginVsInvestment)}`;
}

function recoveryMinusCredit(row: CustomerAnalysisListRow): number | null {
  if (row.recoveryOfFund == null || row.creditDays == null) return null;
  const recovery = Number(row.recoveryOfFund);
  if (!Number.isFinite(recovery)) return null;
  return recovery - row.creditDays;
}

function sortNumeric(
  row: CustomerAnalysisListRow,
  key: Exclude<SortKey, "name">,
): number {
  if (key === "recoveryMinusCredit") {
    return recoveryMinusCredit(row) ?? 0;
  }
  return numericValue(row[key]);
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
    let totalProfit: number | null = null;
    let purchaseBasic = 0;
    let freightTotal = 0;
    for (const c of categoryFiltered) {
      totalQty += numericValue(c.totalQuantity);
      totalDue += numericValue(c.due);
      purchaseBasic += numericValue(c.purchaseBasic);
      freightTotal += numericValue(c.freightTotal);
      if (c.totalProfit != null) {
        const p = numericValue(c.totalProfit);
        totalProfit = totalProfit == null ? p : totalProfit + p;
      }
    }
    const profitPmt =
      totalProfit != null && totalQty > 0
        ? (totalProfit / totalQty).toFixed(2)
        : null;
    const cost = purchaseBasic + freightTotal;
    const profitPct =
      totalProfit != null && cost !== 0
        ? ((totalProfit / cost) * 100).toFixed(2)
        : null;
    return {
      totalQuantity: totalQty.toString(),
      totalDue: totalDue.toFixed(2),
      totalProfit: totalProfit?.toFixed(2) ?? null,
      profitPmt,
      profitPct,
    };
  }, [categoryFiltered]);

  const filtered = useMemo(() => {
    if (!sortKey) return categoryFiltered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...categoryFiltered].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      return (sortNumeric(a, sortKey) - sortNumeric(b, sortKey)) * dir;
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
    { key: "totalProfit", header: "Total Profit", align: "right" as const },
    { key: "profitPmt", header: "Profit PMT", align: "right" as const },
    {
      key: "profitPct",
      header: "Profit %",
      align: "right" as const,
    },
    {
      key: "recoveryPeriod",
      header: "Recovery Period",
      align: "right" as const,
    },
    {
      key: "creditPeriod",
      header: "Credit period",
      align: "right" as const,
    },
    {
      key: "diffPeriod",
      header: "Diff Period",
      align: "right" as const,
    },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((c) => ({
        customer: c.name,
        openingDue: formatAmount(c.openingDue),
        category: formatCustomerCategory(c.category),
        totalQuantity: formatSaleOrderMt(c.totalQuantity),
        totalDue: formatAmount(c.due),
        totalProfit: formatAmount(c.totalProfit),
        profitPmt: formatAmount(c.marginPmt),
        profitPct: formatProfitPct(c.marginVsInvestment),
        recoveryPeriod: formatCreditPeriod(
          c.recoveryOfFund == null ? null : Number(c.recoveryOfFund),
        ),
        creditPeriod: formatCreditPeriod(c.creditDays),
        diffPeriod: formatCreditPeriod(recoveryMinusCredit(c)),
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
            <span className="detail-stat-label">Total Profit</span>
            <span className="detail-stat-value">
              {formatAmount(summary.totalProfit)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Profit PMT</span>
            <span className="detail-stat-value">
              {formatAmount(summary.profitPmt)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Profit %</span>
            <span
              className="detail-stat-value"
              title={PROFIT_PCT_TITLE}
            >
              {formatProfitPct(summary.profitPct)}
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

      {filtered.length === 0 ? (
        <p className="home-empty">No customers match your filter.</p>
      ) : (
        <div className="table-wrap">
          <div className="table-h-scroll">
            <table className="data customer-analysis-table">
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
                    Total Profit
                    {sortIndicator(sortKey === "totalProfit", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("marginPmt")}
                  >
                    Profit PMT
                    {sortIndicator(sortKey === "marginPmt", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("marginVsInvestment")}
                    title={PROFIT_PCT_TITLE}
                  >
                    Profit %
                    {sortIndicator(sortKey === "marginVsInvestment", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("recoveryOfFund")}
                    title="Average days to recover funds after goods are supplied"
                  >
                    Recovery Period
                    {sortIndicator(sortKey === "recoveryOfFund", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("creditDays")}
                    title="Agreed credit period on the customer master"
                  >
                    Credit period
                    {sortIndicator(sortKey === "creditDays", sortDir)}
                  </button>
                </th>
                <th className="cell-num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("recoveryMinusCredit")}
                    title={DIFF_PERIOD_TITLE}
                  >
                    Diff Period
                    {sortIndicator(
                      sortKey === "recoveryMinusCredit",
                      sortDir,
                    )}
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
                  <td
                    className="cell-num"
                    title={profitPctCalcTitle(c)}
                  >
                    {formatProfitPct(c.marginVsInvestment)}
                  </td>
                  <td className="cell-num">
                    {formatCreditPeriod(
                      c.recoveryOfFund == null
                        ? null
                        : Number(c.recoveryOfFund),
                    )}
                  </td>
                  <td className="cell-num">
                    {formatCreditPeriod(c.creditDays)}
                  </td>
                  <td
                    className="cell-num"
                    title={DIFF_PERIOD_TITLE}
                  >
                    {formatCreditPeriod(recoveryMinusCredit(c))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
