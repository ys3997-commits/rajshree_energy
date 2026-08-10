import Link from "next/link";
import {
  getHomeDispatchCharts,
  getHomeFundCharts,
  getHomeQualityStockLists,
  getTopCustomersByCoalOrigin,
  getTopPendingOrdersByCoalOrigin,
} from "@/lib/actions/dashboard";
import { listOrdersWithBalance } from "@/lib/actions/orders";
import { listPurchaseOrdersWithBalance, suggestNextPurchasePoNumber } from "@/lib/actions/purchaseOrders";
import { listCustomers } from "@/lib/actions/customers";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import { suggestNextPoNumber } from "@/lib/actions/dispatch";
import { formatDispatchMt } from "@/lib/domain/format";
import { HomeQuickActions } from "@/components/HomeQuickActions";
import { HomeDispatchSplitChart } from "@/components/HomeDispatchSplitChart";

function formatQty(value: string): string {
  return formatDispatchMt(value);
}

export default async function HomePage() {
  const [
    dispatchCharts,
    fundCharts,
    pendingOrdersByCoal,
    topCustomersByCoal,
    qualityStockLists,
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
    getHomeDispatchCharts(),
    getHomeFundCharts(),
    getTopPendingOrdersByCoalOrigin(10),
    getTopCustomersByCoalOrigin(7),
    getHomeQualityStockLists(),
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

  const monthlyDispatches = dispatchCharts.months;
  const dailyDispatches = dispatchCharts.days;
  const monthlyProfit = dispatchCharts.profitMonths;
  const dailyProfit = dispatchCharts.profitDays;
  const dailyFundsReceived = fundCharts.days;
  const pendingDomesticOrders = pendingOrdersByCoal.domestic;
  const pendingImportedOrders = pendingOrdersByCoal.imported;
  const topDomesticCustomers = topCustomersByCoal.last30.domestic;
  const topImportedCustomers = topCustomersByCoal.last30.imported;
  const topDomesticTotal = topCustomersByCoal.total.domestic;
  const topImportedTotal = topCustomersByCoal.total.imported;
  const domesticQualityStock = qualityStockLists.domestic;
  const importedQualityStock = qualityStockLists.imported;

  const maxDomestic = Math.max(
    ...topDomesticCustomers.map((c) => Number(c.volume) || 0),
    0,
  );
  const maxImported = Math.max(
    ...topImportedCustomers.map((c) => Number(c.volume) || 0),
    0,
  );
  const maxDomesticTotal = Math.max(
    ...topDomesticTotal.map((c) => Number(c.volume) || 0),
    0,
  );
  const maxImportedTotal = Math.max(
    ...topImportedTotal.map((c) => Number(c.volume) || 0),
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
            Dispatch, profit, and fund pulse, pending balances, and top movers.
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

      <div className="home-dispatch-grid">
        <HomeDispatchSplitChart
          eyebrow="Last 6 months"
          title="Monthly Dispatch"
          buckets={monthlyDispatches}
          ariaLabel="Month-wise domestic and imported dispatch totals"
        />
        <HomeDispatchSplitChart
          eyebrow="Last 7 days"
          title="Daily Dispatch"
          buckets={dailyDispatches}
          ariaLabel="Day-wise domestic and imported dispatch totals"
        />
      </div>

      <div className="home-dispatch-grid">
        <HomeDispatchSplitChart
          eyebrow="Last 6 months · basic-rate margin"
          title="Monthly Profit"
          buckets={monthlyProfit}
          valueKind="rupees"
          ariaLabel="Month-wise domestic and imported profit totals"
        />
        <HomeDispatchSplitChart
          eyebrow="Last 7 days · basic-rate margin"
          title="Daily Profit"
          buckets={dailyProfit}
          valueKind="rupees"
          ariaLabel="Day-wise domestic and imported profit totals"
        />
      </div>

      <div className="home-dispatch-grid home-dispatch-grid-single">
        <HomeDispatchSplitChart
          eyebrow="Last 15 days"
          title="Fund Received"
          buckets={dailyFundsReceived}
          valueKind="rupees"
          totalMode="left"
          hideTotals
          seriesLabels={{ left: "Received", total: "Total" }}
          ariaLabel="Day-wise fund received totals for the last 15 days"
        />
      </div>

      <div className="home-grid">
        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">Last 30 days · volume</p>
              <h2 className="home-panel-title">Top Domestic Coal Buyer</h2>
            </div>
            <Link href="/customers" className="home-panel-link">
              Customers
            </Link>
          </div>

          {topDomesticCustomers.length === 0 ? (
            <p className="home-empty">No domestic dispatches in the last month.</p>
          ) : (
            <ul className="home-rank-list">
              {topDomesticCustomers.map((customer, index) => {
                const volume = Number(customer.volume) || 0;
                const width =
                  maxDomestic > 0 ? (volume / maxDomestic) * 100 : 0;
                return (
                  <li key={customer.id}>
                    <div className="home-rank-row home-rank-row-static">
                      <span className="home-rank-index">{index + 1}</span>
                      <span className="home-rank-main">
                        <span className="home-rank-title">{customer.name}</span>
                        <span className="home-inline-bar" aria-hidden="true">
                          <span style={{ width: `${width}%` }} />
                        </span>
                      </span>
                      <span className="home-rank-metric">
                        <span className="home-rank-metric-value">
                          {formatQty(customer.volume)}
                        </span>
                        <span className="home-rank-metric-label">volume</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">Last 30 days · volume</p>
              <h2 className="home-panel-title">Top Imported Coal Buyer</h2>
            </div>
            <Link href="/customers" className="home-panel-link">
              Customers
            </Link>
          </div>

          {topImportedCustomers.length === 0 ? (
            <p className="home-empty">No imported dispatches in the last month.</p>
          ) : (
            <ul className="home-rank-list">
              {topImportedCustomers.map((customer, index) => {
                const volume = Number(customer.volume) || 0;
                const width =
                  maxImported > 0 ? (volume / maxImported) * 100 : 0;
                return (
                  <li key={customer.id}>
                    <div className="home-rank-row home-rank-row-static">
                      <span className="home-rank-index">{index + 1}</span>
                      <span className="home-rank-main">
                        <span className="home-rank-title">{customer.name}</span>
                        <span className="home-inline-bar" aria-hidden="true">
                          <span style={{ width: `${width}%` }} />
                        </span>
                      </span>
                      <span className="home-rank-metric">
                        <span className="home-rank-metric-value">
                          {formatQty(customer.volume)}
                        </span>
                        <span className="home-rank-metric-label">volume</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="home-grid" style={{ marginTop: "1.25rem" }}>
        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">All time · total volume</p>
              <h2 className="home-panel-title">Top Domestic Coal Buyer</h2>
            </div>
            <Link href="/customers" className="home-panel-link">
              Customers
            </Link>
          </div>

          {topDomesticTotal.length === 0 ? (
            <p className="home-empty">No domestic dispatches yet.</p>
          ) : (
            <ul className="home-rank-list">
              {topDomesticTotal.map((customer, index) => {
                const volume = Number(customer.volume) || 0;
                const width =
                  maxDomesticTotal > 0 ? (volume / maxDomesticTotal) * 100 : 0;
                return (
                  <li key={customer.id}>
                    <div className="home-rank-row home-rank-row-static">
                      <span className="home-rank-index">{index + 1}</span>
                      <span className="home-rank-main">
                        <span className="home-rank-title">{customer.name}</span>
                        <span className="home-inline-bar" aria-hidden="true">
                          <span style={{ width: `${width}%` }} />
                        </span>
                      </span>
                      <span className="home-rank-metric">
                        <span className="home-rank-metric-value">
                          {formatQty(customer.volume)}
                        </span>
                        <span className="home-rank-metric-label">
                          total volume
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">All time · total volume</p>
              <h2 className="home-panel-title">Top Imported Coal Buyer</h2>
            </div>
            <Link href="/customers" className="home-panel-link">
              Customers
            </Link>
          </div>

          {topImportedTotal.length === 0 ? (
            <p className="home-empty">No imported dispatches yet.</p>
          ) : (
            <ul className="home-rank-list">
              {topImportedTotal.map((customer, index) => {
                const volume = Number(customer.volume) || 0;
                const width =
                  maxImportedTotal > 0 ? (volume / maxImportedTotal) * 100 : 0;
                return (
                  <li key={customer.id}>
                    <div className="home-rank-row home-rank-row-static">
                      <span className="home-rank-index">{index + 1}</span>
                      <span className="home-rank-main">
                        <span className="home-rank-title">{customer.name}</span>
                        <span className="home-inline-bar" aria-hidden="true">
                          <span style={{ width: `${width}%` }} />
                        </span>
                      </span>
                      <span className="home-rank-metric">
                        <span className="home-rank-metric-value">
                          {formatQty(customer.volume)}
                        </span>
                        <span className="home-rank-metric-label">
                          total volume
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="home-grid" style={{ marginTop: "1.25rem" }}>
        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">PO − SO balances</p>
              <h2 className="home-panel-title">Domestic Coal Stock</h2>
            </div>
            <Link href="/reports/product" className="home-panel-link">
              Quality report
            </Link>
          </div>

          {domesticQualityStock.length === 0 ? (
            <p className="home-empty">No domestic quality stock to show.</p>
          ) : (
            <ul className="home-quality-list">
              {domesticQualityStock.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/reports/product/${row.id}`}
                    className="home-quality-row"
                  >
                    <div className="home-quality-name">
                      <span className="home-quality-origin">
                        {row.origin} - {row.quality}
                      </span>
                    </div>
                    <div className="home-quality-metrics">
                      <div className="home-quality-metric">
                        <span className="home-quality-metric-value">
                          {formatQty(row.stockInHand)}
                        </span>
                        <span className="home-quality-metric-label">
                          Stock in hand
                        </span>
                      </div>
                      <div className="home-quality-metric">
                        <span className="home-quality-metric-value">
                          {formatQty(row.orderInHand)}
                        </span>
                        <span className="home-quality-metric-label">
                          Order in hand
                        </span>
                      </div>
                      <div className="home-quality-metric">
                        <span className="home-quality-metric-value">
                          {formatQty(row.unsoldQty)}
                        </span>
                        <span className="home-quality-metric-label">
                          Unsold qty
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="home-panel">
          <div className="home-panel-head">
            <div>
              <p className="home-eyebrow">PO − SO balances</p>
              <h2 className="home-panel-title">Imported Coal Stock</h2>
            </div>
            <Link href="/reports/product" className="home-panel-link">
              Quality report
            </Link>
          </div>

          {importedQualityStock.length === 0 ? (
            <p className="home-empty">No imported quality stock to show.</p>
          ) : (
            <ul className="home-quality-list">
              {importedQualityStock.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/reports/product/${row.id}`}
                    className="home-quality-row"
                  >
                    <div className="home-quality-name">
                      <span className="home-quality-origin">
                        {row.origin} - {row.quality}
                      </span>
                    </div>
                    <div className="home-quality-metrics">
                      <div className="home-quality-metric">
                        <span className="home-quality-metric-value">
                          {formatQty(row.stockInHand)}
                        </span>
                        <span className="home-quality-metric-label">
                          Stock in hand
                        </span>
                      </div>
                      <div className="home-quality-metric">
                        <span className="home-quality-metric-value">
                          {formatQty(row.orderInHand)}
                        </span>
                        <span className="home-quality-metric-label">
                          Order in hand
                        </span>
                      </div>
                      <div className="home-quality-metric">
                        <span className="home-quality-metric-value">
                          {formatQty(row.unsoldQty)}
                        </span>
                        <span className="home-quality-metric-label">
                          Unsold qty
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

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
          <Link href="/reports/sales" className="home-report-card">
            <p className="home-eyebrow">Sales</p>
            <h3 className="home-report-card-title">Sales Engine Report</h3>
            <p className="home-report-card-desc">
              Purchaser contacts, order in hand, sold volume, and planned sales
              calls.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
          <Link href="/reports/transport" className="home-report-card">
            <p className="home-eyebrow">Transport</p>
            <h3 className="home-report-card-title">Transport Engine Report</h3>
            <p className="home-report-card-desc">
              Dispatch freight, weight diffs, and transport document checklist.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
          <Link href="/reports/vessel" className="home-report-card">
            <p className="home-eyebrow">Vessel</p>
            <h3 className="home-report-card-title">Vessel Report</h3>
            <p className="home-report-card-desc">
              Order, dispatch, closing, and balance quantities by vessel, with
              linked purchase orders.
            </p>
            <span className="home-report-card-cta">Open report</span>
          </Link>
          <Link href="/reports/product" className="home-report-card">
            <p className="home-eyebrow">Product</p>
            <h3 className="home-report-card-title">Quality Report</h3>
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
              <p className="home-eyebrow">Largest balance first · top 10</p>
              <h2 className="home-panel-title">Top Domestic Coal</h2>
            </div>
            <Link href="/orders?status=RUNNING" className="home-panel-link">
              View all
            </Link>
          </div>

          {pendingDomesticOrders.length === 0 ? (
            <p className="home-empty">No pending domestic orders right now.</p>
          ) : (
            <ul className="home-rank-list">
              {pendingDomesticOrders.map((order, index) => (
                <li key={order.id}>
                  <Link href={`/orders/${order.id}`} className="home-rank-row">
                    <span className="home-rank-index">{index + 1}</span>
                    <span className="home-rank-main">
                      <span className="home-rank-title">{order.customerName}</span>
                      <span className="home-rank-meta">
                        {order.poNumber}
                        <span className="home-dot" />
                        Running
                      </span>
                    </span>
                    <span className="home-rank-metric">
                      <span className="home-rank-metric-value">
                        {formatQty(order.balance)}
                      </span>
                      <span className="home-rank-metric-label">balance</span>
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
              <p className="home-eyebrow">Largest balance first · top 10</p>
              <h2 className="home-panel-title">Top Imported Coal</h2>
            </div>
            <Link href="/orders?status=RUNNING" className="home-panel-link">
              View all
            </Link>
          </div>

          {pendingImportedOrders.length === 0 ? (
            <p className="home-empty">No pending imported orders right now.</p>
          ) : (
            <ul className="home-rank-list">
              {pendingImportedOrders.map((order, index) => (
                <li key={order.id}>
                  <Link href={`/orders/${order.id}`} className="home-rank-row">
                    <span className="home-rank-index">{index + 1}</span>
                    <span className="home-rank-main">
                      <span className="home-rank-title">{order.customerName}</span>
                      <span className="home-rank-meta">
                        {order.poNumber}
                        <span className="home-dot" />
                        Running
                      </span>
                    </span>
                    <span className="home-rank-metric">
                      <span className="home-rank-metric-value">
                        {formatQty(order.balance)}
                      </span>
                      <span className="home-rank-metric-label">balance</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
