export type CollectionCallSchedule = {
  plannedCallDate: string | null;
  followUp1: string | null;
  followUp2: string | null;
  followUp3: string | null;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FOLLOW_UP_LIMIT = 3;

export function isoDateOnly(
  value: Date | string | null | undefined,
): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  const trimmed = value.trim().slice(0, 10);
  return ISO_DATE.test(trimmed) ? trimmed : null;
}

/** Calendar day in India, where collection calls are planned. */
export function collectionChangeDate(now = new Date()): string {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const iso = formatted.slice(0, 10);
  if (!ISO_DATE.test(iso)) throw new Error("Invalid change date");
  return iso;
}

function requireIsoDate(
  value: string | null | undefined,
  label: string,
): string | null {
  if (value == null || value.trim() === "") return null;
  const iso = value.trim().slice(0, 10);
  if (!ISO_DATE.test(iso)) throw new Error(`Invalid ${label}`);
  return iso;
}

function followUpsOf(schedule: CollectionCallSchedule): string[] {
  return [schedule.followUp1, schedule.followUp2, schedule.followUp3].flatMap(
    (date) => {
      const iso = isoDateOnly(date);
      return iso ? [iso] : [];
    },
  );
}

function uniqueFollowUps(dates: Array<string | null>): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const date of dates) {
    const iso = isoDateOnly(date);
    if (!iso || seen.has(iso)) continue;
    seen.add(iso);
    unique.push(iso);
  }
  return unique.slice(-FOLLOW_UP_LIMIT);
}

function scheduleFromFollowUps(
  plannedCallDate: string | null,
  followUps: Array<string | null>,
): CollectionCallSchedule {
  const unique = uniqueFollowUps(followUps);
  return {
    plannedCallDate: isoDateOnly(plannedCallDate),
    followUp1: unique[0] ?? null,
    followUp2: unique[1] ?? null,
    followUp3: unique[2] ?? null,
  };
}

/**
 * Drop the planned call and any follow-up on or before the last payment.
 * Remaining follow-ups stay in order, oldest first, each date once.
 */
export function clearCollectionCallsBeforePayment(
  schedule: CollectionCallSchedule,
  lastPaymentDate: string | null | undefined,
): CollectionCallSchedule {
  const payment = isoDateOnly(lastPaymentDate);
  const keep = (date: string | null) => {
    if (!date) return null;
    if (payment && date <= payment) return null;
    return date;
  };
  const followUps = followUpsOf(schedule).flatMap((date) => {
    const kept = keep(date);
    return kept ? [kept] : [];
  });
  return scheduleFromFollowUps(keep(schedule.plannedCallDate), followUps);
}

const EMPTY_SCHEDULE: CollectionCallSchedule = {
  plannedCallDate: null,
  followUp1: null,
  followUp2: null,
  followUp3: null,
};

function normalizeSchedule(
  schedule: CollectionCallSchedule,
): CollectionCallSchedule {
  return scheduleFromFollowUps(
    isoDateOnly(schedule.plannedCallDate),
    followUpsOf(schedule),
  );
}

/**
 * The previous planned date becomes a follow-up only when the change is made
 * on that planned date or later. Only the latest three follow-ups are kept.
 */
function advancePlannedCall(input: {
  schedule: CollectionCallSchedule;
  nextPlannedCallDate: string | null;
  changedOn: string;
}): CollectionCallSchedule {
  const current = normalizeSchedule(input.schedule);
  const nextPlanned = requireIsoDate(
    input.nextPlannedCallDate,
    "planned call date",
  );
  const changedOn = requireIsoDate(input.changedOn, "change date");
  if (!changedOn) throw new Error("Invalid change date");
  if (nextPlanned && nextPlanned < changedOn) {
    throw new Error("Planned call date cannot be in the past");
  }
  if (nextPlanned === current.plannedCallDate) return current;

  let followUps = followUpsOf(current);
  if (current.plannedCallDate && changedOn >= current.plannedCallDate) {
    followUps = [...followUps, current.plannedCallDate];
  }
  return scheduleFromFollowUps(nextPlanned, followUps);
}

/**
 * Replace the planned collection call.
 * Any date on or before the last payment is cleared.
 */
export function applyPlannedCollectionCallChange(input: {
  schedule: CollectionCallSchedule;
  nextPlannedCallDate: string | null;
  changedOn: string;
  lastPaymentDate: string | null;
}): CollectionCallSchedule {
  const current = clearCollectionCallsBeforePayment(
    input.schedule,
    input.lastPaymentDate,
  );
  return clearCollectionCallsBeforePayment(
    advancePlannedCall({
      schedule: current,
      nextPlannedCallDate: input.nextPlannedCallDate,
      changedOn: input.changedOn,
    }),
    input.lastPaymentDate,
  );
}

/** Order in hand above 0 MT ends the sales call schedule. */
export function orderInHandClearsSaleCalls(
  orderInHand: string | number | null | undefined,
): boolean {
  if (orderInHand == null || orderInHand === "") return false;
  const n = typeof orderInHand === "number" ? orderInHand : Number(orderInHand);
  return Number.isFinite(n) && n > 0;
}

export function clearSaleCallsForOrderInHand(
  schedule: CollectionCallSchedule,
  orderInHand: string | number | null | undefined,
): CollectionCallSchedule {
  if (orderInHandClearsSaleCalls(orderInHand)) return EMPTY_SCHEDULE;
  return normalizeSchedule(schedule);
}

/**
 * Replace the planned sales call with the same follow-up shift as collection.
 * Dates on or before the last payment are cleared. The whole schedule clears
 * when order in hand is above 0 MT.
 */
export function applyPlannedSaleCallChange(input: {
  schedule: CollectionCallSchedule;
  nextPlannedCallDate: string | null;
  changedOn: string;
  orderInHand: string | number | null;
  lastPaymentDate: string | null;
}): CollectionCallSchedule {
  const current = clearCollectionCallsBeforePayment(
    clearSaleCallsForOrderInHand(input.schedule, input.orderInHand),
    input.lastPaymentDate,
  );
  return clearCollectionCallsBeforePayment(
    clearSaleCallsForOrderInHand(
      advancePlannedCall({
        schedule: current,
        nextPlannedCallDate: input.nextPlannedCallDate,
        changedOn: input.changedOn,
      }),
      input.orderInHand,
    ),
    input.lastPaymentDate,
  );
}
