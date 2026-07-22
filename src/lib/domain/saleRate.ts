/** Shared sale rate tax factors (client-safe — no Prisma). */
export const SALE_GST_RATE = 0.18;
export const SALE_TCS_RATE = 0.02;

export type SaleRateBreakdown = {
  base: string;
  gst: string;
  /** Null when TCS does not apply (industry / non-trader). */
  tcs: string | null;
  final: string;
};

function roundAmount(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

/** TCS applies for vendor and trader customers; industry is GST only. */
export function saleTcsApplies(
  category: string | null | undefined,
): boolean {
  return category === "TRADER" || category === "SUPPLIER";
}

/**
 * Sale all-in rate breakdown from basic rate and customer category:
 * - Always: GST = 18% of base
 * - Vendor / trader: + TCS = 2% of (base + GST)
 * - Industry: no TCS
 * Safe to import from Client Components.
 */
export function computeSaleRateBreakdown(
  rate: string | number | null | undefined,
  category: string | null | undefined,
): SaleRateBreakdown | null {
  if (rate === undefined || rate === null || rate === "") return null;
  const base = typeof rate === "number" ? rate : Number(rate);
  if (!Number.isFinite(base)) return null;
  const gst = base * SALE_GST_RATE;
  const withGst = base + gst;
  if (saleTcsApplies(category)) {
    const tcs = withGst * SALE_TCS_RATE;
    return {
      base: roundAmount(base),
      gst: roundAmount(gst),
      tcs: roundAmount(tcs),
      final: roundAmount(withGst + tcs),
    };
  }
  return {
    base: roundAmount(base),
    gst: roundAmount(gst),
    tcs: null,
    final: roundAmount(withGst),
  };
}

/** @deprecated Prefer computeSaleRateBreakdown — kept for call sites that only need final. */
export function computeSaleFinalRatePreview(
  rate: string | number | null | undefined,
  category: string | null | undefined,
): string | null {
  return computeSaleRateBreakdown(rate, category)?.final ?? null;
}
