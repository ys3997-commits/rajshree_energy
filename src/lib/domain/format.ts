import { DispatchTerms } from "@/generated/prisma";

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
  return s;
}

/**
 * Format a rate/amount for display. Unit (Rs / Rs/MT) belongs in the column
 * header / label, not on every cell value.
 */
export function formatRs(
  value: { toString(): string } | number | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  const s = typeof value === "string" ? value : value.toString();
  if (s === "—") return "—";
  return s;
}

export function formatDecimal(
  value: { toString(): string } | null | undefined,
): string {
  if (value == null) return "—";
  return value.toString();
}
