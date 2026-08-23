import { formatRs } from "@/lib/domain/format";

export function FundFlowTotals({
  receivedLabel,
  paidLabel,
  received,
  paid,
  net,
}: {
  receivedLabel: string;
  paidLabel: string;
  received: string;
  paid: string;
  net: string;
}) {
  return (
    <div className="detail-stat-row fund-flow-totals">
      <div className="detail-stat">
        <span className="detail-stat-label">{receivedLabel}</span>
        <span className="detail-stat-value fund-type-in">
          {formatRs(received)}
        </span>
      </div>
      <div className="detail-stat">
        <span className="detail-stat-label">{paidLabel}</span>
        <span className="detail-stat-value fund-type-out">
          {formatRs(paid)}
        </span>
      </div>
      <div className="detail-stat">
        <span className="detail-stat-label">Net</span>
        <span
          className={
            Number(net) < 0
              ? "detail-stat-value fund-type-out"
              : "detail-stat-value fund-type-in"
          }
        >
          {formatRs(net)}
        </span>
      </div>
    </div>
  );
}
