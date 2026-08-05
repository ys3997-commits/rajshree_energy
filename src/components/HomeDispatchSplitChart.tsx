import { formatMt } from "@/lib/domain/format";
import type { DispatchSplitBucket } from "@/lib/actions/dashboard";

type Props = {
  eyebrow: string;
  title: string;
  buckets: DispatchSplitBucket[];
  ariaLabel: string;
};

function sumField(
  buckets: DispatchSplitBucket[],
  field: "domestic" | "imported" | "total",
): number {
  return buckets.reduce((sum, b) => sum + (Number(b[field]) || 0), 0);
}

function barHeight(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max((value / max) * 100, 8);
}

export function HomeDispatchSplitChart({
  eyebrow,
  title,
  buckets,
  ariaLabel,
}: Props) {
  const total = sumField(buckets, "total");
  const domesticTotal = sumField(buckets, "domestic");
  const importedTotal = sumField(buckets, "imported");
  const maxValue = Math.max(
    ...buckets.flatMap((b) => [
      Number(b.domestic) || 0,
      Number(b.imported) || 0,
    ]),
    0,
  );

  return (
    <section className="home-panel home-panel-dispatch">
      <div className="home-panel-head home-dispatch-head">
        <div>
          <p className="home-eyebrow">{eyebrow}</p>
          <h2 className="home-panel-title">{title}</h2>
        </div>
        <div className="home-dispatch-stats">
          <div className="home-stat">
            <span className="home-stat-label">Total</span>
            <span className="home-stat-value">{formatMt(total)} MT</span>
          </div>
          <div className="home-stat home-stat-split">
            <span className="home-stat-label">Domestic</span>
            <span className="home-stat-value home-stat-domestic">
              {formatMt(domesticTotal)}
            </span>
          </div>
          <div className="home-stat home-stat-split">
            <span className="home-stat-label">Imported</span>
            <span className="home-stat-value home-stat-imported">
              {formatMt(importedTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="home-dispatch-legend" aria-hidden="true">
        <span className="home-legend-item">
          <span className="home-legend-swatch is-domestic" />
          Domestic
        </span>
        <span className="home-legend-item">
          <span className="home-legend-swatch is-imported" />
          Imported
        </span>
      </div>

      <div
        className="home-split-bars"
        style={{ ["--bar-count" as string]: buckets.length }}
        role="img"
        aria-label={ariaLabel}
      >
        {buckets.map((bucket) => {
          const domestic = Number(bucket.domestic) || 0;
          const imported = Number(bucket.imported) || 0;
          const periodTotal = Number(bucket.total) || 0;
          return (
            <div
              key={bucket.key}
              className={`home-split-col${bucket.isCurrent ? " is-current" : ""}`}
            >
              <div className="home-split-total">
                {periodTotal > 0 ? formatMt(periodTotal) : "—"}
              </div>
              <div className="home-split-pair">
                <div className="home-split-bar">
                  <div className="home-split-value">
                    {domestic > 0 ? formatMt(domestic) : ""}
                  </div>
                  <div className="home-split-track">
                    <div
                      className="home-split-fill is-domestic"
                      style={{ height: `${barHeight(domestic, maxValue)}%` }}
                      title={`Domestic: ${formatMt(domestic)} MT`}
                    />
                  </div>
                </div>
                <div className="home-split-bar">
                  <div className="home-split-value">
                    {imported > 0 ? formatMt(imported) : ""}
                  </div>
                  <div className="home-split-track">
                    <div
                      className="home-split-fill is-imported"
                      style={{ height: `${barHeight(imported, maxValue)}%` }}
                      title={`Imported: ${formatMt(imported)} MT`}
                    />
                  </div>
                </div>
              </div>
              <div className="home-split-label">{bucket.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
