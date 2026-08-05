"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { VesselReportPoRow } from "@/lib/actions/reports";
import {
  displayOrderBalance,
  displayOrderQuantity,
  formatOrderStatusForDisplay,
  formatQualityClass,
  formatRs,
  formatSaleOrderMt,
} from "@/lib/domain/format";

type VesselProfile = {
  id: string;
  vesselName: string;
  active: boolean;
  portName: string | null;
  portState: string | null;
  qualityClass: {
    origin: { name: string };
    domestic: boolean;
    qualityOption: { name: string };
  } | null;
};

type Totals = {
  orderQuantity: string;
  dispatchedQuantity: string;
  closingQuantity: string;
  balanceQuantity: string;
};

type Props = {
  vessel: VesselProfile;
  totals: Totals;
  purchaseOrders: VesselReportPoRow[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function VesselReportDetail({
  vessel,
  totals,
  purchaseOrders,
}: Props) {
  const portLabel =
    vessel.portName && vessel.portState
      ? `${vessel.portName} (${vessel.portState})`
      : vessel.portName || vessel.portState || "No port";

  const exportColumns = [
    { key: "poNumber", header: "PO number" },
    { key: "date", header: "Date" },
    { key: "orderQty", header: "Order qty", align: "right" as const },
    { key: "dispatched", header: "Dispatched", align: "right" as const },
    { key: "closing", header: "Closing", align: "right" as const },
    { key: "balance", header: "Balance", align: "right" as const },
    { key: "vendor", header: "Vendor" },
    { key: "basicPrice", header: "Basic price", align: "right" as const },
    { key: "finalPrice", header: "Final price", align: "right" as const },
    { key: "status", header: "Status" },
  ];

  const exportRows = useMemo(
    () =>
      purchaseOrders.map((o) => {
        const displayRow = {
          orderType: o.orderType,
          quantity: o.quantity,
          dispatchedOrder: o.dispatchedOrder,
          balanceOrder: o.balanceOrder,
        };
        return {
          poNumber: o.poNumber,
          date: formatDate(o.orderDate),
          orderQty: formatSaleOrderMt(displayOrderQuantity(displayRow)),
          dispatched: formatSaleOrderMt(o.dispatchedOrder),
          closing: formatSaleOrderMt(o.closingQuantity),
          balance: formatSaleOrderMt(displayOrderBalance(displayRow)),
          vendor: o.vendorName,
          basicPrice: formatRs(o.rate),
          finalPrice: formatRs(o.finalRate),
          status: formatOrderStatusForDisplay(displayRow),
        };
      }),
    [purchaseOrders],
  );

  return (
    <div className="vessel-report-detail">
      <Link href="/reports/vessel-report" className="back-link">
        ← All vessels
      </Link>

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/reports/vessel-report">Vessel report</Link>
          </p>
          <h1 className="page-title">{vessel.vesselName}</h1>
          <p className="page-subtitle">
            {portLabel}
            {" · "}
            {formatQualityClass(vessel.qualityClass)}
            {vessel.active ? "" : " · Inactive"}
          </p>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Order qty</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.orderQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Dispatched</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.dispatchedQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Closing</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.closingQuantity)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Balance</span>
            <span className="detail-stat-value">
              {formatSaleOrderMt(totals.balanceQuantity)}
            </span>
          </div>
        </div>
      </div>

      <section className="analysis-section">
        <div className="filters">
          <h2 className="analysis-section-title">
            Purchase orders ({purchaseOrders.length})
          </h2>
          <TableDownloadButtons
            title={`${vessel.vesselName} — purchase orders`}
            filenameBase={`vessel-report-${vessel.vesselName.replace(/\s+/g, "-").toLowerCase()}`}
            columns={exportColumns}
            rows={exportRows}
          />
        </div>
        {purchaseOrders.length === 0 ? (
          <div className="table-wrap">
            <p className="empty-state">
              No purchase orders linked to this vessel.
            </p>
          </div>
        ) : (
          <div className="table-wrap table-wrap-scroll">
            <table className="data report-table">
              <thead>
                <tr>
                  <th>PO number</th>
                  <th>Date</th>
                  <th className="num">Order qty</th>
                  <th className="num">Dispatched</th>
                  <th className="num">Closing</th>
                  <th className="num">Balance</th>
                  <th>Vendor</th>
                  <th className="num">Basic price</th>
                  <th className="num">Final price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((o) => {
                  const displayRow = {
                    orderType: o.orderType,
                    quantity: o.quantity,
                    dispatchedOrder: o.dispatchedOrder,
                    balanceOrder: o.balanceOrder,
                  };
                  return (
                    <tr key={o.id}>
                      <td>
                        <Link
                          href={`/purchase-orders/${o.id}`}
                          className="font-medium"
                        >
                          {o.poNumber}
                        </Link>
                      </td>
                      <td className="cell-date">{formatDate(o.orderDate)}</td>
                      <td className="num">
                        {formatSaleOrderMt(displayOrderQuantity(displayRow))}
                      </td>
                      <td className="num">
                        {formatSaleOrderMt(o.dispatchedOrder)}
                      </td>
                      <td className="num">
                        {formatSaleOrderMt(o.closingQuantity)}
                      </td>
                      <td className="num">
                        {formatSaleOrderMt(displayOrderBalance(displayRow))}
                      </td>
                      <td>{o.vendorName}</td>
                      <td className="num">{formatRs(o.rate)}</td>
                      <td className="num">{formatRs(o.finalRate)}</td>
                      <td>
                        {formatOrderStatusForDisplay(displayRow)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
