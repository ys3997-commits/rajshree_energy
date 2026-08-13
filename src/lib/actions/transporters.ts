"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { capitalizeName } from "@/lib/domain/format";
import { toDecimal } from "@/lib/domain/computations";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type TransporterListRow = {
  id: string;
  name: string;
  ownerName: string | null;
  ownerContactNumber1: string | null;
  ownerContactNumber2: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  openingDue: string;
};

export async function listTransporters(): Promise<TransporterListRow[]> {
  const rows = await prisma.transporter.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      ownerName: true,
      ownerContactNumber1: true,
      ownerContactNumber2: true,
      email: true,
      city: true,
      state: true,
      openingDue: true,
    },
  });
  return rows.map((row) => ({
    ...row,
    openingDue: row.openingDue.toString(),
  }));
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
  /** Carry-forward balance; treated as on 01/08/2026. */
  openingDue?: string | number | null;
};

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

function parseOpeningDue(value: string | number | null | undefined): Decimal {
  if (value === undefined || value === null || value === "") {
    return new Decimal(0);
  }
  const d = toDecimal(value);
  if (!d.isFinite()) {
    throw new Error("Opening due must be a valid amount");
  }
  return d.toDecimalPlaces(2);
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
    openingDue: parseOpeningDue(input.openingDue),
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
  revalidatePath(`/transporters/${id}`);
  return row;
}

export async function deleteTransporter(id: string) {
  const [dispatchCount, paymentCount, discountCount] = await Promise.all([
    prisma.dispatch.count({ where: { transporterId: id } }),
    prisma.payment.count({ where: { transporterId: id } }),
    prisma.discount.count({ where: { transporterId: id } }),
  ]);
  if (dispatchCount > 0) {
    throw new Error(
      "Cannot delete: this transporter is used by one or more dispatches",
    );
  }
  if (paymentCount > 0 || discountCount > 0) {
    throw new Error(
      "Cannot delete: this transporter has payment or discount records",
    );
  }
  await prisma.transporter.delete({ where: { id } });
  revalidatePath("/transporters");
}
