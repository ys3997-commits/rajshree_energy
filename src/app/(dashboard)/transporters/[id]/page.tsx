import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { DispatchTerms } from "@/generated/prisma";
import { getTransporter } from "@/lib/actions/transporters";
import { toDecimal } from "@/lib/domain/computations";
import {
  capitalizeName,
  formatDispatchMt,
  formatLorryNumber,
  formatRs,
} from "@/lib/domain/format";
import {
  computeTransporterPayableDue,
  freightBilledAmount,
} from "@/lib/domain/transporterDue";

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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const fromTransportDue = from === "due";
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

  let freightBilled = toDecimal(0);
  for (const row of transporter.dispatches) {
    if (row.dispatchTerms !== DispatchTerms.FOR || row.freight == null) continue;
    freightBilled = freightBilled.plus(
      freightBilledAmount(row.freight, row.dispatchedQuantity),
    );
  }

  let paid = toDecimal(0);
  let received = toDecimal(0);
  for (const payment of transporter.payments) {
    if (payment.direction === "SENT") {
      paid = paid.plus(payment.amount);
    } else {
      received = received.plus(payment.amount);
    }
  }

  const transportDueAfterTds = computeTransporterPayableDue(
    transporter.openingDue,
    freightBilled,
    paid,
    received,
  );

  return (
    <div className="transporter-detail">
      <Link
        href={fromTransportDue ? "/reports/transport/due" : "/transporters"}
        className="back-link"
      >
        {fromTransportDue ? "← Transport Due" : "← Transporters"}
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
          <span className="detail-meta-label">Transport Owner</span>
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
          <span className="detail-meta-label">
            Transport Due
            <br />
            after TDS
          </span>
          <span className="detail-meta-value">
            {formatRs(transportDueAfterTds)}
          </span>
        </div>
      </div>

      {months.length === 0 ? (
        <div className="table-wrap">
          <div className="table-h-scroll"><p className="empty-state">
            No dispatches for this transporter yet.
          </p></div>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-h-scroll"><table className="data transporter-dispatch-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Lorry</th>
                <th className="num">Qty</th>
                <th className="num">Freight PMT</th>
                <th className="num">Freight amount</th>
                <th>Port name</th>
                <th>Sale PO</th>
                <th>Customer name</th>
                <th>Purchase PO</th>
                <th>Vendor name</th>
              </tr>
            </thead>
            <tbody>
              {months.map(([key, { rows, totalQty }]) => (
                <Fragment key={key}>
                  <tr className="month-divider">
                    <td colSpan={10}>
                      <div className="month-divider-inner">
                        <span className="month-divider-title">
                          {formatMonthLabel(key)}
                        </span>
                        <span className="month-divider-meta">
                          {rows.length} trip{rows.length === 1 ? "" : "s"}
                          <span className="month-divider-dot" aria-hidden>
                            ·
                          </span>
                          {formatDispatchMt(String(totalQty))}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {rows.map((row) => {
                    const customerName = row.order?.customer?.name ?? null;
                    const vendorName = row.purchaseOrder?.importer?.name ?? null;
                    const portName =
                      row.order?.port?.name ?? row.vessel?.port?.name ?? null;
                    const freightAmount =
                      row.freight != null
                        ? freightBilledAmount(
                            row.freight,
                            row.dispatchedQuantity,
                          )
                        : null;
                    return (
                      <tr key={row.id}>
                        <td className="cell-date">
                          {formatDate(row.dispatchDate)}
                        </td>
                        <td
                          className={
                            row.lorryNumber ? undefined : "cell-muted"
                          }
                        >
                          {formatLorryNumber(row.lorryNumber) ?? "—"}
                        </td>
                        <td className="num">
                          {formatDispatchMt(row.dispatchedQuantity.toString())}
                        </td>
                        <td className="num">{formatRs(row.freight)}</td>
                        <td className="num">
                          {freightAmount != null
                            ? formatRs(freightAmount)
                            : "—"}
                        </td>
                        <td className={portName ? undefined : "cell-muted"}>
                          {portName
                            ? (capitalizeName(portName) ?? portName)
                            : "—"}
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
                        <td className={customerName ? undefined : "cell-muted"}>
                          {customerName
                            ? (capitalizeName(customerName) ?? customerName)
                            : "—"}
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
                        <td className={vendorName ? undefined : "cell-muted"}>
                          {vendorName
                            ? (capitalizeName(vendorName) ?? vendorName)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
