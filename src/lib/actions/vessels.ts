"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const qualityClassInclude = {
  origin: { select: { id: true, name: true } },
  qualityOption: { select: { id: true, name: true } },
} as const;

export async function listVessels() {
  return prisma.vessel.findMany({
    include: {
      qualityClass: { include: qualityClassInclude },
      port: { select: { id: true, name: true } },
    },
    orderBy: { vesselName: "asc" },
  });
}

export type VesselInput = {
  vesselName: string;
  qualityClassId?: string | null;
  portId?: string | null;
};

export async function createVessel(input: VesselInput) {
  const row = await prisma.vessel.create({
    data: {
      vesselName: input.vesselName,
      qualityClassId: input.qualityClassId || null,
      portId: input.portId || null,
    },
  });
  revalidatePath("/vessels");
  return { id: row.id };
}

export async function updateVessel(id: string, input: VesselInput) {
  const existing = await prisma.vessel.findUnique({ where: { id } });
  if (!existing) throw new Error("Vessel not found");

  const row = await prisma.vessel.update({
    where: { id },
    data: {
      vesselName: input.vesselName,
      qualityClassId: input.qualityClassId || null,
      portId: input.portId || null,
    },
  });
  revalidatePath("/vessels");
  return { id: row.id };
}

export async function deleteVessel(id: string) {
  const [purchaseOrders, dispatches] = await Promise.all([
    prisma.purchaseOrder.count({ where: { vesselId: id } }),
    prisma.dispatch.count({ where: { vesselId: id } }),
  ]);
  if (purchaseOrders + dispatches > 0) {
    throw new Error(
      "Cannot delete: this vessel is used by purchase orders or dispatches",
    );
  }
  await prisma.vessel.delete({ where: { id } });
  revalidatePath("/vessels");
}
