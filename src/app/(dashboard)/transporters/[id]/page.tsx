import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { getTransporter } from "@/lib/actions/transporters";
import { formatMt } from "@/lib/domain/computations";
import { capitalizeName, formatLorryNumber, formatRs } from "@/lib/domain/format";

function monthKey(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function TransporterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transporter = await getTransporter(id);
  if (!transporter) notFound();

  const byMonth = new Map<
    string,
    {
      rows: (typeof transporter.dispatches)[number][];
      totalQty: number;
    }
  >();

  for (const row of transporter.dispatches) {
    const key = monthKey(row.dispatchDate);
    const existing = byMonth.get(key);
    const qty = Number(row.dispatchedQuantity.toString());
    if (existing) {
      existing.rows.push(row);
      existing.totalQty += qty;
    } else {
      byMonth.set(key, { rows: [row], totalQty: qty });
    }
  }

  const months = [...byMonth.entries()];

  return (
    <div className="transporter-detail">
      <Link href="/transporters" className="back-link">
        ← Transporters
      </Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">
            {capitalizeName(transporter.name) ?? transporter.name}
          </h1>
          <p className="page-subtitle">
            Dispatches moved by this transporter, month by month.
          </p>
        </div>
      </div>

      <div className="detail-meta">
        <div className="detail-meta-item">
          <span className="detail-meta-label">Owner</span>
          <span className="detail-meta-value">
            {transporter.ownerName
              ? (capitalizeName(transporter.ownerName) ?? transporter.ownerName)
              : "—"}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Contact 1</span>
          <span className="detail-meta-value">
            {transporter.ownerContactNumber1 || "—"}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Contact 2</span>
          <span className="detail-meta-value">
            {transporter.ownerContactNumber2 || "—"}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Email</span>
          <span className="detail-meta-value">
            {transporter.email || "—"}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">City</span>
          <span className="detail-meta-value">
            {transporter.city || "—"}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">State</span>
          <span className="detail-meta-value">
            {transporter.state || "—"}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Opening due</span>
          <span className="detail-meta-value">
            {formatRs(transporter.openingDue)}
            <span className="detail-meta-note"> as on 01/08/2026</span>
          </span>
        </div>
      </div>

      {months.length === 0 ? (
        <div className="table-wrap">
          <p className="empty-state">
            No dispatches for this transporter yet.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data transporter-dispatch-table">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>Date</th>
                <th>Lorry</th>
                <th className="num">Qty (MT)</th>
                <th className="num">Freight (Rs/MT)</th>
                <th>Sale PO</th>
                <th>Purchase PO</th>
              </tr>
            </thead>
            <tbody>
              {months.map(([key, { rows, totalQty }]) => (
                <Fragment key={key}>
                  <tr className="month-divider">
                    <td colSpan={6}>
                      <div className="month-divider-inner">
                        <span className="month-divider-title">
                          {formatMonthLabel(key)}
                        </span>
                        <span className="month-divider-meta">
                          {rows.length} trip{rows.length === 1 ? "" : "s"}
                          <span className="month-divider-dot" aria-hidden>
                            ·
                          </span>
                          {formatMt(String(totalQty))} MT
                        </span>
                      </div>
                    </td>
                  </tr>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="cell-date">{formatDate(row.dispatchDate)}</td>
                      <td className={row.lorryNumber ? undefined : "cell-muted"}>
                        {formatLorryNumber(row.lorryNumber) ?? "—"}
                      </td>
                      <td className="num">
                        {formatMt(row.dispatchedQuantity.toString())}
                      </td>
                      <td className="num">
                        {formatMt(row.freight)}
                      </td>
                      <td>
                        {row.order ? (
                          <Link href={`/orders/${row.order.id}`}>
                            {row.poNumber}
                          </Link>
                        ) : (
                          row.poNumber
                        )}
                      </td>
                      <td>
                        {row.purchaseOrder ? (
                          <Link
                            href={`/purchase-orders/${row.purchaseOrder.id}`}
                            title={`${row.purchaseOrder.importer?.name ?? ""} — ${row.purchaseOrder.vessel?.vesselName ?? ""}`}
                          >
                            {row.purchasePoNumber}
                          </Link>
                        ) : (
                          row.purchasePoNumber
                        )}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
