import Link from "next/link";
import {
  getHomeDispatchCharts,
  getHomeFundCharts,
  getHomeOverdueCharts,
  getHomeQualityStockLists,
  getHomeLatestActivity,
  getHomeTodayKpis,
  getTopCustomersByCoalOrigin,
} from "@/lib/actions/dashboard";
import { listOrdersWithBalance } from "@/lib/actions/orders";
import {
  listPurchaseOrdersWithBalance,
  suggestNextPurchasePoNumber,
} from "@/lib/actions/purchaseOrders";
import { listCustomers } from "@/lib/actions/customers";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import {
  suggestNextDispatchNumber,
  suggestNextPoNumber,
} from "@/lib/actions/dispatch";
import { formatDispatchMt } from "@/lib/domain/format";
import { getCurrentAccess } from "@/lib/auth/access";
import { canAccessPath } from "@/lib/auth/pages";
import { HomeQuickActions } from "@/components/HomeQuickActions";
import { LockedLink } from "@/components/LockedLink";
import { HomeDispatchSplitChart } from "@/components/HomeDispatchSplitChart";
import { HomeKpiStrip } from "@/components/HomeKpiStrip";
import { HomeLatestActivityStrip } from "@/components/HomeLatestActivityStrip";

function formatQty(value: string): string {
  return formatDispatchMt(value);
}

function bucketTotalForDay(
  buckets: { key: string; isCurrent: boolean; total: string }[],
  date: string,
): string {
  return (
    buckets.find((b) => b.key === date)?.total ??
    buckets.find((b) => b.isCurrent)?.total ??
    "0"
  );
}

function sumUnsoldQty(
  rows: { unsoldQty: string }[],
): string {
  let total = 0;
  for (const row of rows) {
    total += Number(row.unsoldQty) || 0;
  }
  return total.toString();
}

export default async function HomePage() {
  const access = await getCurrentAccess();
  const canOpen = (href: string) =>
    canAccessPath(access.kind === "none" ? [] : access.pageKeys, href);

  const overdueCharts = await getHomeOverdueCharts();
  const dispatchCharts = await getHomeDispatchCharts();
  const qualityStockLists = await getHomeQualityStockLists();

  const [
    todayKpis,
    latestActivity,
    fundCharts,
    topCustomersByCoal,
  ] = await Promise.all([
    getHomeTodayKpis(),
    getHomeLatestActivity(),
    getHomeFundCharts(),
    getTopCustomersByCoalOrigin(7),
  ]);

  const [customers, ports, vessels, qualityClasses] = await Promise.all([
    listCustomers({ activeOnly: true }),
    listPortOptions(),
    listVessels({ activeOnly: true }),
    listQualityClasses(),
  ]);

  const [suggestedPo, suggestedPurchasePo] = await Promise.all([
    suggestNextPoNumber(),
    suggestNextPurchasePoNumber(),
  ]);

  const [balanceOrders, balancePurchases] = await Promise.all([
    listOrdersWithBalance(),
    listPurchaseOrdersWithBalance(),
  ]);
  const [transporters, suggestedDispatchNumber] = await Promise.all([
    listTransporters(),
    suggestNextDispatchNumber(),
  ]);

  const monthlyDispatches = dispatchCharts.months;
  const dailyDispatches = dispatchCharts.days;
  const monthlyProfit = dispatchCharts.profitMonths;
  const dailyProfit = dispatchCharts.profitDays;
  const dailyFundsReceived = fundCharts.days;
  const dailyOverdue = overdueCharts.days;
  const topDomesticCustomers = topCustomersByCoal.last30.domestic;
  const topImportedCustomers = topCustomersByCoal.last30.imported;
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

      <HomeLatestActivityStrip
        purchaseSalesDate={latestActivity.purchaseSalesDate}
        paymentDate={latestActivity.paymentDate}
        discountDate={latestActivity.discountDate}
      />

      <HomeKpiStrip
        date={todayKpis.date}
        dispatchedQuantity={todayKpis.dispatchedQuantity}
        profit={todayKpis.profit}
        fundReceived={todayKpis.fundReceived}
        overdue={bucketTotalForDay(dailyOverdue, todayKpis.todayDate)}
        unsoldQuantity={sumUnsoldQty([
          ...domesticQualityStock,
          ...importedQualityStock,
        ])}
      />

      <section className="home-section">
        <div className="home-section-head">
          <h2 className="home-section-title">Quick links</h2>
        </div>
        <HomeQuickActions
          allowed={{
            orders: canOpen("/orders"),
            purchaseOrders: canOpen("/purchase-orders"),
            dispatches: canOpen("/dispatches"),
            customers: canOpen("/customers"),
            vessels: canOpen("/vessels"),
            qualities: canOpen("/qualities"),
            transporters: canOpen("/transporters"),
          }}
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
          suggestedDispatchNumber={suggestedDispatchNumber}
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

      <div className="home-dispatch-grid home-dispatch-grid-single">
        <HomeDispatchSplitChart
          eyebrow="Last 15 days"
          title="Overdue"
          buckets={dailyOverdue}
          valueKind="rupees"
          totalMode="left"
          hideTotals
          seriesLabels={{ left: "Overdue", total: "Total" }}
          ariaLabel="Day-wise overdue totals for the last 15 days"
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
          <HomeReportCard
            href="/reports/master-dispatch"
            allowed={canOpen("/reports/master-dispatch")}
            eyebrow="Dispatches"
            title="Master dispatch report"
            desc="Purchase, sale, freight, and basic-rate profit for every dispatch."
          />
          <HomeReportCard
            href="/reports/customer-analysis"
            allowed={canOpen("/reports/customer-analysis")}
            eyebrow="Customers"
            title="Customer analysis"
            desc="Buy and sell metrics, balance, margin, and dispatch profit per customer."
          />
          <HomeReportCard
            href="/reports/sales"
            allowed={canOpen("/reports/sales")}
            eyebrow="Sales"
            title="Sales Engine Report"
            desc="Purchaser contacts, order in hand, sold volume, and planned sales calls."
          />
          <HomeReportCard
            href="/reports/transport"
            allowed={canOpen("/reports/transport")}
            eyebrow="Transport"
            title="Transport Engine Report"
            desc="Dispatch freight, weight diffs, and transport document checklist."
          />
          <HomeReportCard
            href="/reports/vessel"
            allowed={canOpen("/reports/vessel")}
            eyebrow="Vessel"
            title="Vessel Report"
            desc="Order, dispatch, closing, and balance quantities by vessel, with linked purchase orders."
          />
          <HomeReportCard
            href="/reports/product"
            allowed={canOpen("/reports/product")}
            eyebrow="Product"
            title="Quality Report"
            desc="PO and SO balances by quality class, with unsold stock and vessel breakdown."
          />
        </div>
      </section>
    </div>
  );
}

function HomeReportCard({
  href,
  allowed,
  eyebrow,
  title,
  desc,
}: {
  href: string;
  allowed: boolean;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <LockedLink href={href} allowed={allowed} className="home-report-card">
      <p className="home-eyebrow">{eyebrow}</p>
      <h3 className="home-report-card-title">{title}</h3>
      <p className="home-report-card-desc">{desc}</p>
      <span className="home-report-card-cta">
        {allowed ? "Open report" : "No access"}
      </span>
    </LockedLink>
  );
}
