import { CustomerCategory, DispatchTerms } from "@/generated/prisma";

function roundTo2(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

/** Human-readable label for dispatch terms. */
export function formatDispatchTerms(terms: DispatchTerms): string {
  return terms === DispatchTerms.FOR ? "FOR" : "Ex-Port";
}

/**
 * Format a quantity for display. Unit (MT) belongs in the column header / label,
 * not on every cell value.
 */
export function formatMt(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return roundTo2(n);
}

/**
 * Format a rate/amount for display with Rs prefix and 2 decimal places.
 */
export function formatRs(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return `Rs ${roundTo2(n)}`;
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

/** Purchase order status display: Running | Completed */
export function formatPurchaseOrderStatus(
  status: string | null | undefined,
): string {
  if (status === "COMPLETED") return "Completed";
  return "Running";
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

/** Format lorry number as PREFIX-1234 (exactly 4 trailing digits). */
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

  const match = /^([A-Z0-9]+?)(\d+)$/.exec(cleaned);
  if (!match || match[2].length !== 4) {
    throw new Error(
      "Lorry number must end with exactly 4 digits (e.g. WBAS2N-1234)",
    );
  }

  return `${match[1]}-${match[2]}`;
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

/** e.g. "30 days" */
export function formatCreditPeriod(
  days: number | null | undefined,
): string {
  if (days == null) return "—";
  return `${days} days`;
}
