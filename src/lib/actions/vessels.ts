"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  toDecimal,
  withVesselComputed,
  type DecimalLike,
} from "@/lib/domain/computations";

export async function listVessels() {
  const rows = await prisma.vessel.findMany({
    include: { importer: { select: { id: true, name: true } } },
    orderBy: { vesselName: "asc" },
  });
  return rows.map(withVesselComputed);
}

export async function listVesselsWithBalance() {
  const rows = await listVessels();
  return rows.filter((v) => v.balanceQuantity.gt(0));
}

export type VesselInput = {
  vesselName: string;
  importerId: string;
  quality?: string | null;
  quantity: DecimalLike;
};

export async function createVessel(input: VesselInput) {
  const quantity = toDecimal(input.quantity);
  if (quantity.lt(0)) throw new Error("Quantity must be non-negative");

  const row = await prisma.vessel.create({
    data: {
      vesselName: input.vesselName,
      importerId: input.importerId,
      quality: input.quality || null,
      quantity,
    },
  });
  revalidatePath("/vessels");
  return { id: row.id };
}

export async function updateVessel(id: string, input: VesselInput) {
  const existing = await prisma.vessel.findUnique({ where: { id } });
  if (!existing) throw new Error("Vessel not found");

  const quantity = toDecimal(input.quantity);
  if (quantity.lt(existing.dispatchedQuantity)) {
    throw new Error(
      `Cannot set quantity below dispatchedQuantity (${existing.dispatchedQuantity})`,
    );
  }

  const row = await prisma.vessel.update({
    where: { id },
    data: {
      vesselName: input.vesselName,
      importerId: input.importerId,
      quality: input.quality || null,
      quantity,
    },
  });
  revalidatePath("/vessels");
  return { id: row.id };
}

export async function deleteVessel(id: string) {
  await prisma.vessel.delete({ where: { id } });
  revalidatePath("/vessels");
}
