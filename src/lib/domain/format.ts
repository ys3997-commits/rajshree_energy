import { CustomerCategory, DispatchTerms } from "@/generated/prisma";

function parseFiniteNumber(
  value: { toString(): string } | number | string | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Indian grouping: 1,00,000 instead of 100,000.
 * Pass fractionDigits for fixed decimals (quantities/rates); omit for integers.
 */
export function formatIndianNumber(
  value: { toString(): string } | number | string | null | undefined,
  fractionDigits?: number,
): string {
  const n = parseFiniteNumber(value);
  if (n == null) {
    if (value == null || value === "") return "—";
    const s = typeof value === "string" ? value : value.toString();
    return s === "—" ? "—" : s;
  }
  if (fractionDigits != null) {
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** Strip commas / currency junk from a typed amount → raw numeric string. */
export function parseAmountInput(value: string): string {
  return value.replace(/,/g, "").trim();
}

/**
 * Format a partially typed amount with Indian commas (e.g. 10,00,000.50).
 * Keeps a trailing decimal point while typing.
 */
export function formatIndianAmountTyping(
  value: string,
  maxFractionDigits = 2,
): string {
  const cleaned = parseAmountInput(value).replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const dot = cleaned.indexOf(".");
  let intDigits = dot === -1 ? cleaned : cleaned.slice(0, dot);
  let fracDigits = dot === -1 ? null : cleaned.slice(dot + 1).replace(/\./g, "");

  if (fracDigits != null) fracDigits = fracDigits.slice(0, maxFractionDigits);
  // Avoid leading zeros like 0001 → 1, but keep a lone 0.
  intDigits = intDigits.replace(/^0+(?=\d)/, "");

  const formattedInt = formatIndianDigitGroups(intDigits || (dot !== -1 ? "0" : ""));
  if (fracDigits != null) return `${formattedInt}.${fracDigits}`;
  if (dot !== -1) return `${formattedInt}.`;
  return formattedInt;
}

function formatIndianDigitGroups(digits: string): string {
  if (!digits) return "";
  if (digits.length <= 3) return digits;
  let result = digits.slice(-3);
  let rest = digits.slice(0, -3);
  while (rest.length > 0) {
    const chunk = rest.slice(-2);
    rest = rest.slice(0, -2);
    result = `${chunk},${result}`;
  }
  return result;
}

/** Human-readable label for dispatch / sale delivery terms. */
export function formatDispatchTerms(
  terms: DispatchTerms | null | undefined,
): string {
  if (terms == null) return "—";
  return terms === DispatchTerms.FOR ? "FOR" : "Ex-Port";
}

/**
 * Format a weight as two decimals without a unit (for inputs that already show MT).
 */
export function formatMtNumber(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return n.toFixed(2);
}

/**
 * Format a weight for display: two decimals and a trailing " MT".
 * Example: 38.18 MT
 */
export function formatMt(
  value: { toString(): string } | number | string | null | undefined,
): string {
  const amount = formatMtNumber(value);
  return amount === "—" ? "—" : `${amount} MT`;
}

/** Sale order quantity cells: 2 decimals, trailing " MT". */
export function formatSaleOrderMt(
  value: { toString(): string } | number | string | null | undefined,
): string {
  return formatMt(value);
}

/** Dispatch sheet MT cells: 2 decimals, trailing " MT". */
export function formatDispatchMt(
  value: { toString(): string } | number | string | null | undefined,
): string {
  return formatMt(value);
}

/**
 * Indian-grouped integer amount without currency prefix (reports).
 */
export function formatAmount(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return formatIndianNumber(Math.round(n));
}

/**
 * Format a rate/amount for display with Rs prefix (integer, Indian grouping).
 */
export function formatRs(
  value: { toString(): string } | number | string | null | undefined,
): string {
  const amount = formatAmount(value);
  return amount === "—" ? "—" : `Rs ${amount}`;
}

export function formatCustomerCategory(
  category: CustomerCategory | string | null | undefined,
): string {
  switch (category) {
    case CustomerCategory.SUPPLIER:
    case "SUPPLIER":
      return "Vendor";
    case CustomerCategory.TRADER:
    case "TRADER":
      return "Trader";
    case CustomerCategory.INDUSTRY:
    case "INDUSTRY":
      return "Industry";
    default:
      return category ? String(category) : "—";
  }
}

export function formatDecimal(
  value: { toString(): string } | null | undefined,
): string {
  if (value == null) return "—";
  return value.toString();
}

export type QualityClassLabel = {
  origin: { name: string };
  domestic: boolean;
  qualityOption: { name: string };
};

/** e.g. "Domestic · Indonesia · 6000 GCV" */
export function formatQualityClass(
  qc: QualityClassLabel | null | undefined,
): string {
  if (!qc) return "—";
  const domestic = qc.domestic ? "Domestic" : "Imported";
  return `${domestic} · ${qc.origin.name} · ${qc.qualityOption.name}`;
}

export function formatCoalOrigin(
  origin: "DOMESTIC" | "IMPORTED" | null | undefined,
): string {
  if (origin === "DOMESTIC") return "Domestic coal";
  if (origin === "IMPORTED") return "Imported coal";
  return "—";
}

/** e.g. "Rs 1000.00 + Rs 180.00 + Rs 23.60 = Rs 1203.60" (TCS omitted when null). */
export function formatRateBreakdownLine(breakdown: {
  base: string;
  gst: string;
  tcs: string | null;
  final: string;
}): string {
  const parts = [formatRs(breakdown.base), formatRs(breakdown.gst)];
  if (breakdown.tcs != null) {
    parts.push(formatRs(breakdown.tcs));
  }
  return `${parts.join(" + ")} = ${formatRs(breakdown.final)}`;
}

/** Order type display: Open | Regular */
export function formatOrderType(
  orderType: string | null | undefined,
): string {
  if (orderType === "OPEN") return "Open";
  if (orderType === "REGULAR") return "Regular";
  return orderType ? String(orderType) : "—";
}

/** Purchase / sale order status display: Running | Completed */
export function formatPurchaseOrderStatus(
  status: string | null | undefined,
): string {
  if (status === "COMPLETED") return "Completed";
  return "Running";
}

/** Alias — sale orders use the same Running / Completed labels. */
export function formatSaleOrderStatus(
  status: string | null | undefined,
): string {
  return formatPurchaseOrderStatus(status);
}

/**
 * List/detail display status follows the Balance column:
 * balance ≠ 0 → Running; balance 0 (or closed / open with no qty) → Completed.
 */
export function formatOrderStatusForDisplay(order: {
  orderType: string | null | undefined;
  quantity?: { toString(): string } | number | string | null | undefined;
  balanceOrder?: { toString(): string } | number | string | null | undefined;
  /** Kept for call-site compatibility; display uses balance, not stored status. */
  orderStatus?: string | null | undefined;
}): string {
  const n = parseFiniteNumber(displayOrderBalance(order));
  if (n != null && n !== 0) return "Running";
  return "Completed";
}

/**
 * List/detail quantity. Open orders use dispatched quantity as the order quantity.
 */
export function displayOrderQuantity(order: {
  orderType: string | null | undefined;
  quantity: { toString(): string } | number | string | null | undefined;
  dispatchedOrder: { toString(): string } | number | string | null | undefined;
}): { toString(): string } | number | string | null | undefined {
  if (order.orderType === "OPEN") return order.dispatchedOrder;
  return order.quantity;
}

/**
 * List/detail balance. Open orders with no quantity yet show balance 0.
 */
export function displayOrderBalance(order: {
  orderType: string | null | undefined;
  quantity?: { toString(): string } | number | string | null | undefined;
  balanceOrder?: { toString(): string } | number | string | null | undefined;
}): { toString(): string } | number | string | null | undefined {
  if (order.orderType === "OPEN" && (order.quantity == null || order.quantity === "")) {
    return 0;
  }
  return order.balanceOrder;
}

/** Whole calendar days from order date (UTC) to today. Falls back to createdAt. */
export function daysSinceOrder(
  orderDate: Date | string | null | undefined,
  createdAt?: Date | string | null | undefined,
  asOf: Date = new Date(),
): number | null {
  const basis = orderDate ?? createdAt ?? null;
  if (basis == null || basis === "") return null;
  const d = typeof basis === "string" ? new Date(basis) : basis;
  if (Number.isNaN(d.getTime())) return null;
  const start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const end = Date.UTC(
    asOf.getUTCFullYear(),
    asOf.getUTCMonth(),
    asOf.getUTCDate(),
  );
  return Math.floor((end - start) / 86_400_000);
}

/** Capitalize the first letter of each word in a name. */
export function capitalizeName(
  value: string | null | undefined,
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed
    .split(/\s+/)
    .map((word) =>
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word,
    )
    .join(" ");
}

/** Format lorry number as PREFIX-1234 (last 4 characters must be digits). */
export function normalizeLorryNumber(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[\s-]+/g, "");
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    throw new Error(
      "Lorry number must contain only letters and digits (e.g. WBAS2N-1234)",
    );
  }

  if (cleaned.length < 4 || !/\d{4}$/.test(cleaned)) {
    throw new Error(
      "Lorry number must end with 4 digits (e.g. WBAS2N-1234)",
    );
  }

  const prefix = cleaned.slice(0, -4);
  const digits = cleaned.slice(-4);
  return prefix ? `${prefix}-${digits}` : digits;
}

/** Display helper — formats when possible, otherwise uppercases. */
export function formatLorryNumber(
  value: string | null | undefined,
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return normalizeLorryNumber(trimmed) ?? trimmed.toUpperCase();
  } catch {
    return trimmed.toUpperCase();
  }
}

/** ISO date (YYYY-MM-DD) or datetime prefix → DD/MM/YYYY for display. */
export function formatDateDdMmYyyy(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** ISO month (YYYY-MM) → e.g. "Aug 2026" for display. */
export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return "—";
  const monthPart = value.trim().slice(0, 7);
  const match = /^(\d{4})-(\d{2})$/.exec(monthPart);
  if (!match) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || month < 1 || month > 12) return value;
  const date = new Date(year, month - 1, 1);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(date);
}

/** e.g. "30 days" */
export function formatCreditPeriod(
  days: number | null | undefined,
): string {
  if (days == null) return "—";
  return `${formatIndianNumber(days)} days`;
}
