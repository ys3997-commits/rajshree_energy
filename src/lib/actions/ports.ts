"use server";

import { capitalizeName } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Map existing port names to GST state (case-insensitive). */
const PORT_STATE_BY_NAME: Record<string, string> = {
  haldia: "West Bengal",
  "haldia port": "West Bengal",
  "west bengal": "West Bengal",
  jharkhand: "Jharkhand",
  assam: "Assam",
  odisha: "Odisha",
  vishakapatnam: "Andhra Pradesh",
  visakhapatnam: "Andhra Pradesh",
};

function normalizePortState(state: string): string {
  const trimmed = capitalizeName(state);
  if (!trimmed) throw new Error("Port state is required");
  return trimmed;
}

function portStateForName(name: string): string {
  const key = name.trim().toLowerCase();
  if (PORT_STATE_BY_NAME[key]) return PORT_STATE_BY_NAME[key];
  if (key.includes("haldia")) return "West Bengal";
  return capitalizeName(name) ?? name;
}

export async function listPortOptions() {
  return prisma.portOption.findMany({ orderBy: { name: "asc" } });
}

export async function createPortOption(name: string, state: string) {
  const trimmed = capitalizeName(name);
  if (!trimmed) throw new Error("Port name is required");
  const row = await prisma.portOption.create({
    data: {
      name: trimmed,
      state: normalizePortState(state),
    },
  });
  revalidatePath("/vessels");
  revalidatePath("/options");
  revalidatePath("/orders");
  return { id: row.id };
}

export async function updatePortOption(
  id: string,
  name: string,
  state: string,
) {
  const trimmed = capitalizeName(name);
  if (!trimmed) throw new Error("Port name is required");
  const row = await prisma.portOption.update({
    where: { id },
    data: {
      name: trimmed,
      state: normalizePortState(state),
    },
  });
  revalidatePath("/vessels");
  revalidatePath("/options");
  revalidatePath("/orders");
  revalidatePath("/reports/master-dispatch");
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

/** One-off backfill for ports created before state was required. */
export async function backfillPortStates() {
  const ports = await prisma.portOption.findMany();
  let updated = 0;
  for (const port of ports) {
    const nextState = portStateForName(port.name);
    if (port.state !== nextState) {
      await prisma.portOption.update({
        where: { id: port.id },
        data: { state: nextState },
      });
      updated += 1;
    }
  }
  revalidatePath("/options");
  revalidatePath("/reports/master-dispatch");
  return { updated, total: ports.length };
}
