"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { CustomerCategory } from "@/generated/prisma";
import type {
  CustomerAnalysisDispatchRow,
  CustomerAnalysisOrderRow,
  CustomerSideMetrics,
} from "@/lib/actions/reports";
import {
  capitalizeName,
  formatCreditPeriod,
  formatCustomerCategory,
  formatDispatchMt,
  formatMt,
  formatPurchaseOrderStatus,
  formatRs,
  formatSaleOrderStatus,
} from "@/lib/domain/format";

type CustomerProfile = {
  id: string;
  name: string;
  category: CustomerCategory;
  active: boolean;
  due: string;
  city: string | null;
  state: string | null;
  creditDays: number | null;
  saleExecutive: string | null;
  ownerName: string | null;
  ownerContact: string | null;
  sector: string | null;
  email: string | null;
};

type Props = {
  customer: CustomerProfile;
  saleSide: CustomerSideMetrics;
  purchaseSide: CustomerSideMetrics;
  saleOrders: CustomerAnalysisOrderRow[];
  purchaseOrders: CustomerAnalysisOrderRow[];
  dispatches: CustomerAnalysisDispatchRow[];
  filters: { dateFrom: string; dateTo: string };
};

type Tab = "overview" | "sale-orders" | "purchase-orders" | "dispatches";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBalance(value: string | null): string {
  if (value == null) return "—";
  return `${formatMt(value)} MT`;
}

