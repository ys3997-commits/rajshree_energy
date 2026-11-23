"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { QualityReportVesselRow } from "@/lib/actions/reports";
import {
  formatQualityClass,
  formatSaleOrderMt,
} from "@/lib/domain/format";

type QualityProfile = {
  id: string;
  origin: { name: string };
  domestic: boolean;
  qualityOption: { name: string };
};

type Totals = {
  poBalance: string;
  soBalance: string;
  unsoldQuantity: string;
};

type Props = {
  qualityClass: QualityProfile;
  totals: Totals;
  vessels: QualityReportVesselRow[];
};

type StockFilter = "" | "in-hand" | "out";

function isStockInHand(quantity: string): boolean {
  const qty = Number(quantity);
  return Number.isFinite(qty) && qty > 0;
}

function isOutOfStock(quantity: string): boolean {
  const qty = Number(quantity);
  return Number.isFinite(qty) && qty <= 0;
}

function formatPort(name: string | null, state: string | null): string {
  if (!name && !state) return "—";
  if (name && state) return `${name}, ${state}`;
  return name || state || "—";
}

export function QualityReportDetail({
  qualityClass,
  totals,
  vessels,
}: Props) {
  const label = formatQualityClass(qualityClass);
  const [stockFilter, setStockFilter] = useState<StockFilter>("");

  const filtered = useMemo(() => {
    return vessels.filter((v) => {
      if (stockFilter === "in-hand" && !isStockInHand(v.balanceQuantity)) {
        return false;
      }
      if (stockFilter === "out" && !isOutOfStock(v.balanceQuantity)) {
        return false;
      }
      return true;
    });
  }, [vessels, stockFilter]);

  const exportColumns = [
    { key: "vessel", header: "Vessel" },
    { key: "port", header: "Port" },
    { key: "vesselQty", header: "Vessel Qty", align: "right" as const },
    { key: "dispatchedQty", header: "Dispatched Qty", align: "right" as const },
    { key: "closingQty", header: "Closing Qty", align: "right" as const },
    { key: "balance", header: "Stock in Hand", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((v) => ({
        vessel: v.active ? v.vesselName : `${v.vesselName} · Inactive`,
        port: formatPort(v.portName, v.portState),
        vesselQty: formatSaleOrderMt(v.vesselQuantity),
        dispatchedQty: formatSaleOrderMt(v.dispatchedQuantity),
        closingQty: formatSaleOrderMt(v.closingQuantity),
        balance: formatSaleOrderMt(v.balanceQuantity),
      })),
    [filtered],
  );

  return (
    <div className="quality-report-detail">
      <Link href="/reports/product" className="back-link">
        ← All qualities
      </Link>

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Product
            <span aria-hidden="true"> · </span>
            <Link href="/reports/product">Quality Report</Link>
          </p>
          <h1 className="page-title">{label}</h1>
          <p className="page-subtitle">
            Vessel balances for this quality class.
          </p>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Stock in Hand</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.poBalance)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Order In Hand</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.soBalance)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Unsold Qty</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.unsoldQuantity)}
            </span>
          </div>
        </div>
      </div>

      <section className="analysis-section">
        <div className="filters">
          <h2 className="analysis-section-title">
            Vessels ({filtered.length})
          </h2>
          <label>
            Stock
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            >
              <option value="">All</option>
              <option value="in-hand">Stock in Hand</option>
              <option value="out">Out of Stock</option>
            </select>
          </label>
          <TableDownloadButtons
            title={`${label} — vessels`}
            filenameBase="quality-report-vessels"
            columns={exportColumns}
            rows={exportRows}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="table-wrap">
            <div className="table-h-scroll"><p className="empty-state">
              {vessels.length === 0
                ? "No vessels linked to this quality class."
                : "No vessels match your filters."}
            </p></div>
          </div>
        ) : (
          <div className="table-wrap table-wrap-scroll">
            <div className="table-h-scroll"><table className="data">
              <thead>
                <tr>
                  <th>Vessel</th>
                  <th>Port</th>
                  <th className="cell-num">Vessel Qty</th>
                  <th className="cell-num">Dispatched Qty</th>
                  <th className="cell-num">Closing Qty</th>
                  <th className="cell-num">Stock in Hand</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className={
                      v.active ? undefined : "customer-row-inactive"
                    }
                  >
                    <td>
                      <Link
                        href={`/reports/vessel/${v.id}`}
                        className="font-medium"
                      >
                        {v.vesselName}
                      </Link>
                      {!v.active ? " · Inactive" : ""}
                    </td>
                    <td>{formatPort(v.portName, v.portState)}</td>
                    <td className="cell-num">
                      {formatSaleOrderMt(v.vesselQuantity)}
                    </td>
                    <td className="cell-num">
                      {formatSaleOrderMt(v.dispatchedQuantity)}
                    </td>
                    <td className="cell-num">
                      {formatSaleOrderMt(v.closingQuantity)}
                    </td>
                    <td className="cell-num">
                      {formatSaleOrderMt(v.balanceQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}
      </section>
    </div>
  );
}
