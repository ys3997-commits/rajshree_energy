import Link from "next/link";
import {
  getDispatchTotalsLast5Days,
  getTopCustomersByVolumeLastMonth,
  getTopPendingOrdersByBalance,
} from "@/lib/actions/dashboard";
import { listOrdersWithBalance } from "@/lib/actions/orders";
import { listPurchaseOrdersWithBalance, suggestNextPurchasePoNumber } from "@/lib/actions/purchaseOrders";
import { listCustomers } from "@/lib/actions/customers";
import { listStaff } from "@/lib/actions/staff";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import { suggestNextPoNumber } from "@/lib/actions/dispatch";
import { HomeQuickActions } from "@/components/HomeQuickActions";

function formatQty(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 3 });
}

function formatQtyMt(value: string): string {
  return formatQty(value);
}

export default async function HomePage() {
  const [
    dailyDispatches,
    pendingOrders,
    topCustomers,
    customers,
    staff,
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
    listStaff(),
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
  const staffOpts = staff.map((s) => ({ id: s.id, name: s.name }));
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
          staff={staffOpts}
          ports={portOpts}
          orders={balanceOrders.map((o) => ({
            poNumber: o.poNumber,
            balanceOrder: o.balanceOrder?.toString() ?? null,
            customer: o.customer,
          }))}
          purchaseOrders={balancePurchases.map((p) => ({
            poNumber: p.poNumber,
            balanceOrder: p.balanceOrder?.toString() ?? null,
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
            <span className="home-stat-label">Total (MT)</span>
            <span className="home-stat-value">{formatQtyMt(String(weekTotal))}</span>
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
                  {value > 0 ? formatQtyMt(day.total) : "—"}
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

      <div className="home-grid">
        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">Largest balance first</p>
              <h2 className="home-panel-title">Pending orders</h2>
            </div>
            <Link href="/orders?status=PENDING" className="home-panel-link">
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
                        {order.orderStatus === "PARTIALLY_DISPATCHED"
                          ? "Partial"
                          : "Pending"}
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
