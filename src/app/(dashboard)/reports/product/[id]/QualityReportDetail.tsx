"use client";

import Link from "next/link";
import { useMemo } from "react";
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

function formatPort(name: string | null, state: string | null): string {
  if (!name && !state) return "—";
  if (name && state) return `${name} (${state})`;
  return name || state || "—";
}

export function QualityReportDetail({
  qualityClass,
  totals,
  vessels,
}: Props) {
  const label = formatQualityClass(qualityClass);

  const exportColumns = [
    { key: "vessel", header: "Vessel" },
    { key: "port", header: "Port" },
    { key: "balance", header: "Balance", align: "right" as const },
  ];

  const exportRows = useMemo(
    () =>
      vessels.map((v) => ({
        vessel: v.active ? v.vesselName : `${v.vesselName} · Inactive`,
        port: formatPort(v.portName, v.portState),
        balance: formatSaleOrderMt(v.balanceQuantity),
      })),
    [vessels],
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
            <span className="detail-stat-label">Stock In Hand</span>
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
            Vessels ({vessels.length})
          </h2>
          <TableDownloadButtons
            title={`${label} — vessels`}
            filenameBase="quality-report-vessels"
            columns={exportColumns}
            rows={exportRows}
          />
        </div>
        {vessels.length === 0 ? (
          <div className="table-wrap">
            <p className="empty-state">
              No vessels linked to this quality class.
            </p>
          </div>
        ) : (
          <div className="table-wrap table-wrap-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Vessel</th>
                  <th>Port</th>
                  <th className="num">Balance</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map((v) => (
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
                    <td className="num">
                      {formatSaleOrderMt(v.balanceQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
