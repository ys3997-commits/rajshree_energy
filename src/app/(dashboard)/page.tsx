import Link from "next/link";
import {
  getDispatchTotalsLast5Days,
  getTopCustomersByVolumeLastMonth,
  getTopPendingOrdersByBalance,
} from "@/lib/actions/dashboard";
import { listOrdersWithBalance } from "@/lib/actions/orders";
import { listPurchaseOrdersWithBalance, suggestNextPurchasePoNumber } from "@/lib/actions/purchaseOrders";
import { listCustomers } from "@/lib/actions/customers";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import { suggestNextPoNumber } from "@/lib/actions/dispatch";
import { formatDispatchMt, formatMt } from "@/lib/domain/format";
import { HomeQuickActions } from "@/components/HomeQuickActions";

function formatQty(value: string): string {
  return formatMt(value);
}

export default async function HomePage() {
  const [
    dailyDispatches,
    pendingOrders,
    topCustomers,
    customers,
    ports,
    balanceOrders,
    balancePurchases,
    vessels,
    transporters,
    qualityClasses,
    suggestedPo,
    suggestedPurchasePo,
  ] = await Promise.all([
    getDispatchTotalsLast5Days(),
    getTopPendingOrdersByBalance(5),
    getTopCustomersByVolumeLastMonth(5),
    listCustomers({ activeOnly: true }),
    listPortOptions(),
    listOrdersWithBalance(),
    listPurchaseOrdersWithBalance(),
    listVessels({ activeOnly: true }),
    listTransporters(),
    listQualityClasses(),
    suggestNextPoNumber(),
    suggestNextPurchasePoNumber(),
  ]);

  const maxDay = Math.max(
    ...dailyDispatches.map((d) => Number(d.total) || 0),
    0,
  );
  const maxCustomer = Math.max(
    ...topCustomers.map((c) => Number(c.volume) || 0),
    0,
  );
  const weekTotal = dailyDispatches.reduce(
    (sum, d) => sum + (Number(d.total) || 0),
    0,
  );

  const customerOpts = customers.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    creditDays: c.creditDays,
  }));
  const importerOpts = customers.map((c) => ({ id: c.id, name: c.name }));
  const portOpts = ports.map((p) => ({ id: p.id, name: p.name }));
  const qualityClassOpts = qualityClasses.map((qc) => ({
    id: qc.id,
    domestic: qc.domestic,
    origin: qc.origin,
    qualityOption: qc.qualityOption,
  }));

  return (
    <div className="home">
      <div className="page-header">
        <div>
          <h1 className="page-title">Home</h1>
          <p className="page-subtitle">
            Dispatch pulse, pending balances, and top movers.
          </p>
        </div>
      </div>

      <section className="home-section">
        <div className="home-section-head">
          <h2 className="home-section-title">Quick links</h2>
        </div>
        <HomeQuickActions
          customers={customerOpts}
          importers={importerOpts}
          ports={portOpts}
          orders={balanceOrders.map((o) => ({
            poNumber: o.poNumber,
            balanceOrder: o.balanceOrder?.toString() ?? null,
            rate: o.rate?.toString() ?? null,
            customer: o.customer,
          }))}
          purchaseOrders={balancePurchases.map((p) => ({
            poNumber: p.poNumber,
            balanceOrder: p.balanceOrder?.toString() ?? null,
            rate: p.rate?.toString() ?? null,
            importer: p.importer,
            vessel: p.vessel,
            qualityClass: p.qualityClass,
          }))}
          vessels={vessels.map((v) => ({
            id: v.id,
            vesselName: v.vesselName,
            qualityClassId: v.qualityClassId,
            qualityClass: v.qualityClass,
            port: v.port,
          }))}
          transporters={transporters.map((t) => ({ id: t.id, name: t.name }))}
          qualityClasses={qualityClassOpts}
          suggestedPo={suggestedPo}
          suggestedPurchasePo={suggestedPurchasePo}
        />
      </section>

      <section className="home-panel home-panel-dispatch">
        <div className="home-panel-head">
          <div>
            <p className="home-eyebrow">Last 5 days</p>
            <h2 className="home-panel-title">Dispatches</h2>
          </div>
          <div className="home-stat">
            <span className="home-stat-label">Total</span>
            <span className="home-stat-value">{formatDispatchMt(weekTotal)}</span>
          </div>
        </div>

        <div className="home-bars" role="img" aria-label="Day-wise dispatch totals">
          {dailyDispatches.map((day) => {
            const value = Number(day.total) || 0;
            const height =
              maxDay > 0 ? Math.max((value / maxDay) * 100, value > 0 ? 6 : 0) : 0;
            return (
              <div
                key={day.date}
                className={`home-bar-col${day.isToday ? " is-today" : ""}`}
              >
                <div className="home-bar-value">
                  {value > 0 ? formatDispatchMt(day.total) : "—"}
                </div>
                <div className="home-bar-track">
                  <div
                    className="home-bar-fill"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="home-bar-label">{day.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2 className="home-section-title">Reports</h2>
        </div>
        <div className="home-report-grid">
          <Link href="/reports/master-dispatch" className="home-report-card">
            <p className="home-eyebrow">Dispatches</p>
            <h3 className="home-report-card-title">Master dispatch report</h3>
            <p className="home-report-card-desc">
              Purchase, sale, freight, and basic-rate profit for every
              dispatch.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
          <Link href="/reports/customer-analysis" className="home-report-card">
            <p className="home-eyebrow">Customers</p>
            <h3 className="home-report-card-title">Customer analysis</h3>
            <p className="home-report-card-desc">
              Buy and sell metrics, balance, margin, and dispatch profit per
              customer.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
          <Link href="/reports/sales-engine" className="home-report-card">
            <p className="home-eyebrow">Sales</p>
            <h3 className="home-report-card-title">Sales engine</h3>
            <p className="home-report-card-desc">
              Purchaser contacts, order in hand, sold volume, and planned sales
              calls.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
          <Link href="/reports/transport-engine" className="home-report-card">
            <p className="home-eyebrow">Transport</p>
            <h3 className="home-report-card-title">Transport engine</h3>
            <p className="home-report-card-desc">
              Dispatch freight, weight diffs, and transport document checklist.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
          <Link href="/reports/vessel-report" className="home-report-card">
            <p className="home-eyebrow">Vessels</p>
            <h3 className="home-report-card-title">Vessel report</h3>
            <p className="home-report-card-desc">
              Order, dispatch, closing, and balance quantities by vessel, with
              linked purchase orders.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
          <Link href="/reports/quality-report" className="home-report-card">
            <p className="home-eyebrow">Quality</p>
            <h3 className="home-report-card-title">Quality report</h3>
            <p className="home-report-card-desc">
              PO and SO balances by quality class, with unsold stock and vessel
              breakdown.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
        </div>
      </section>

      <div className="home-grid">
        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">Largest balance first</p>
              <h2 className="home-panel-title">Pending orders</h2>
            </div>
            <Link href="/orders?status=RUNNING" className="home-panel-link">
              View all
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="home-empty">No pending balances right now.</p>
          ) : (
            <ul className="home-rank-list">
              {pendingOrders.map((order, index) => (
                <li key={order.id}>
                  <Link href={`/orders/${order.id}`} className="home-rank-row">
                    <span className="home-rank-index">{index + 1}</span>
                    <span className="home-rank-main">
                      <span className="home-rank-title">{order.poNumber}</span>
                      <span className="home-rank-meta">
                        {order.customerName}
                        <span className="home-dot" />
                        Running
                      </span>
                    </span>
                    <span className="home-rank-metric">
                      <span className="home-rank-metric-value">
                        {formatQty(order.balance)}
                      </span>
                      <span className="home-rank-metric-label">MT balance</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">Last 30 days</p>
              <h2 className="home-panel-title">Top customers</h2>
            </div>
            <Link href="/customers" className="home-panel-link">
              Customers
            </Link>
          </div>

          {topCustomers.length === 0 ? (
            <p className="home-empty">No dispatches in the last month.</p>
          ) : (
            <ul className="home-rank-list">
              {topCustomers.map((customer, index) => {
                const volume = Number(customer.volume) || 0;
                const width =
                  maxCustomer > 0 ? (volume / maxCustomer) * 100 : 0;
                return (
                  <li key={customer.id}>
                    <div className="home-rank-row home-rank-row-static">
                      <span className="home-rank-index">{index + 1}</span>
                      <span className="home-rank-main">
                        <span className="home-rank-title">{customer.name}</span>
                        <span
                          className="home-inline-bar"
                          aria-hidden="true"
                        >
                          <span style={{ width: `${width}%` }} />
                        </span>
                      </span>
                      <span className="home-rank-metric">
                        <span className="home-rank-metric-value">
                          {formatQty(customer.volume)}
                        </span>
                        <span className="home-rank-metric-label">MT volume</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
