"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { CustomerCategory } from "@/generated/prisma";
import type {
  VesselSuppliedCustomerRow,
  VesselSuppliedTotals,
} from "@/lib/actions/reports";
import {
  formatQualityClass,
  formatAmount,
  formatSaleOrderMt,
} from "@/lib/domain/format";

type VesselProfile = {
  id: string;
  vesselName: string;
  active: boolean;
  qualityClass: {
    origin: { name: string };
    domestic: boolean;
    qualityOption: { name: string };
  } | null;
};

type CategoryFilter = "" | "industry" | "trader";
type SortKey = "customerName" | "totalQuantity" | "profit" | "marginPmt";
type SortDir = "asc" | "desc";

const NUMERIC_SORT_KEYS: ReadonlySet<SortKey> = new Set([
  "totalQuantity",
  "profit",
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

function marginPmt(profit: string | null, totalQuantity: string): string | null {
  if (profit == null) return null;
  const p = Number(profit);
  const qty = Number(totalQuantity);
  if (!Number.isFinite(p) || !Number.isFinite(qty) || qty === 0) return null;
  return (p / qty).toFixed(2);
}

function matchesCategoryFilter(
  category: CustomerCategory,
  filter: CategoryFilter,
): boolean {
  if (filter === "") return true;
  if (filter === "industry") return category === CustomerCategory.INDUSTRY;
  return (
    category === CustomerCategory.TRADER ||
    category === CustomerCategory.SUPPLIER
  );
}

export function VesselSuppliedDetail({
  vessel,
  totals,
  customers,
}: {
  vessel: VesselProfile;
  totals: VesselSuppliedTotals;
  customers: VesselSuppliedCustomerRow[];
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

  const filtered = useMemo(() => {
    const next = customers.filter((c) =>
      matchesCategoryFilter(c.category, categoryFilter),
    );
    if (!sortKey) return next;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...next].sort((a, b) => {
      if (sortKey === "customerName") {
        return a.customerName.localeCompare(b.customerName) * dir;
      }
      if (sortKey === "marginPmt") {
        return (
          (numericValue(marginPmt(a.profit, a.totalQuantity)) -
            numericValue(marginPmt(b.profit, b.totalQuantity))) *
          dir
        );
      }
      return (numericValue(a[sortKey]) - numericValue(b[sortKey])) * dir;
    });
  }, [customers, categoryFilter, sortKey, sortDir]);

  const vesselTotals = useMemo(() => {
    let totalQty = 0;
    let totalMargin: number | null = null;
    for (const c of customers) {
      const qty = Number(c.totalQuantity);
      if (Number.isFinite(qty)) totalQty += qty;
      if (c.profit != null) {
        const p = Number(c.profit);
        if (Number.isFinite(p)) {
          totalMargin = totalMargin == null ? p : totalMargin + p;
        }
      }
    }
    const marginPmtValue =
      totalMargin != null && totalQty > 0
        ? (totalMargin / totalQty).toFixed(2)
        : null;
    return {
      totalQuantity: totalQty.toString(),
      totalMargin: totalMargin?.toFixed(2) ?? null,
      marginPmt: marginPmtValue,
    };
  }, [customers]);

  const exportColumns = [
    { key: "customer", header: "Customer name" },
    {
      key: "quantity",
      header: "Total quantities",
      align: "right" as const,
    },
    { key: "totalMargin", header: "Total margin", align: "right" as const },
    { key: "marginPmt", header: "Margin PMT", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((c) => ({
        customer: c.customerName,
        quantity: formatSaleOrderMt(c.totalQuantity),
        totalMargin: formatAmount(c.profit),
        marginPmt: formatAmount(marginPmt(c.profit, c.totalQuantity)),
      })),
    [filtered],
  );

  return (
    <div className="vessel-report-detail">
      <Link href="/reports/vessel/supplied" className="back-link">
        ← All vessels
      </Link>

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/reports/vessel/supplied">Vessel Supplied</Link>
            <span aria-hidden="true"> · </span>
            {vessel.vesselName}
          </p>
          <h1 className="page-title">
            {vessel.vesselName}
            {!vessel.active ? " · Inactive" : ""}
          </h1>
          <p className="page-subtitle">
            Customers supplied from this vessel
            {vessel.qualityClass
              ? ` · ${formatQualityClass(vessel.qualityClass)}`
              : ""}
            .
          </p>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Total quantities</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.totalQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Dispatched quantities</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.soldQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Stock in hand</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.stockInHand)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Total margin</span>
            <span className="detail-stat-value">
              {formatAmount(vesselTotals.totalMargin)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Margin PMT</span>
            <span className="detail-stat-value">
              {formatAmount(vesselTotals.marginPmt)}
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
        <TableDownloadButtons
          title={`Vessel Supplied · ${vessel.vesselName}`}
          filenameBase={`vessel-supplied-${vessel.vesselName}`}
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="home-empty">No customers match your filter.</p>
      ) : (
        <div className="table-wrap table-wrap-scroll">
          <div className="table-h-scroll"><table className="data">
            <thead>
              <tr>
                <th className="report-customer-col">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("customerName")}
                  >
                    Customer name
                    {sortIndicator(sortKey === "customerName", sortDir)}
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
                    onClick={() => toggleSort("profit")}
                  >
                    Total margin
                    {sortIndicator(sortKey === "profit", sortDir)}
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
                <tr key={c.customerId} className="ca-list-row">
                  <td className="report-customer-col">{c.customerName}</td>
                  <td className="cell-num">
                    {formatSaleOrderMt(c.totalQuantity)}
                  </td>
                  <td className="cell-num">{formatAmount(c.profit)}</td>
                  <td className="cell-num">
                    {formatAmount(marginPmt(c.profit, c.totalQuantity))}
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
