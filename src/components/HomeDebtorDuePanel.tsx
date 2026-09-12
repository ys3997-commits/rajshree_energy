import type { HomeDebtorDueByCoal } from "@/lib/actions/dashboard";
import { formatRs } from "@/lib/domain/format";

function formatShare(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0%";
  return `${n}%`;
}

export function HomeDebtorDuePanel({ due }: { due: HomeDebtorDueByCoal }) {
  const total = Number(due.total) || 0;

  return (
    <section className="home-panel home-debtor-panel" aria-label="Due in debtors">
      <div className="home-panel-head">
        <h2 className="home-panel-title">Due in Debtors</h2>
      </div>

      {total <= 0 ? (
        <p className="home-empty">No debtor due to show.</p>
      ) : (
        <div className="home-debtor-metrics">
          <div className="home-debtor-metric is-total">
            <span className="home-debtor-metric-label">Total due</span>
            <div className="home-debtor-row">
              <span className="home-debtor-metric-value">{formatRs(due.total)}</span>
              <span className="home-debtor-metric-share">100%</span>
            </div>
          </div>
          <div className="home-debtor-metric is-domestic">
            <span className="home-debtor-metric-label">
              <span className="home-legend-swatch is-domestic" aria-hidden="true" />
              Domestic coal
            </span>
            <div className="home-debtor-row">
              <span className="home-debtor-metric-value">{formatRs(due.domestic)}</span>
              <span className="home-debtor-metric-share">
                {formatShare(due.domesticPercent)}
              </span>
            </div>
          </div>
          <div className="home-debtor-metric is-imported">
            <span className="home-debtor-metric-label">
              <span className="home-legend-swatch is-imported" aria-hidden="true" />
              Imported coal
            </span>
            <div className="home-debtor-row">
              <span className="home-debtor-metric-value">{formatRs(due.imported)}</span>
              <span className="home-debtor-metric-share">
                {formatShare(due.importedPercent)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
