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

/** Human-readable label for dispatch / sale delivery terms. */
export function formatDispatchTerms(
  terms: DispatchTerms | null | undefined,
): string {
  if (terms == null) return "—";
  return terms === DispatchTerms.FOR ? "FOR" : "Ex-Port";
}

/**
 * Format a quantity for display (integer, Indian grouping).
 * Unit (MT) belongs in the column header / label, not on every cell value.
 */
export function formatMt(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return formatIndianNumber(Math.round(n));
}

function formatWeightMtValue(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return `${n.toFixed(2)} MT`;
}

/** Sale order quantity cells: 2 decimals, no grouping, trailing " MT". */
export function formatSaleOrderMt(
  value: { toString(): string } | number | string | null | undefined,
): string {
  return formatWeightMtValue(value);
}

/** Dispatch sheet MT cells: 2 decimals, no grouping, trailing " MT". */
export function formatDispatchMt(
  value: { toString(): string } | number | string | null | undefined,
): string {
  return formatWeightMtValue(value);
}

/**
 * Format a rate/amount for display with Rs prefix (integer, Indian grouping).
 */
export function formatRs(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return `Rs ${formatIndianNumber(Math.round(n))}`;
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
 * List/detail display status. Open orders always show as Completed.
 */
export function formatOrderStatusForDisplay(order: {
  orderType: string | null | undefined;
  orderStatus: string | null | undefined;
}): string {
  if (order.orderType === "OPEN") return "Completed";
  return formatSaleOrderStatus(order.orderStatus);
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
  balanceOrder: { toString(): string } | number | string | null | undefined;
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

/** e.g. "30 days" */
export function formatCreditPeriod(
  days: number | null | undefined,
): string {
  if (days == null) return "—";
  return `${formatIndianNumber(days)} days`;
}
