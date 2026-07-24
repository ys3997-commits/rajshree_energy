"use server";

import { revalidatePath } from "next/cache";
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

/** Set or clear the next planned collection call date for a customer. */
export async function updatePlannedCollectionCall(
  customerId: string,
  date: string | null,
): Promise<{ plannedCollectionCallDate: string | null }> {
  if (!customerId) throw new Error("Customer is required");

  const existing = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true },
  });
  if (!existing) throw new Error("Customer not found");

  const plannedCollectionCallDate = parseOptionalDate(date);

  const row = await prisma.customer.update({
    where: { id: customerId },
    data: { plannedCollectionCallDate },
    select: { plannedCollectionCallDate: true },
  });

  revalidatePath("/payments");

  return {
    plannedCollectionCallDate: row.plannedCollectionCallDate
      ? row.plannedCollectionCallDate.toISOString().slice(0, 10)
      : null,
  };
}
