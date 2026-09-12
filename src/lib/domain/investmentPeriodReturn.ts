/** UTC calendar-day helpers and time-weighted investment return math (browser-safe). */

const MS_PER_DAY = 86_400_000;

export type InvestmentFundMovement = {
  /** UTC calendar day YYYY-MM-DD (or Date stored as that day). */
  date: string | Date;
  delta: number | string;
};

function utcDayKey(value: string | Date): string {
  if (typeof value === "string") {
    const trimmed = value.trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      throw new Error(`Invalid day: ${value}`);
    }
    return trimmed;
  }
  return value.toISOString().slice(0, 10);
}

function utcDayMs(day: string): number {
  return Date.parse(`${day}T00:00:00.000Z`);
}

function toNumber(value: number | string): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/** Inclusive UTC calendar days from start through end. */
export function inclusiveUtcDays(startDay: string, endDay: string): number {
  const start = utcDayMs(startDay);
  const end = utcDayMs(endDay);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return 0;
  }
  return Math.floor((end - start) / MS_PER_DAY) + 1;
}

function addUtcDays(day: string, days: number): string {
  return new Date(utcDayMs(day) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * Time-weighted average capital invested during a period.
 *
 * Opening balance is treated as invested from period start.
 * Each fund movement counts from its date (inclusive) through period end
 * (or until a later movement changes the balance).
 */
export function timeWeightedInvestedCapital(input: {
  openingDue: number | string;
  movements: InvestmentFundMovement[];
  periodStart: string;
  periodEnd: string;
}): string {
  const periodStart = utcDayKey(input.periodStart);
  const periodEnd = utcDayKey(input.periodEnd);
  const periodDays = inclusiveUtcDays(periodStart, periodEnd);
  if (periodDays <= 0) return "0.00";

  const moves = input.movements
    .map((m) => ({
      day: utcDayKey(m.date),
      delta: toNumber(m.delta),
    }))
    .filter((m) => Number.isFinite(m.delta))
    .sort((a, b) => a.day.localeCompare(b.day));

  let balance = toNumber(input.openingDue);
  if (!Number.isFinite(balance)) balance = 0;

  for (const move of moves) {
    if (move.day < periodStart) balance += move.delta;
  }

  const deltaByDay = new Map<string, number>();
  for (const move of moves) {
    if (move.day < periodStart || move.day > periodEnd) continue;
    deltaByDay.set(move.day, (deltaByDay.get(move.day) ?? 0) + move.delta);
  }

  let weightedSum = 0;
  let day = periodStart;
  while (day <= periodEnd) {
    const dayDelta = deltaByDay.get(day);
    if (dayDelta) balance += dayDelta;
    weightedSum += balance;
    day = addUtcDays(day, 1);
  }

  return (weightedSum / periodDays).toFixed(2);
}

/**
 * Profit / loss + interest treated as received on the period end date.
 * Empty values count as 0.
 */
export function periodReturnDelta(
  profit: number | string | null | undefined,
  interest: number | string | null | undefined,
): string {
  const profitValue =
    profit == null || profit === "" || profit === "-" ? 0 : toNumber(profit);
  const interestValue =
    interest == null || interest === "" || interest === "-"
      ? 0
      : toNumber(interest);
  const total =
    (Number.isFinite(profitValue) ? profitValue : 0) +
    (Number.isFinite(interestValue) ? interestValue : 0);
  return total.toFixed(2);
}

function hasReturnAmount(value: number | string | null | undefined): boolean {
  return value != null && value !== "" && value !== "-";
}

/** (Profit / loss + interest) as % of time-weighted invested capital. */
export function investmentPeriodPercent(
  profit: number | string | null | undefined,
  investedCapital: number | string | null | undefined,
  interest?: number | string | null | undefined,
): string {
  if (!hasReturnAmount(profit) && !hasReturnAmount(interest)) return "—";
  if (investedCapital == null || investedCapital === "") return "—";
  const base = toNumber(investedCapital);
  const value = toNumber(periodReturnDelta(profit, interest));
  if (!Number.isFinite(base) || base === 0 || !Number.isFinite(value)) {
    return "—";
  }
  return `${((value / base) * 100).toFixed(2)}%`;
}
