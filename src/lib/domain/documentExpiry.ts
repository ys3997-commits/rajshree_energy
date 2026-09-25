export type DocumentExpiryStatus =
  | "expired"
  | "within-30-days"
  | "within-6-months"
  | "valid";

export const DOCUMENT_EXPIRY_STATUS_LABEL: Record<DocumentExpiryStatus, string> = {
  expired: "🔴 Expired",
  "within-30-days": "🟠 Expires within 30 days",
  "within-6-months": "🟡 Expires within 6 months",
  valid: "🟢 Valid",
};

/** Keep only digits and insert slashes so the field reads dd/mm/yyyy. */
export function maskExpiryDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** dd/mm/yyyy → YYYY-MM-DD, or null when the text is not a real date. */
export function expiryIsoFromDdMmYyyy(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 1900 || year > 9999) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function ddMmYyyyFromExpiryIso(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function todayIsoInIst(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function parseIsoUtc(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error("Invalid date");
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function formatIsoUtc(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(iso: string, days: number): string {
  const date = parseIsoUtc(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return formatIsoUtc(date);
}

export function addCalendarMonths(iso: string, months: number): string {
  const date = parseIsoUtc(iso);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return formatIsoUtc(date);
}

/**
 * Closest status wins: already past, then 30 days, then 6 months, otherwise valid.
 * Compared on calendar dates, with today taken in India time.
 */
export function documentExpiryStatus(
  expiryIso: string,
  todayIso = todayIsoInIst(),
): DocumentExpiryStatus {
  if (expiryIso < todayIso) return "expired";
  if (expiryIso <= addCalendarDays(todayIso, 30)) return "within-30-days";
  if (expiryIso <= addCalendarMonths(todayIso, 6)) return "within-6-months";
  return "valid";
}

export function parseMemberDocumentExpiry(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = expiryIsoFromDdMmYyyy(trimmed);
  if (!iso) throw new Error("Enter expiry date as dd/mm/yyyy");
  return iso;
}
