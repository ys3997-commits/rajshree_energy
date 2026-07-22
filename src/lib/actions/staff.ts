"use server";

import { capitalizeName } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const STAFF_PATHS = ["/options", "/", "/customers", "/orders", "/dispatches"] as const;

function revalidateStaffPaths() {
  for (const path of STAFF_PATHS) {
    revalidatePath(path);
  }
}

export async function listStaff() {
  return prisma.staff.findMany({ orderBy: { name: "asc" } });
}

export async function createStaff(input: { name: string; role?: string | null }) {
  const name = capitalizeName(input.name);
  if (!name) throw new Error("Name is required");
  const row = await prisma.staff.create({
    data: { name, role: capitalizeName(input.role) },
  });
  revalidateStaffPaths();
  return row;
}

export async function updateStaff(
  id: string,
  input: { name: string; role?: string | null },
) {
  const name = capitalizeName(input.name);
  if (!name) throw new Error("Name is required");
  const row = await prisma.staff.update({
    where: { id },
    data: { name, role: capitalizeName(input.role) },
  });
  revalidateStaffPaths();
  return row;
}

export async function deleteStaff(id: string) {
  await prisma.staff.delete({ where: { id } });
  revalidateStaffPaths();
}
