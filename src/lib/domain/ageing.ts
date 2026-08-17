import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal, type DecimalLike } from "@/lib/domain/computations";
import {
  AGEING_BUCKETS,
  type AgeingBucketKey,
  type AgeingReportRow,
} from "@/lib/domain/ageingBuckets";

export type AgeingMovement = {
  date: Date;
  amount: DecimalLike;
  /** Tie-break after date and debit/credit. */
  sortKey?: string;
};

export type UnpaidDue = {
  date: Date;
  amount: Decimal;
};

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function utcDayDiff(from: Date, to: Date): number {
  const start = startOfUtcDay(from).getTime();
  const end = startOfUtcDay(to).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** Today counts as 1 day so it lands in 1–10. */
export function ageingBucketKey(days: number): AgeingBucketKey {
  const age = Math.max(1, days);
  for (const bucket of AGEING_BUCKETS) {
    if (age >= bucket.minDays && age <= bucket.maxDays) return bucket.key;
  }
  return "d121_plus";
}

export function emptyAgeingBuckets(): Record<AgeingBucketKey, Decimal> {
  return Object.fromEntries(
    AGEING_BUCKETS.map((bucket) => [bucket.key, new Decimal(0)]),
  ) as Record<AgeingBucketKey, Decimal>;
}

/**
 * Remaining positive due after applying credits to older charges first.
 * Leftover credit (advance) is kept and applied to later sales.
 * Same-day: charges (sales / funds paid) before credits (receipts / purchases).
 */
export function unpaidDueByDate(
  movements: AgeingMovement[],
  asOf: Date = new Date(),
): UnpaidDue[] {
  const cutoff = startOfUtcDay(asOf);
  const sorted = movements
    .map((movement, index) => ({
      date: startOfUtcDay(movement.date),
      amount: toDecimal(movement.amount),
      sortKey: movement.sortKey ?? "",
      index,
    }))
    .filter(
      (movement) =>
        movement.amount.isFinite() &&
        !movement.amount.isZero() &&
        movement.date.getTime() <= cutoff.getTime(),
    )
    .sort((a, b) => {
      const byDate = a.date.getTime() - b.date.getTime();
      if (byDate !== 0) return byDate;
      const aCharge = a.amount.gt(0) ? 0 : 1;
      const bCharge = b.amount.gt(0) ? 0 : 1;
      if (aCharge !== bCharge) return aCharge - bCharge;
      const byKey = a.sortKey.localeCompare(b.sortKey);
      if (byKey !== 0) return byKey;
      return a.index - b.index;
    });

  const open: UnpaidDue[] = [];
  let advance = new Decimal(0);

  for (const movement of sorted) {
    if (movement.amount.gt(0)) {
      let charge = movement.amount;
      if (advance.gt(0)) {
        const take = Decimal.min(advance, charge);
        advance = advance.minus(take);
        charge = charge.minus(take);
      }
      if (charge.gt(0)) {
        open.push({ date: movement.date, amount: charge });
      }
      continue;
    }

    let credit = movement.amount.abs();
    while (credit.gt(0) && open.length > 0) {
      const first = open[0];
      if (first.amount.lte(credit)) {
        credit = credit.minus(first.amount);
        open.shift();
      } else {
        first.amount = first.amount.minus(credit);
        credit = new Decimal(0);
      }
    }
    if (credit.gt(0)) {
      advance = advance.plus(credit);
    }
  }

  return open
    .map((row) => ({
      date: row.date,
      amount: row.amount.toDecimalPlaces(2),
    }))
    .filter((row) => row.amount.gt(0));
}

export function bucketUnpaidDue(
  unpaid: UnpaidDue[],
  asOf: Date = new Date(),
): { totalDue: Decimal; buckets: Record<AgeingBucketKey, Decimal> } {
  const buckets = emptyAgeingBuckets();
  let totalDue = new Decimal(0);
  for (const row of unpaid) {
    const key = ageingBucketKey(utcDayDiff(row.date, asOf));
    buckets[key] = buckets[key].plus(row.amount);
    totalDue = totalDue.plus(row.amount);
  }
  return { totalDue, buckets };
}

export function toAgeingReportRow(
  id: string,
  name: string,
  aged: { totalDue: Decimal; buckets: Record<AgeingBucketKey, Decimal> },
  category: AgeingReportRow["category"],
  sector: string | null,
  state: string | null,
): AgeingReportRow {
  const buckets = Object.fromEntries(
    AGEING_BUCKETS.map((bucket) => [
      bucket.key,
      aged.buckets[bucket.key].toDecimalPlaces(2).toString(),
    ]),
  ) as Record<AgeingBucketKey, string>;

  return {
    id,
    name,
    category,
    sector,
    state,
    totalDue: aged.totalDue.toDecimalPlaces(2).toString(),
    ...buckets,
  };
}
