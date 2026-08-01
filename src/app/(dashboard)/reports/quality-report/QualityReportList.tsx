"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { QualityReportListRow } from "@/lib/actions/reports";
import {
  formatQualityClass,
  formatSaleOrderMt,
} from "@/lib/domain/format";

export function QualityReportList({
  rows,
}: {
  rows: QualityReportListRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      formatQualityClass(r.qualityClass).toLowerCase().includes(q),
    );
  }, [rows, query]);

  const exportColumns = [
    { key: "quality", header: "Quality class" },
    { key: "poBalance", header: "PO balance", align: "right" as const },
    { key: "soBalance", header: "SO balance", align: "right" as const },
    { key: "unsold", header: "Unsold", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((r) => ({
        quality: formatQualityClass(r.qualityClass),
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
        <TableDownloadButtons
          title="Quality report"
          filenameBase="quality-report"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="home-empty">No quality classes match your search.</p>
      ) : (
        <div className="table-wrap table-wrap-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Quality class</th>
                <th className="num">PO balance</th>
                <th className="num">SO balance</th>
                <th className="num">Unsold</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="ca-list-row">
                  <td>
                    <Link
                      href={`/reports/quality-report/${r.id}`}
                      className="ca-list-link"
                    >
                      {formatQualityClass(r.qualityClass)}
                    </Link>
                  </td>
                  <td className="num">{formatSaleOrderMt(r.poBalance)}</td>
                  <td className="num">{formatSaleOrderMt(r.soBalance)}</td>
                  <td className="num">{formatSaleOrderMt(r.unsoldQuantity)}</td>
                  <td className="num">
                    <Link
                      href={`/reports/quality-report/${r.id}`}
                      className="btn-link"
                    >
                      Open →
                    </Link>
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
