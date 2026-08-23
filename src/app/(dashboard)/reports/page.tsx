import { LockedLink } from "@/components/LockedLink";
import { getCurrentAccess } from "@/lib/auth/access";
import { canAccessPath } from "@/lib/auth/pages";

/** Sorted alphabetically by title. */
const reports = [
  {
    href: "/reports/ageing-report",
    title: "Ageing Report",
    desc: "Customer outstanding split by 10-day due buckets.",
  },
  {
    href: "/reports/collection",
    title: "Collection Engine",
    desc: "Buyer collection balances and planned calls.",
  },
  {
    href: "/reports/customer-analysis",
    title: "Customer Analysis",
    desc: "Customer-level orders, payments, and balance analysis.",
  },
  {
    href: "/reports/dispatch-analysis",
    title: "Dispatch Analysis",
    desc: "Purchase, sale, freight, and basic-rate profit for every dispatch.",
  },
  {
    href: "/reports/vendor-analysis",
    title: "Vendor Analysis",
    desc: "Vendor-level purchase volume, due, and margin analysis.",
  },
  {
    href: "/reports/analysis",
    title: "Sale Analysis",
    desc: "Sale-side dispatched quantity by product, state, and city.",
  },
  {
    href: "/reports/profit-analysis",
    title: "Profit Analysis",
    desc: "Day-wise domestic and imported quantity and profit.",
  },
  {
    href: "/reports/ledger",
    title: "Ledger",
    desc: "Customer ledger of dues, payments, and discounts.",
  },
  {
    href: "/reports/master-dispatch",
    title: "Dispatch Register",
    desc: "Purchase, sale, freight, and basic-rate profit for every dispatch.",
  },
  {
    href: "/reports/product",
    title: "Quality Report",
    desc: "Purchase and sale balances by quality class, with unsold stock.",
  },
  {
    href: "/reports/purchase",
    title: "Purchase",
    desc: "Purchase report overview.",
  },
  {
    href: "/reports/sales",
    title: "Sales Engine Report",
    desc: "Purchaser contacts, order in hand, sold volume, and planned sales calls.",
  },
  {
    href: "/reports/transport",
    title: "Transport Engine Report",
    desc: "Dispatch freight, weight diffs, and transport document checklist.",
  },
  {
    href: "/reports/transport/due",
    title: "Transport Due",
    desc: "Outstanding freight balances with transporters.",
  },
  {
    href: "/reports/collection/vendor",
    title: "Vendor Collection",
    desc: "Supplier collection balances and outstanding dues.",
  },
  {
    href: "/reports/vessel",
    title: "Vessel Report",
    desc: "Order, dispatch, closing, and balance quantities by vessel.",
  },
  {
    href: "/reports/vessel/supplied",
    title: "Vessel Supplied",
    desc: "Total, industry, and trader/vendor supplied quantities by vessel.",
  },
].sort((a, b) => a.title.localeCompare(b.title));

export default async function ReportsPage() {
  const access = await getCurrentAccess();
  const keys = access.kind === "none" ? [] : access.pageKeys;
  return (
    <div className="page-stack">
      <div className="page-header">
        <h1 className="page-title">Report</h1>
      </div>

      <div className="home-report-grid">
        {reports.map((report) => (
          <LockedLink
            key={report.href}
            href={report.href}
            allowed={canAccessPath(keys, report.href)}
            className="home-report-card"
          >
            <h3 className="home-report-card-title">{report.title}</h3>
            <p className="home-report-card-desc">{report.desc}</p>
            <span className="home-report-card-cta">
              {canAccessPath(keys, report.href) ? "Open report" : "No access"}
            </span>
          </LockedLink>
        ))}
      </div>
    </div>
  );
}
