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
  return (Math.round(n * 100) / 100).toFixed(2);
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

/** How DO rate is derived on a purchase order. */
export type DoCalculationAsPer =
  | "BASIC_MINUS_HANDLING"
  | "BASIC_PRICE"
  | "FINAL_PRICE";

export const DO_CALCULATION_OPTIONS: ReadonlyArray<{
  value: DoCalculationAsPer;
  title: string;
}> = [
  {
    value: "BASIC_MINUS_HANDLING",
    title: "Basic − Handling Charge",
  },
  {
    value: "BASIC_PRICE",
    title: "Basic Price",
  },
  {
    value: "FINAL_PRICE",
    title: "Total Price",
  },
];

export function isDoCalculationAsPer(
  value: string | null | undefined,
): value is DoCalculationAsPer {
  return (
    value === "BASIC_MINUS_HANDLING" ||
    value === "BASIC_PRICE" ||
    value === "FINAL_PRICE"
  );
}

/** Block Amount is mandatory for basic-based DO calculation modes. */
export function isBlockAmountRequired(
  doCalculationAsPer: DoCalculationAsPer | null | undefined,
): boolean {
  return (
    doCalculationAsPer === "BASIC_MINUS_HANDLING" ||
    doCalculationAsPer === "BASIC_PRICE"
  );
}

export type DoHandlingBreakdown = {
  basic: string;
  handling: string;
  handlingGst: string;
  deduction: string;
  doRate: string;
};

/**
 * DO rate when subtracting handling + 18% GST on handling from basic price.
 * Example: 10200 − (350 + 63) = 9798
 */
export function computeDoRateMinusHandling(
  basicRate: string | number | null | undefined,
  handlingCharge: string | number | null | undefined,
): DoHandlingBreakdown | null {
  if (
    basicRate === undefined ||
    basicRate === null ||
    basicRate === "" ||
    handlingCharge === undefined ||
    handlingCharge === null ||
    handlingCharge === ""
  ) {
    return null;
  }
  const basic =
    typeof basicRate === "number" ? basicRate : Number(basicRate);
  const handling =
    typeof handlingCharge === "number"
      ? handlingCharge
      : Number(handlingCharge);
  if (!Number.isFinite(basic) || !Number.isFinite(handling)) return null;
  if (handling < 0) return null;
  const handlingGst = handling * PURCHASE_GST_RATE;
  const deduction = handling + handlingGst;
  const doRate = basic - deduction;
  return {
    basic: roundAmount(basic),
    handling: roundAmount(handling),
    handlingGst: roundAmount(handlingGst),
    deduction: roundAmount(deduction),
    doRate: roundAmount(doRate),
  };
}

/** Resolved DO rate string for the selected calculation mode. */
export function resolveDoRate(
  doCalculationAsPer: DoCalculationAsPer,
  basicRate: string | number | null | undefined,
  handlingCharge: string | number | null | undefined,
): string | null {
  if (doCalculationAsPer === "BASIC_MINUS_HANDLING") {
    return computeDoRateMinusHandling(basicRate, handlingCharge)?.doRate ?? null;
  }
  const breakdown = computePurchaseRateBreakdown(basicRate);
  if (!breakdown) return null;
  if (doCalculationAsPer === "BASIC_PRICE") return breakdown.base;
  return breakdown.final;
}
