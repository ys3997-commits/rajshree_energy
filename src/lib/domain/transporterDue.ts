import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal, type DecimalLike } from "@/lib/domain/computations";
import { dispatchedAmount } from "@/lib/domain/customerDue";

/** Freight billed to Rajshree: freight PMT × dispatched quantity. */
export function freightBilledAmount(
  freightPerMt: DecimalLike | null | undefined,
  dispatchedQuantity: DecimalLike | null | undefined,
): Decimal {
  return dispatchedAmount(freightPerMt, dispatchedQuantity);
}

/** 1% hold-back on billed freight when computing transporter payable due. */
export const TRANSPORTER_FREIGHT_DUE_FACTOR = new Decimal("0.99");

function computeDue(
  openingDue: DecimalLike | null | undefined,
  freightBilled: DecimalLike,
  paid: DecimalLike,
  received: DecimalLike,
  freightFactor: Decimal,
): Decimal {
  const opening = openingDue == null ? new Decimal(0) : toDecimal(openingDue);
  return opening
    .plus(toDecimal(freightBilled).mul(freightFactor))
    .minus(toDecimal(paid))
    .plus(toDecimal(received))
    .toDecimalPlaces(2);
}

/** Total due: opening due + total freight − fund paid + fund received. */
export function computeTransporterDue(
  openingDue: DecimalLike | null | undefined,
  freightBilled: DecimalLike,
  paid: DecimalLike,
  received: DecimalLike,
): Decimal {
  return computeDue(openingDue, freightBilled, paid, received, new Decimal(1));
}

/** Transporter due: opening due + (freight billed × 0.99) − fund paid + fund received. */
export function computeTransporterPayableDue(
  openingDue: DecimalLike | null | undefined,
  freightBilled: DecimalLike,
  paid: DecimalLike,
  received: DecimalLike,
): Decimal {
  return computeDue(
    openingDue,
    freightBilled,
    paid,
    received,
    TRANSPORTER_FREIGHT_DUE_FACTOR,
  );
}
