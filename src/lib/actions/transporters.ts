"use server";

import { capitalizeName } from "@/lib/domain/format";
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
  ownerName?: string | null;
  ownerContactNumber1?: string | null;
  ownerContactNumber2?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
};

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

function toTransporterData(input: TransporterInput) {
  return {
    name: capitalizeName(input.name) ?? input.name.trim(),
    ownerName: capitalizeName(input.ownerName),
    ownerContactNumber1: normalizePhone(input.ownerContactNumber1),
    ownerContactNumber2: normalizePhone(input.ownerContactNumber2),
    email: input.email || null,
    city: input.city || null,
    state: input.state || null,
  };
}

export async function createTransporter(input: TransporterInput) {
  const row = await prisma.transporter.create({
    data: toTransporterData(input),
  });
  revalidatePath("/transporters");
  return row;
}

export async function updateTransporter(id: string, input: TransporterInput) {
  const row = await prisma.transporter.update({
    where: { id },
    data: toTransporterData(input),
  });
  revalidatePath("/transporters");
  return row;
}

export async function deleteTransporter(id: string) {
  await prisma.transporter.delete({ where: { id } });
  revalidatePath("/transporters");
}
