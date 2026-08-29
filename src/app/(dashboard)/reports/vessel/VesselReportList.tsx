"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { VesselReportListRow } from "@/lib/actions/reports";
import {
  formatQualityClass,
  formatSaleOrderMt,
} from "@/lib/domain/format";

function formatPort(name: string | null, state: string | null): string {
  if (!name && !state) return "—";
  if (name && state) return `${name} (${state})`;
  return name || state || "—";
}

export function VesselReportList({
  vessels,
}: {
  vessels: VesselReportListRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vessels;
    return vessels.filter((v) => {
      const haystack = [
        v.vesselName,
        v.portName,
        v.portState,
        formatQualityClass(v.qualityClass),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [vessels, query]);

  const exportColumns = [
    { key: "vessel", header: "Vessel" },
    { key: "port", header: "Port" },
    { key: "quality", header: "Quality" },
    { key: "orderQty", header: "Order qty", align: "right" as const },
    { key: "dispatched", header: "Dispatched", align: "right" as const },
    { key: "closing", header: "Closing", align: "right" as const },
    { key: "balance", header: "Balance", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((v) => ({
        vessel: v.active ? v.vesselName : `${v.vesselName} · Inactive`,
        port: formatPort(v.portName, v.portState),
        quality: formatQualityClass(v.qualityClass),
        orderQty: formatSaleOrderMt(v.orderQuantity),
        dispatched: formatSaleOrderMt(v.dispatchedQuantity),
        closing: formatSaleOrderMt(v.closingQuantity),
        balance: formatSaleOrderMt(v.balanceQuantity),
      })),
    [filtered],
  );

  return (
    <div className="vessel-report-list">
      <div className="filters">
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vessel, port, quality…"
            autoComplete="off"
          />
        </label>
        <TableDownloadButtons
          title="Vessel Report"
          filenameBase="vessel-report"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="home-empty">No vessels match your search.</p>
      ) : (
        <div className="table-wrap table-wrap-scroll">
          <div className="table-h-scroll"><table className="data">
            <thead>
              <tr>
                <th>Vessel</th>
                <th>Port</th>
                <th>Quality</th>
                <th className="cell-num">Order qty</th>
                <th className="cell-num">Dispatched</th>
                <th className="cell-num">Closing</th>
                <th className="cell-num">Balance</th>
                <th />
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
                      href={`/reports/vessel/${v.id}`}
                      className="ca-list-link"
                    >
                      {v.vesselName}
                    </Link>
                    {!v.active ? " · Inactive" : ""}
                  </td>
                  <td>{formatPort(v.portName, v.portState)}</td>
                  <td>{formatQualityClass(v.qualityClass)}</td>
                  <td className="cell-num">{formatSaleOrderMt(v.orderQuantity)}</td>
                  <td className="cell-num">{formatSaleOrderMt(v.dispatchedQuantity)}</td>
                  <td className="cell-num">{formatSaleOrderMt(v.closingQuantity)}</td>
                  <td className="cell-num">{formatSaleOrderMt(v.balanceQuantity)}</td>
                  <td className="cell-num">
                    <Link
                      href={`/reports/vessel/${v.id}`}
                      className="btn-link"
                    >
                      Open →
                    </Link>
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
