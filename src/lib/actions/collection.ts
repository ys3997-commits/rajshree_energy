"use server";

import { revalidatePath } from "next/cache";
import { CollectionThrough } from "@/generated/prisma";
import { AccessDeniedError, requirePage } from "@/lib/auth/access";
import {
  COLLECTION_ENGINE_PAGE_KEY,
  getStaffReportExecScope,
  rowMatchesExecScope,
} from "@/lib/auth/report-exec-access";
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

/** Set or clear the next planned collection call date for a customer. */
export async function updatePlannedCollectionCall(
  customerId: string,
  date: string | null,
): Promise<{ plannedCollectionCallDate: string | null }> {
  if (!customerId) throw new Error("Customer is required");

  await assertCollectionCustomerAccess(customerId);

  const plannedCollectionCallDate = parseOptionalDate(date);

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: { plannedCollectionCallDate },
    select: { plannedCollectionCallDate: true },
  });

  revalidatePath("/reports/collection");
  revalidatePath("/reports/collection/vendor");

  return {
    plannedCollectionCallDate: row.plannedCollectionCallDate
      ? row.plannedCollectionCallDate.toISOString().slice(0, 10)
      : null,
  };
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
