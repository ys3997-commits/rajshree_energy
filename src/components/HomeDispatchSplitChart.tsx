import type { DispatchSplitBucket } from "@/lib/actions/dashboard";

export type HomeSplitValueKind = "mt" | "rupees";

type SeriesLabels = {
  left: string;
  right?: string;
  /** Header total label. Defaults to "Total". */
  total?: string;
};

type Props = {
  eyebrow: string;
  title: string;
  buckets: DispatchSplitBucket[];
  ariaLabel: string;
  /** Defaults to MT (dispatch charts). Use "rupees" for profit/funds. */
  valueKind?: HomeSplitValueKind;
  /** Defaults to Domestic / Imported. Pass only `left` for a single-series chart. */
  seriesLabels?: SeriesLabels;
  /**
   * How to compute the header total from left/right series.
   * - sum: left + right (dispatch / profit)
   * - net: left − right (funds received − paid)
   * - left: left series only (fund received)
   */
  totalMode?: "sum" | "net" | "left";
  /** Hide the header stats row (totals). */
  hideTotals?: boolean;
};

const DEFAULT_SERIES: SeriesLabels = {
  left: "Domestic",
  right: "Imported",
  total: "Total",
};

function sumField(
  buckets: DispatchSplitBucket[],
  field: "domestic" | "imported" | "total",
): number {
  return buckets.reduce((sum, b) => sum + (Number(b[field]) || 0), 0);
}

function barHeight(value: number, max: number): number {
  const abs = Math.abs(value);
  if (max <= 0 || abs <= 0) return 0;
  return Math.max((abs / max) * 100, 8);
}

/** Whole MT for dispatch chart labels — unchanged from original. */
function formatChartQty(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return String(Math.round(value));
}

/** Rupee chart labels always in lakhs: 0.75L, 3.55L, 0.03L */
function formatChartRs(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const lakhs = Math.abs(value) / 100000;
  return `${sign}${lakhs.toFixed(2)}L`;
}

function formatValue(value: number, kind: HomeSplitValueKind): string {
  return kind === "rupees" ? formatChartRs(value) : formatChartQty(value);
}

function formatStat(value: number, kind: HomeSplitValueKind): string {
  if (kind === "rupees") {
    return `Rs ${formatChartRs(value)}`;
  }
  return `${formatChartQty(value)} MT`;
}

function hasBarValue(value: number, kind: HomeSplitValueKind): boolean {
  return kind === "rupees" ? value !== 0 : value > 0;
}

export function HomeDispatchSplitChart({
  eyebrow,
  title,
  buckets,
  ariaLabel,
  valueKind = "mt",
  seriesLabels,
  totalMode = "sum",
  hideTotals = false,
}: Props) {
  const labels: SeriesLabels = {
    ...DEFAULT_SERIES,
    ...seriesLabels,
  };
  const singleSeries =
    seriesLabels != null &&
    (seriesLabels.right == null || seriesLabels.right === "");

  const leftTotal = sumField(buckets, "domestic");
  const rightTotal = sumField(buckets, "imported");
  const headerTotal =
    totalMode === "net"
      ? leftTotal - rightTotal
      : totalMode === "left"
        ? leftTotal
        : leftTotal + rightTotal;
  const maxValue = Math.max(
    ...buckets.flatMap((b) =>
      singleSeries
        ? [Math.abs(Number(b.domestic) || 0)]
        : [
            Math.abs(Number(b.domestic) || 0),
            Math.abs(Number(b.imported) || 0),
          ],
    ),
    0,
  );

  return (
    <section className="home-panel home-panel-dispatch">
      <div className="home-panel-head home-dispatch-head">
        <div>
          <p className="home-eyebrow">{eyebrow}</p>
          <h2 className="home-panel-title">{title}</h2>
        </div>
        {!hideTotals ? (
          <div className="home-dispatch-stats">
            <div className="home-stat">
              <span className="home-stat-label">{labels.total ?? "Total"}</span>
              <span className="home-stat-value">
                {formatStat(headerTotal, valueKind)}
              </span>
            </div>
            {!singleSeries ? (
              <>
                <div className="home-stat home-stat-split">
                  <span className="home-stat-label">{labels.left}</span>
                  <span className="home-stat-value home-stat-domestic">
                    {formatValue(leftTotal, valueKind)}
                  </span>
                </div>
                <div className="home-stat home-stat-split">
                  <span className="home-stat-label">{labels.right}</span>
                  <span className="home-stat-value home-stat-imported">
                    {formatValue(rightTotal, valueKind)}
                  </span>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {!singleSeries ? (
        <div className="home-dispatch-legend" aria-hidden="true">
          <span className="home-legend-item">
            <span className="home-legend-swatch is-domestic" />
            {labels.left}
          </span>
          <span className="home-legend-item">
            <span className="home-legend-swatch is-imported" />
            {labels.right}
          </span>
        </div>
      ) : null}

      <div
        className={`home-split-bars${singleSeries ? " is-single" : ""}`}
        style={{ ["--bar-count" as string]: buckets.length }}
        role="img"
        aria-label={ariaLabel}
      >
        {buckets.map((bucket) => {
          const left = Number(bucket.domestic) || 0;
          const right = Number(bucket.imported) || 0;
          const periodTotal =
            totalMode === "net"
              ? left - right
              : totalMode === "left"
                ? left
                : left + right;
          return (
            <div
              key={bucket.key}
              className={`home-split-col${bucket.isCurrent ? " is-current" : ""}`}
            >
              <div className="home-split-total">
                {hasBarValue(periodTotal, valueKind)
                  ? formatValue(periodTotal, valueKind)
                  : "—"}
              </div>
              <div className="home-split-pair">
                <div className="home-split-bar">
                  <div className="home-split-value">
                    {singleSeries
                      ? ""
                      : hasBarValue(left, valueKind)
                        ? formatValue(left, valueKind)
                        : ""}
                  </div>
                  <div className="home-split-track">
                    <div
                      className={`home-split-fill is-domestic${valueKind === "rupees" && left < 0 ? " is-negative" : ""}`}
                      style={{ height: `${barHeight(left, maxValue)}%` }}
                      title={`${labels.left}: ${formatStat(left, valueKind)}`}
                    />
                  </div>
                </div>
                {!singleSeries ? (
                  <div className="home-split-bar">
                    <div className="home-split-value">
                      {hasBarValue(right, valueKind)
                        ? formatValue(right, valueKind)
                        : ""}
                    </div>
                    <div className="home-split-track">
                      <div
                        className={`home-split-fill is-imported${valueKind === "rupees" && right < 0 ? " is-negative" : ""}`}
                        style={{ height: `${barHeight(right, maxValue)}%` }}
                        title={`${labels.right}: ${formatStat(right, valueKind)}`}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="home-split-label">{bucket.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
