import Link from "next/link";
import type { HomeVendorBalances } from "@/lib/actions/dashboard";
import { capitalizeName, formatRs } from "@/lib/domain/format";

function vendorLabel(name: string): string {
  return capitalizeName(name) ?? name;
}

/** Format a positive magnitude as a negative rupee amount (liability). */
function formatPayable(value: string | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return formatRs("0");
  return formatRs((-Math.abs(n)).toString());
}

export function HomeVendorBalancesPanel({
  balances,
}: {
  balances: HomeVendorBalances;
}) {
  const { payable, advance } = balances;

  return (
    <div className="home-grid home-vendor-balances">
      <section
        className="home-panel home-vendor-panel"
        aria-label="Liability to pay to vendor"
      >
        <div className="home-panel-head">
          <div>
            <h2 className="home-panel-title">Liability to Vendor</h2>
          </div>
          <Link href="/reports/collection/vendor" className="home-panel-link">
            Vendor Collection
          </Link>
        </div>

        {payable.length === 0 ? (
          <p className="home-empty">No vendor liability to show.</p>
        ) : (
          <ul className="home-vendor-list">
            <li className="home-vendor-totals-row" aria-label="Payable totals">
              <span className="home-vendor-totals-spacer" aria-hidden="true" />
              <div className="home-vendor-metrics">
                <div className="home-vendor-total">
                  <span className="home-vendor-total-label">Total Due</span>
                  <span className="home-vendor-total-value is-payable">
                    {formatPayable(balances.payableTotal)}
                  </span>
                </div>
                <div className="home-vendor-total">
                  <span className="home-vendor-total-label">Overdue</span>
                  <span className="home-vendor-total-value is-overdue">
                    {formatPayable(balances.payableOverdueTotal)}
                  </span>
                </div>
              </div>
            </li>
            {payable.map((row) => {
              const overdue = Number(row.overdue) || 0;
              return (
                <li key={row.id}>
                  <Link
                    href={`/reports/customer-analysis/${row.id}`}
                    className="home-vendor-row"
                  >
                    <div className="home-vendor-main">
                      <span className="home-vendor-name">
                        {vendorLabel(row.name)}
                      </span>
                    </div>
                    <div className="home-vendor-metrics">
                      <div className="home-vendor-metric">
                        <span className="home-vendor-metric-value is-payable">
                          {formatPayable(row.due)}
                        </span>
                      </div>
                      <div className="home-vendor-metric">
                        <span
                          className={
                            overdue > 0
                              ? "home-vendor-metric-value is-overdue"
                              : "home-vendor-metric-value"
                          }
                        >
                          {formatPayable(row.overdue ?? "0")}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        className="home-panel home-vendor-panel"
        aria-label="Paid in advance to vendor"
      >
        <div className="home-panel-head">
          <div>
            <h2 className="home-panel-title">Advance to Vendor</h2>
          </div>
          <Link href="/reports/collection/vendor" className="home-panel-link">
            Vendor Collection
          </Link>
        </div>

        {advance.length === 0 ? (
          <p className="home-empty">No vendor advance to show.</p>
        ) : (
          <ul className="home-vendor-list">
            <li className="home-vendor-totals-row" aria-label="Advance total">
              <span className="home-vendor-totals-spacer" aria-hidden="true" />
              <div className="home-vendor-metrics">
                <div className="home-vendor-total">
                  <span className="home-vendor-total-label">
                    Advance Payment
                  </span>
                  <span className="home-vendor-total-value is-advance">
                    {formatRs(balances.advanceTotal)}
                  </span>
                </div>
              </div>
            </li>
            {advance.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/reports/customer-analysis/${row.id}`}
                  className="home-vendor-row"
                >
                  <div className="home-vendor-main">
                    <span className="home-vendor-name">
                      {vendorLabel(row.name)}
                    </span>
                  </div>
                  <div className="home-vendor-metrics">
                    <div className="home-vendor-metric">
                      <span className="home-vendor-metric-value is-advance">
                        {formatRs(row.due)}
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
  );
}
