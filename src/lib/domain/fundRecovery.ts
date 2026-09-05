import { Decimal } from "@prisma/client/runtime/library";
import { utcDayDiff, type AgeingMovement } from "@/lib/domain/ageing";
import { toDecimal } from "@/lib/domain/computations";

export type FundRecoveryMovement = AgeingMovement & {
  /**
   * When true, recoveries against this charge count toward average days
   * (sale supplies / opening due). Other charges still participate in FIFO.
   */
  countsForRecovery?: boolean;
};

export type FundRecoveryOptions = {
  /** Inclusive UTC day start for charges that count in the average. */
  chargeDateFrom?: Date;
  /** Inclusive UTC day end for charges that count in the average. */
  chargeDateTo?: Date;
};

type OpenCharge = {
  date: Date;
  amount: Decimal;
  countsForRecovery: boolean;
};

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function chargeInRange(
  chargeDate: Date,
  options: FundRecoveryOptions,
): boolean {
  const day = startOfUtcDay(chargeDate).getTime();
  if (options.chargeDateFrom) {
    if (day < startOfUtcDay(options.chargeDateFrom).getTime()) return false;
  }
  if (options.chargeDateTo) {
    if (day > startOfUtcDay(options.chargeDateTo).getTime()) return false;
  }
  return true;
}

function recordRecovery(
  charge: OpenCharge,
  recovered: Decimal,
  creditDate: Date,
  options: FundRecoveryOptions,
  totals: { weightedDays: Decimal; recoveredAmount: Decimal },
) {
  if (!charge.countsForRecovery || recovered.lte(0)) return;
  if (!chargeInRange(charge.date, options)) return;

  const days = Math.max(0, utcDayDiff(charge.date, creditDate));
  totals.weightedDays = totals.weightedDays.plus(recovered.mul(days));
  totals.recoveredAmount = totals.recoveredAmount.plus(recovered);
}

/**
 * Amount-weighted average days from supply (charge) date to the credit that
 * cleared it, using the same FIFO rules as ageing.
 *
 * Prepayments applied when goods are supplied count as 0 days.
 * Only movements with `countsForRecovery` contribute to the average; other
 * charges still absorb credits in FIFO order.
 */
export function averageFundRecoveryDays(
  movements: FundRecoveryMovement[],
  options: FundRecoveryOptions = {},
): number | null {
  const sorted = movements
    .map((movement, index) => ({
      date: startOfUtcDay(movement.date),
      amount: toDecimal(movement.amount),
      sortKey: movement.sortKey ?? "",
      countsForRecovery: movement.countsForRecovery === true,
      index,
    }))
    .filter(
      (movement) => movement.amount.isFinite() && !movement.amount.isZero(),
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

  const open: OpenCharge[] = [];
  let advance = new Decimal(0);
  const totals = {
    weightedDays: new Decimal(0),
    recoveredAmount: new Decimal(0),
  };

  for (const movement of sorted) {
    if (movement.amount.gt(0)) {
      let charge = movement.amount;
      if (advance.gt(0)) {
        const take = Decimal.min(advance, charge);
        advance = advance.minus(take);
        charge = charge.minus(take);
        recordRecovery(
          {
            date: movement.date,
            amount: take,
            countsForRecovery: movement.countsForRecovery,
          },
          take,
          movement.date,
          options,
          totals,
        );
      }
      if (charge.gt(0)) {
        open.push({
          date: movement.date,
          amount: charge,
          countsForRecovery: movement.countsForRecovery,
        });
      }
      continue;
    }

    let credit = movement.amount.abs();
    while (credit.gt(0) && open.length > 0) {
      const first = open[0];
      if (first.amount.lte(credit)) {
        recordRecovery(first, first.amount, movement.date, options, totals);
        credit = credit.minus(first.amount);
        open.shift();
      } else {
        recordRecovery(first, credit, movement.date, options, totals);
        first.amount = first.amount.minus(credit);
        credit = new Decimal(0);
      }
    }
    if (credit.gt(0)) {
      advance = advance.plus(credit);
    }
  }

  if (totals.recoveredAmount.lte(0)) return null;
  return Math.round(
    Number(totals.weightedDays.div(totals.recoveredAmount).toFixed(4)),
  );
}
