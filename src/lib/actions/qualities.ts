"use server";

import { revalidatePath } from "next/cache";
import { formatQualityClass } from "@/lib/domain/format";
import { prisma } from "@/lib/prisma";

const qualityClassInclude = {
  origin: { select: { id: true, name: true } },
  qualityOption: { select: { id: true, name: true } },
} as const;

export async function listOriginOptions() {
  return prisma.originOption.findMany({ orderBy: { name: "asc" } });
}

export async function listQualityOptions() {
  return prisma.qualityOption.findMany({ orderBy: { name: "asc" } });
}

export async function listQualityClasses() {
  const rows = await prisma.qualityClass.findMany({
    include: qualityClassInclude,
  });
  return rows.sort((a, b) =>
    formatQualityClass(a).localeCompare(formatQualityClass(b)),
  );
}

export async function createOriginOption(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Origin name is required");
  const row = await prisma.originOption.create({ data: { name: trimmed } });
  revalidatePath("/qualities");
  revalidatePath("/options");
  return { id: row.id };
}

export async function updateOriginOption(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Origin name is required");
  const row = await prisma.originOption.update({
    where: { id },
    data: { name: trimmed },
  });
  revalidatePath("/qualities");
  revalidatePath("/options");
  revalidatePath("/vessels");
  revalidatePath("/orders");
  revalidatePath("/purchase-orders");
  return { id: row.id };
}

export async function deleteOriginOption(id: string) {
  const used = await prisma.qualityClass.count({ where: { originId: id } });
  if (used > 0) {
    throw new Error(
      "Cannot delete: this origin is used by one or more quality classes",
    );
  }
  await prisma.originOption.delete({ where: { id } });
  revalidatePath("/qualities");
  revalidatePath("/options");
}

export async function createQualityOption(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Quality name is required");
  const row = await prisma.qualityOption.create({ data: { name: trimmed } });
  revalidatePath("/qualities");
  revalidatePath("/options");
  return { id: row.id };
}

export async function updateQualityOption(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Quality name is required");
  const row = await prisma.qualityOption.update({
    where: { id },
    data: { name: trimmed },
  });
  revalidatePath("/qualities");
  revalidatePath("/options");
  revalidatePath("/vessels");
  revalidatePath("/orders");
  revalidatePath("/purchase-orders");
  return { id: row.id };
}

export async function deleteQualityOption(id: string) {
  const used = await prisma.qualityClass.count({
    where: { qualityOptionId: id },
  });
  if (used > 0) {
    throw new Error(
      "Cannot delete: this quality is used by one or more quality classes",
    );
  }
  await prisma.qualityOption.delete({ where: { id } });
  revalidatePath("/qualities");
  revalidatePath("/options");
}

export type QualityClassInput = {
  originId: string;
  domestic: boolean;
  qualityOptionId: string;
};

export async function createQualityClass(input: QualityClassInput) {
  if (!input.originId) throw new Error("Origin is required");
  if (!input.qualityOptionId) throw new Error("Quality is required");

  const row = await prisma.qualityClass.create({
    data: {
      originId: input.originId,
      domestic: input.domestic,
      qualityOptionId: input.qualityOptionId,
    },
  });
  revalidatePath("/qualities");
  revalidatePath("/options");
  revalidatePath("/vessels");
  revalidatePath("/orders");
  revalidatePath("/purchase-orders");
  return { id: row.id };
}

export async function updateQualityClass(id: string, input: QualityClassInput) {
  if (!input.originId) throw new Error("Origin is required");
  if (!input.qualityOptionId) throw new Error("Quality is required");

  const row = await prisma.qualityClass.update({
    where: { id },
    data: {
      originId: input.originId,
      domestic: input.domestic,
      qualityOptionId: input.qualityOptionId,
    },
  });
  revalidatePath("/qualities");
  revalidatePath("/options");
  revalidatePath("/vessels");
  revalidatePath("/orders");
  revalidatePath("/purchase-orders");
  return { id: row.id };
}

export async function deleteQualityClass(id: string) {
  const [vessels, orders, purchases] = await Promise.all([
    prisma.vessel.count({ where: { qualityClassId: id } }),
    prisma.order.count({ where: { qualityClassId: id } }),
    prisma.purchaseOrder.count({ where: { qualityClassId: id } }),
  ]);
  if (vessels + orders + purchases > 0) {
    throw new Error(
      "Cannot delete: this quality class is used by vessels or orders",
    );
  }
  await prisma.qualityClass.delete({ where: { id } });
  revalidatePath("/qualities");
  revalidatePath("/options");
}
