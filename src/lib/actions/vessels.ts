"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const qualityClassInclude = {
  origin: { select: { id: true, name: true } },
  qualityOption: { select: { id: true, name: true } },
} as const;

export async function listVessels(options?: { activeOnly?: boolean }) {
  return prisma.vessel.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    include: {
      qualityClass: { include: qualityClassInclude },
      port: { select: { id: true, name: true } },
    },
    orderBy: { vesselName: "asc" },
  });
}

export type VesselInput = {
  vesselName: string;
  qualityClassId: string;
  portId: string;
  active?: boolean;
};

function validateVesselInput(input: VesselInput) {
  if (!input.vesselName.trim()) throw new Error("Vessel name is required");
  if (!input.qualityClassId) throw new Error("Quality class is required");
  if (!input.portId) throw new Error("Port is required");
}

function vesselRelationData(input: VesselInput) {
  return {
    vesselName: input.vesselName.trim(),
    active: input.active ?? true,
    qualityClass: { connect: { id: input.qualityClassId } },
    port: { connect: { id: input.portId } },
  };
}

export async function createVessel(input: VesselInput) {
  validateVesselInput(input);

  const row = await prisma.vessel.create({
    data: vesselRelationData(input),
  });
  revalidatePath("/vessels");
  return { id: row.id };
}

export async function updateVessel(id: string, input: VesselInput) {
  validateVesselInput(input);

  const existing = await prisma.vessel.findUnique({ where: { id } });
  if (!existing) throw new Error("Vessel not found");

  const row = await prisma.vessel.update({
    where: { id },
    data: vesselRelationData(input),
  });
  revalidatePath("/vessels");
  return { id: row.id };
}

export async function updateVesselActive(id: string, active: boolean) {
  const existing = await prisma.vessel.findUnique({ where: { id } });
  if (!existing) throw new Error("Vessel not found");

  await prisma.vessel.update({
    where: { id },
    data: { active },
  });
  revalidatePath("/vessels");
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
