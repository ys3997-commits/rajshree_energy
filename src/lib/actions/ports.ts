"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listPortOptions() {
  return prisma.portOption.findMany({ orderBy: { name: "asc" } });
}

export async function createPortOption(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Port name is required");
  const row = await prisma.portOption.create({ data: { name: trimmed } });
  revalidatePath("/vessels");
  revalidatePath("/options");
  return { id: row.id };
}

export async function updatePortOption(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Port name is required");
  const row = await prisma.portOption.update({
    where: { id },
    data: { name: trimmed },
  });
  revalidatePath("/vessels");
  revalidatePath("/options");
  return { id: row.id };
}

export async function deletePortOption(id: string) {
  const [vesselCount, orderCount] = await Promise.all([
    prisma.vessel.count({ where: { portId: id } }),
    prisma.order.count({ where: { portId: id } }),
  ]);
  if (vesselCount > 0 || orderCount > 0) {
    throw new Error(
      "Cannot delete: this port is used by one or more vessels or orders",
    );
  }
  await prisma.portOption.delete({ where: { id } });
  revalidatePath("/vessels");
  revalidatePath("/options");
}
