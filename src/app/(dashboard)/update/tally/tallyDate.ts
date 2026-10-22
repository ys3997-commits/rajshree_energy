import { dayKeyInIst } from "@/lib/auth/sameDayEntryModify";

function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Previous India calendar day, as YYYY-MM-DD. */
export function yesterdayInIndia(now = new Date()): string {
  const today = dayKeyInIst(now);
  const [year, month, day] = today.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
}

/** One dispatch date. Missing or invalid input falls back to yesterday in India. */
export function tallyEntryDate(
  requested: string | undefined,
  now = new Date(),
): string {
  if (requested && isIsoDate(requested)) return requested;
  return yesterdayInIndia(now);
}
