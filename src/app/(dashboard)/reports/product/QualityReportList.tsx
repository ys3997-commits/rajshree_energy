"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { QualityReportListRow } from "@/lib/actions/reports";
import {
  formatQualityClass,
  formatSaleOrderMt,
} from "@/lib/domain/format";

type StockFilter = "" | "in-hand" | "out";

/** Stock in Hand is quantity above 0. Out of Stock is 0 or below. */
function isStockInHand(quantity: string): boolean {
  const qty = Number(quantity);
  return Number.isFinite(qty) && qty > 0;
}

function isOutOfStock(quantity: string): boolean {
  const qty = Number(quantity);
  return Number.isFinite(qty) && qty <= 0;
}

export function QualityReportList({
  rows,
}: {
  rows: QualityReportListRow[];
}) {
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (stockFilter === "in-hand" && !isStockInHand(r.poBalance)) {
        return false;
      }
      if (stockFilter === "out" && !isOutOfStock(r.poBalance)) {
        return false;
      }
      if (!q) return true;
      return formatQualityClass(r.qualityClass).toLowerCase().includes(q);
    });
  }, [rows, query, stockFilter]);

  const exportColumns = [
    { key: "quality", header: "Quality class" },
    { key: "vesselQty", header: "Vessel Qty", align: "right" as const },
    { key: "dispatchedQty", header: "Dispatched Qty", align: "right" as const },
    { key: "closingQty", header: "Closing Qty", align: "right" as const },
    { key: "poBalance", header: "Stock in Hand", align: "right" as const },
    { key: "soBalance", header: "Order In Hand", align: "right" as const },
    { key: "unsold", header: "Unsold Qty", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((r) => ({
        quality: formatQualityClass(r.qualityClass),
        vesselQty: formatSaleOrderMt(r.vesselQuantity),
        dispatchedQty: formatSaleOrderMt(r.dispatchedQuantity),
        closingQty: formatSaleOrderMt(r.closingQuantity),
        poBalance: formatSaleOrderMt(r.poBalance),
        soBalance: formatSaleOrderMt(r.soBalance),
        unsold: formatSaleOrderMt(r.unsoldQuantity),
      })),
    [filtered],
  );

  return (
    <div className="quality-report-list">
      <div className="filters">
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quality class…"
            autoComplete="off"
          />
        </label>
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
          title="Quality Report"
          filenameBase="quality-report"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="home-empty">No quality classes match your filters.</p>
      ) : (
        <div className="table-wrap table-wrap-scroll">
          <div className="table-h-scroll"><table className="data">
            <thead>
              <tr>
                <th>Quality class</th>
                <th className="cell-num">Vessel Qty</th>
                <th className="cell-num">Dispatched Qty</th>
                <th className="cell-num">Closing Qty</th>
                <th className="cell-num">Stock in Hand</th>
                <th className="cell-num">Order In Hand</th>
                <th className="cell-num">Unsold Qty</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="ca-list-row">
                  <td>
                    <Link
                      href={`/reports/product/${r.id}`}
                      className="ca-list-link"
                    >
                      {formatQualityClass(r.qualityClass)}
                    </Link>
                  </td>
                  <td className="cell-num">{formatSaleOrderMt(r.vesselQuantity)}</td>
                  <td className="cell-num">{formatSaleOrderMt(r.dispatchedQuantity)}</td>
                  <td className="cell-num">{formatSaleOrderMt(r.closingQuantity)}</td>
                  <td className="cell-num">{formatSaleOrderMt(r.poBalance)}</td>
                  <td className="cell-num">{formatSaleOrderMt(r.soBalance)}</td>
                  <td className="cell-num">{formatSaleOrderMt(r.unsoldQuantity)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
