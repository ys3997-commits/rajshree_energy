"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listStaff() {
  return prisma.staff.findMany({ orderBy: { name: "asc" } });
}

export async function createStaff(input: { name: string; role?: string | null }) {
  const row = await prisma.staff.create({
    data: { name: input.name, role: input.role || null },
  });
  revalidatePath("/staff");
  return row;
}

export async function updateStaff(
  id: string,
  input: { name: string; role?: string | null },
) {
  const row = await prisma.staff.update({
    where: { id },
    data: { name: input.name, role: input.role || null },
  });
  revalidatePath("/staff");
  return row;
}

export async function deleteStaff(id: string) {
  await prisma.staff.delete({ where: { id } });
  revalidatePath("/staff");
}