function formatVolume(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${formatMt(value)} MT`;
}

function formatMargin(value: string | null): string {
  if (value == null || value === "") return "—";
  return `${value}%`;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="ca-kpi">
      <span className="ca-kpi-label">{label}</span>
      <span className="ca-kpi-value">{value}</span>
    </div>
  );
}

function SideBlock({
  title,
  emptyLabel,
  metrics,
}: {
  title: string;
  emptyLabel: string;
  metrics: CustomerSideMetrics;
}) {
  const empty =
    metrics.orderCount === 0 && Number(metrics.dispatchedVolume) === 0;

  if (empty) {
    return (
      <section className="ca-side">
        <h2 className="ca-side-title">{title}</h2>
        <p className="ca-side-empty">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className="ca-side">
      <h2 className="ca-side-title">{title}</h2>
      <div className="ca-kpi-grid">
        <Kpi label="Orders" value={String(metrics.orderCount)} />
        <Kpi label="Balance order" value={formatBalance(metrics.balanceOrder)} />
        <Kpi
          label="Dispatched"
          value={formatVolume(metrics.dispatchedVolume)}
        />
        <Kpi label="Total profit" value={formatRs(metrics.totalProfit)} />
        <Kpi label="Avg profit / MT" value={formatRs(metrics.avgProfitPerMt)} />
        <Kpi label="Margin" value={formatMargin(metrics.marginPercent)} />
        <Kpi
          label="Last dispatch"
          value={formatDate(metrics.lastDispatchDate)}
        />
      </div>
    </section>
  );
}

function OrdersTable({
  kind,
  rows,
}: {
  kind: "sale" | "purchase";
  rows: CustomerAnalysisOrderRow[];
}) {
  if (rows.length === 0) {
    return (
      <div className="table-wrap">
        <p className="empty-state">
          No {kind === "sale" ? "sale" : "purchase"} orders for this customer.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>{kind === "sale" ? "Sale order" : "Purchase order"}</th>
            <th>Status</th>
            <th className="num">Quantity</th>
            <th className="num">Dispatched</th>
            <th className="num">Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td>
                <Link
                  href={
                    kind === "sale"
                      ? `/orders/${o.id}`
                      : `/purchase-orders/${o.id}`
                  }
                >
                  {o.poNumber}
                </Link>
              </td>
              <td>
                {kind === "sale"
                  ? formatSaleOrderStatus(o.status)
                  : formatPurchaseOrderStatus(o.status)}
              </td>
              <td className="num">{formatMt(o.quantity)}</td>
              <td className="num">{formatMt(o.dispatchedOrder)}</td>
              <td className="num">{formatMt(o.balanceOrder)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CustomerAnalysisDetail({
  customer,
  saleSide,
  purchaseSide,
  saleOrders,
  purchaseOrders,
  dispatches,
  filters,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  const displayName = capitalizeName(customer.name) ?? customer.name;
  const location = [customer.city, customer.state].filter(Boolean).join(", ");
  const filenameBase = `customer-analysis-${displayName.replace(/\s+/g, "-").toLowerCase()}`;

  const masterDispatchHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("customerId", customer.id);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return `/reports/master-dispatch?${params.toString()}`;
  }, [customer.id, filters.dateFrom, filters.dateTo]);

  const overviewExport = useMemo(() => {
    const columns = [
      { key: "side", header: "Side" },
      { key: "orders", header: "Orders", align: "right" as const },
      { key: "balance", header: "Balance order" },
      { key: "dispatched", header: "Dispatched" },
      { key: "totalProfit", header: "Total profit" },
      { key: "avgProfit", header: "Avg profit / MT" },
      { key: "margin", header: "Margin" },
      { key: "lastDispatch", header: "Last dispatch" },
    ];
    const rows = [
      {
        side: "Sale",
        orders: String(saleSide.orderCount),
        balance: formatBalance(saleSide.balanceOrder),
        dispatched: formatVolume(saleSide.dispatchedVolume),
        totalProfit: formatRs(saleSide.totalProfit),
        avgProfit: formatRs(saleSide.avgProfitPerMt),
        margin: formatMargin(saleSide.marginPercent),
        lastDispatch: formatDate(saleSide.lastDispatchDate),
      },
      {
        side: "Purchase",
        orders: String(purchaseSide.orderCount),
        balance: formatBalance(purchaseSide.balanceOrder),
        dispatched: formatVolume(purchaseSide.dispatchedVolume),
        totalProfit: formatRs(purchaseSide.totalProfit),
        avgProfit: formatRs(purchaseSide.avgProfitPerMt),
        margin: formatMargin(purchaseSide.marginPercent),
        lastDispatch: formatDate(purchaseSide.lastDispatchDate),
      },
    ];
    return { columns, rows, title: `${displayName} — overview` };
  }, [displayName, saleSide, purchaseSide]);

  const saleOrdersExport = useMemo(
    () => ({
      columns: [
        { key: "poNumber", header: "Sale order" },
        { key: "status", header: "Status" },
        { key: "quantity", header: "Quantity", align: "right" as const },
        { key: "dispatched", header: "Dispatched", align: "right" as const },
        { key: "balance", header: "Balance", align: "right" as const },
      ],
      rows: saleOrders.map((o) => ({
        poNumber: o.poNumber,
        status: formatSaleOrderStatus(o.status),
        quantity: formatMt(o.quantity),
        dispatched: formatMt(o.dispatchedOrder),
        balance: formatMt(o.balanceOrder),
      })),
      title: `${displayName} — sale orders`,
    }),
    [displayName, saleOrders],
  );

  const purchaseOrdersExport = useMemo(
    () => ({
      columns: [
        { key: "poNumber", header: "Purchase order" },
        { key: "status", header: "Status" },
        { key: "quantity", header: "Quantity", align: "right" as const },
        { key: "dispatched", header: "Dispatched", align: "right" as const },
        { key: "balance", header: "Balance", align: "right" as const },
      ],
      rows: purchaseOrders.map((o) => ({
        poNumber: o.poNumber,
        status: formatPurchaseOrderStatus(o.status),
        quantity: formatMt(o.quantity),
        dispatched: formatMt(o.dispatchedOrder),
        balance: formatMt(o.balanceOrder),
      })),
      title: `${displayName} — purchase orders`,
    }),
    [displayName, purchaseOrders],
  );

  const dispatchesExport = useMemo(
    () => ({
      columns: [
        { key: "date", header: "Date" },
        { key: "side", header: "Side" },
        { key: "vessel", header: "Vessel" },
        { key: "salePo", header: "Sale order" },
        { key: "purchasePo", header: "Purchase order" },
        { key: "qty", header: "Qty (MT)", align: "right" as const },
        { key: "profit", header: "Profit", align: "right" as const },
      ],
      rows: dispatches.map((d) => ({
        date: formatDate(d.dispatchDate),
        side: d.side === "sale" ? "Sale" : "Purchase",
        vessel: d.vesselName,
        salePo: d.salePoNumber,
        purchasePo: d.purchasePoNumber,
        qty: formatDispatchMt(d.dispatchedQuantity),
        profit: formatRs(d.lineProfit),
      })),
      title: `${displayName} — dispatches`,
    }),
    [displayName, dispatches],
  );

  const activeExport =
    tab === "overview"
      ? overviewExport
      : tab === "sale-orders"
        ? saleOrdersExport
        : tab === "purchase-orders"
          ? purchaseOrdersExport
          : dispatchesExport;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "sale-orders", label: "Sale orders", count: saleOrders.length },
    {
      id: "purchase-orders",
      label: "Purchase orders",
      count: purchaseOrders.length,
    },
    { id: "dispatches", label: "Dispatches", count: dispatches.length },
  ];

  return (
    <div className="customer-analysis-detail">
      <Link href="/reports/customer-analysis" className="back-link">
        ← All customers
      </Link>

      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/reports/customer-analysis">Customer analysis</Link>
          </p>
          <h1 className="page-title">{displayName}</h1>
          <p className="page-subtitle">
            {formatCustomerCategory(customer.category)}
            {location ? ` · ${location}` : ""}
            {customer.active ? "" : " · Inactive"}
          </p>
        </div>
        <div className="detail-stat-row">
          <div className="detail-stat">
            <span className="detail-stat-label">Due</span>
            <span className="detail-stat-value">{formatRs(customer.due)}</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Sale balance</span>
            <span className="detail-stat-value">
              {formatMt(saleSide.balanceOrder)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Purchase balance</span>
            <span className="detail-stat-value">
              {formatMt(purchaseSide.balanceOrder)}
            </span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-label">Sale avg / MT</span>
            <span className="detail-stat-value">
              {formatRs(saleSide.avgProfitPerMt)}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-meta">
        <div className="detail-meta-item">
          <span className="detail-meta-label">Credit</span>
          <span className="detail-meta-value">
            {formatCreditPeriod(customer.creditDays)}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Sale executive</span>
          <span className="detail-meta-value">
            {customer.saleExecutive
              ? (capitalizeName(customer.saleExecutive) ??
                customer.saleExecutive)
              : "—"}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Owner</span>
          <span className="detail-meta-value">
            {customer.ownerName
              ? (capitalizeName(customer.ownerName) ?? customer.ownerName)
              : "—"}
            {customer.ownerContact ? ` · ${customer.ownerContact}` : ""}
          </span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Sector</span>
          <span className="detail-meta-value">{customer.sector || "—"}</span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Email</span>
          <span className="detail-meta-value">{customer.email || "—"}</span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-meta-label">Master dispatch</span>
          <span className="detail-meta-value">
            <Link href={masterDispatchHref}>Open filtered report</Link>
          </span>
        </div>
      </div>

      <form className="filters" method="get">
        <label>
          From
          <input type="date" name="dateFrom" defaultValue={filters.dateFrom} />
        </label>
        <label>
          To
          <input type="date" name="dateTo" defaultValue={filters.dateTo} />
        </label>
        <button type="submit" className="btn">
          Apply dates
        </button>
        {(filters.dateFrom || filters.dateTo) && (
          <Link
            href={`/reports/customer-analysis/${customer.id}`}
            className="btn-link"
          >
            Clear
          </Link>
        )}
        <TableDownloadButtons
          title={activeExport.title}
          filenameBase={`${filenameBase}-${tab}`}
          columns={activeExport.columns}
          rows={activeExport.rows}
        />
      </form>
      <p className="filter-hint">
        Dates filter dispatched volume, profit, margin, and last dispatch.
        Balance order is always the current open quantity.
      </p>

      <div className="ca-tabs" role="tablist" aria-label="Customer sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "ca-tab ca-tab-active" : "ca-tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count != null ? (
              <span className="ca-tab-count">{t.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="ca-overview">
          <div className="ca-sides">
            <SideBlock
              title="Sale side (buyer)"
              emptyLabel="No sale orders or dispatches for this customer."
              metrics={saleSide}
            />
            <SideBlock
              title="Purchase side (vendor)"
              emptyLabel="No purchase orders or dispatches for this customer."
              metrics={purchaseSide}
            />
          </div>
        </div>
      )}

      {tab === "sale-orders" && (
        <section className="analysis-section">
          <h2 className="analysis-section-title">Sale orders</h2>
          <OrdersTable kind="sale" rows={saleOrders} />
        </section>
      )}

      {tab === "purchase-orders" && (
        <section className="analysis-section">
          <h2 className="analysis-section-title">Purchase orders</h2>
          <OrdersTable kind="purchase" rows={purchaseOrders} />
        </section>
      )}

      {tab === "dispatches" && (
        <section className="analysis-section">
          <h2 className="analysis-section-title">Dispatches in range</h2>
          {dispatches.length === 0 ? (
            <div className="table-wrap">
              <p className="empty-state">No dispatches in this date range.</p>
            </div>
          ) : (
            <div className="table-wrap table-wrap-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Side</th>
                    <th>Vessel</th>
                    <th>Sale order</th>
                    <th>Purchase order</th>
                    <th className="num">Qty (MT)</th>
                    <th className="num">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatches.map((d) => (
                    <tr key={`${d.side}-${d.id}`}>
                      <td className="cell-date">{formatDate(d.dispatchDate)}</td>
                      <td>{d.side === "sale" ? "Sale" : "Purchase"}</td>
                      <td>{d.vesselName}</td>
                      <td>
                        {d.orderId ? (
                          <Link href={`/orders/${d.orderId}`}>
                            {d.salePoNumber}
                          </Link>
                        ) : (
                          d.salePoNumber
                        )}
                      </td>
                      <td>
                        {d.purchaseOrderId ? (
                          <Link href={`/purchase-orders/${d.purchaseOrderId}`}>
                            {d.purchasePoNumber}
                          </Link>
                        ) : (
                          d.purchasePoNumber
                        )}
                      </td>
                      <td className="num">
                        {formatDispatchMt(d.dispatchedQuantity)}
                      </td>
                      <td className="num">{formatRs(d.lineProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
