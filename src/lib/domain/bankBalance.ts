import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal, type DecimalLike } from "@/lib/domain/computations";

/**
 * Current bank balance: opening balance + fund received − fund paid.
 */
export function bankAccountBalance(
  openingBalance: DecimalLike,
  fundReceived: DecimalLike,
  fundPaid: DecimalLike,
): Decimal {
  const opening = toDecimal(openingBalance);
  const received = toDecimal(fundReceived);
  const paid = toDecimal(fundPaid);
  const base = opening.isFinite() ? opening : new Decimal(0);
  const inAmount = received.isFinite() ? received : new Decimal(0);
  const outAmount = paid.isFinite() ? paid : new Decimal(0);
  return base.plus(inAmount).minus(outAmount).toDecimalPlaces(2);
}
