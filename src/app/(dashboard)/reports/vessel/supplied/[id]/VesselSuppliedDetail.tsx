"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { CustomerCategory } from "@/generated/prisma";
import type { VesselSuppliedCustomerRow } from "@/lib/actions/reports";
import {
  formatQualityClass,
  formatRs,
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
  customers,
}: {
  vessel: VesselProfile;
  customers: VesselSuppliedCustomerRow[];
}) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");

  const filtered = useMemo(
    () =>
      customers.filter((c) =>
        matchesCategoryFilter(c.category, categoryFilter),
      ),
    [customers, categoryFilter],
  );

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
        totalMargin: formatRs(c.profit),
        marginPmt: formatRs(marginPmt(c.profit, c.totalQuantity)),
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
              {formatSaleOrderMt(vesselTotals.totalQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Total margin</span>
            <span className="detail-stat-value">
              {formatRs(vesselTotals.totalMargin)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Margin PMT</span>
            <span className="detail-stat-value">
              {formatRs(vesselTotals.marginPmt)}
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
          <table className="data report-table">
            <thead>
              <tr>
                <th>Customer name</th>
                <th className="num">Total quantities</th>
                <th className="num">Total margin</th>
                <th className="num">Margin PMT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.customerId} className="ca-list-row">
                  <td>{c.customerName}</td>
                  <td className="num">
                    {formatSaleOrderMt(c.totalQuantity)}
                  </td>
                  <td className="num">{formatRs(c.profit)}</td>
                  <td className="num">
                    {formatRs(marginPmt(c.profit, c.totalQuantity))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
