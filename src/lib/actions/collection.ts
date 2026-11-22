"use server";

import { revalidatePath } from "next/cache";
import { CollectionThrough } from "@/generated/prisma";
import { AccessDeniedError, requirePage } from "@/lib/auth/access";
import {
  COLLECTION_ENGINE_PAGE_KEY,
  getStaffReportExecScope,
  rowMatchesExecScope,
} from "@/lib/auth/report-exec-access";
import {
  applyPlannedCollectionCallChange,
  collectionChangeDate,
  isoDateOnly,
  type CollectionCallSchedule,
} from "@/lib/domain/collectionFollowUps";
import { prisma } from "@/lib/prisma";

function parseOptionalDate(value: string | null): Date | null {
  if (value == null || value.trim() === "") return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Invalid planned call date");
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid planned call date");
  return date;
}

async function assertCollectionCustomerAccess(customerId: string) {
  const access = await requirePage(COLLECTION_ENGINE_PAGE_KEY);

  const existing = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, saleExecutive: true },
  });
  if (!existing) throw new Error("Customer not found");

  const scope = getStaffReportExecScope(access, COLLECTION_ENGINE_PAGE_KEY);
  if (
    scope !== "all" &&
    !rowMatchesExecScope(existing.saleExecutive, scope)
  ) {
    throw new AccessDeniedError();
  }

  return existing;
}

function parseCollectionThrough(
  value: string | null,
): CollectionThrough | null {
  if (value == null || value.trim() === "") return null;
  if (value === CollectionThrough.CALL || value === CollectionThrough.SMS) {
    return value;
  }
  throw new Error("Invalid through value");
}

export type PlannedCollectionCallResult = {
  plannedCollectionCallDate: string | null;
  collectionFollowUp1: string | null;
  collectionFollowUp2: string | null;
  collectionFollowUp3: string | null;
};

function scheduleToDb(schedule: CollectionCallSchedule) {
  const toDb = (iso: string | null) =>
    iso ? new Date(`${iso}T00:00:00.000Z`) : null;
  return {
    plannedCollectionCallDate: toDb(schedule.plannedCallDate),
    collectionFollowUp1: toDb(schedule.followUp1),
    collectionFollowUp2: toDb(schedule.followUp2),
    collectionFollowUp3: toDb(schedule.followUp3),
  };
}

function scheduleFromRow(row: {
  plannedCollectionCallDate: Date | null;
  collectionFollowUp1: Date | null;
  collectionFollowUp2: Date | null;
  collectionFollowUp3: Date | null;
}): PlannedCollectionCallResult {
  return {
    plannedCollectionCallDate: isoDateOnly(row.plannedCollectionCallDate),
    collectionFollowUp1: isoDateOnly(row.collectionFollowUp1),
    collectionFollowUp2: isoDateOnly(row.collectionFollowUp2),
    collectionFollowUp3: isoDateOnly(row.collectionFollowUp3),
  };
}

/** Set or clear the next planned collection call date for a customer. */
export async function updatePlannedCollectionCall(
  customerId: string,
  date: string | null,
): Promise<PlannedCollectionCallResult> {
  if (!customerId) throw new Error("Customer is required");

  await assertCollectionCustomerAccess(customerId);

  const nextPlanned = parseOptionalDate(date);
  const nextPlannedIso = isoDateOnly(nextPlanned);

  const [existing, lastPayment] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        plannedCollectionCallDate: true,
        collectionFollowUp1: true,
        collectionFollowUp2: true,
        collectionFollowUp3: true,
      },
    }),
    prisma.payment.findFirst({
      where: { customerId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { date: true },
    }),
  ]);
  if (!existing) throw new Error("Customer not found");

  const schedule = applyPlannedCollectionCallChange({
    schedule: {
      plannedCallDate: isoDateOnly(existing.plannedCollectionCallDate),
      followUp1: isoDateOnly(existing.collectionFollowUp1),
      followUp2: isoDateOnly(existing.collectionFollowUp2),
      followUp3: isoDateOnly(existing.collectionFollowUp3),
    },
    nextPlannedCallDate: nextPlannedIso,
    changedOn: collectionChangeDate(),
    lastPaymentDate: isoDateOnly(lastPayment?.date),
  });

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: scheduleToDb(schedule),
    select: {
      plannedCollectionCallDate: true,
      collectionFollowUp1: true,
      collectionFollowUp2: true,
      collectionFollowUp3: true,
    },
  });

  revalidatePath("/reports/collection");
  revalidatePath("/reports/collection/vendor");

  return scheduleFromRow(row);
}

/** Set or clear collection follow-up channel (Call / SMS). */
export async function updateCollectionThrough(
  customerId: string,
  through: string | null,
): Promise<{ collectionThrough: "CALL" | "SMS" | null }> {
  if (!customerId) throw new Error("Customer is required");

  await assertCollectionCustomerAccess(customerId);

  const collectionThrough = parseCollectionThrough(through);

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: { collectionThrough },
    select: { collectionThrough: true },
  });

  revalidatePath("/reports/collection");
  revalidatePath("/reports/collection/vendor");

  return { collectionThrough: row.collectionThrough };
}
