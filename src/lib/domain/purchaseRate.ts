/** Shared purchase rate tax factors (client-safe — no Prisma). */
export const PURCHASE_GST_RATE = 0.18;
export const PURCHASE_TCS_RATE = 0.02;

export type RateBreakdown = {
  base: string;
  gst: string;
  tcs: string;
  final: string;
};

function roundAmount(n: number): string {
  return String(Math.round(n * 1e6) / 1e6);
}

/**
 * Purchase all-in rate breakdown from base rate:
 * GST = 18% of rate; TCS = 2% of (rate + GST); final = rate + GST + TCS.
 * Safe to import from Client Components.
 */
export function computePurchaseRateBreakdown(
  rate: string | number | null | undefined,
): RateBreakdown | null {
  if (rate === undefined || rate === null || rate === "") return null;
  const base = typeof rate === "number" ? rate : Number(rate);
  if (!Number.isFinite(base)) return null;
  const gst = base * PURCHASE_GST_RATE;
  const tcs = (base + gst) * PURCHASE_TCS_RATE;
  const final = base + gst + tcs;
  return {
    base: roundAmount(base),
    gst: roundAmount(gst),
    tcs: roundAmount(tcs),
    final: roundAmount(final),
  };
}

/** @deprecated Prefer computePurchaseRateBreakdown — kept for call sites that only need final. */
export function computePurchaseFinalRatePreview(
  rate: string | number | null | undefined,
): string | null {
  return computePurchaseRateBreakdown(rate)?.final ?? null;
}
