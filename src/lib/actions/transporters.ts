"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listTransporters() {
  return prisma.transporter.findMany({ orderBy: { name: "asc" } });
}

export async function getTransporter(id: string) {
  return prisma.transporter.findUnique({
    where: { id },
    include: {
      dispatches: {
        include: {
          order: { select: { id: true, poNumber: true } },
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
              importer: { select: { name: true } },
              vessel: { select: { vesselName: true } },
            },
          },
        },
        orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
      },
    },
  });
}

export type TransporterInput = {
  name: string;
  area?: string | null;
  contactPersonName?: string | null;
  contactNumber?: string | null;
};

export async function createTransporter(input: TransporterInput) {
  const row = await prisma.transporter.create({
    data: {
      name: input.name,
      area: input.area || null,
      contactPersonName: input.contactPersonName || null,
      contactNumber: input.contactNumber || null,
    },
  });
  revalidatePath("/transporters");
  return row;
}

export async function updateTransporter(id: string, input: TransporterInput) {
  const row = await prisma.transporter.update({
    where: { id },
    data: {
      name: input.name,
      area: input.area || null,
      contactPersonName: input.contactPersonName || null,
      contactNumber: input.contactNumber || null,
    },
  });
  revalidatePath("/transporters");
  return row;
}

export async function deleteTransporter(id: string) {
  await prisma.transporter.delete({ where: { id } });
  revalidatePath("/transporters");
}
