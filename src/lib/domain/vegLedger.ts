const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const PER_LORRY = "PER_LORRY";

export function monthKeyFromIsoDate(isoDate: string): string {
  return isoDate.trim().slice(0, 7);
}

/** e.g. 2026-09 → Sep 2026 */
export function formatMonthLabel(monthKey: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey.trim());
  if (!match) return monthKey;
  const year = match[1];
  const month = Number(match[2]);
  if (month < 1 || month > 12) return monthKey;
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

export function paymentBasisLabel(basis: string): string {
  return basis === PER_LORRY ? "Per Lorry" : "Per MT";
}

function toAmount(value: string | number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/** Payable for a month: Per MT uses qty × rate; Per Lorry uses trucks × rate. */
export function vegPayableAmount(args: {
  paymentBasis: string;
  quantity: string | number;
  trucks: number;
  rate: string | number;
}): string {
  const rate = toAmount(args.rate);
  if (!Number.isFinite(rate) || rate < 0) return "0";
  if (args.paymentBasis === PER_LORRY) {
    return (Math.round(rate * args.trucks * 100) / 100).toString();
  }
  const qty = toAmount(args.quantity);
  if (!Number.isFinite(qty) || qty < 0) return "0";
  return (Math.round(rate * qty * 100) / 100).toString();
}
