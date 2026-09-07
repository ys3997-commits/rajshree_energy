"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { toDecimal } from "@/lib/domain/computations";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type InvestmentOpenDueListRow = {
  id: string;
  companyId: string;
  companyName: string;
  amount: string;
  dueDate: string | null;
  remark: string | null;
};

export type InvestmentOpenDueInput = {
  companyId: string;
  amount: string | number;
  dueDate?: string | null;
  remark?: string | null;
};

function parseAmount(value: string | number): Decimal {
  const d = toDecimal(value);
  if (!d.isFinite()) {
    throw new Error("Amount must be a valid number");
  }
  return d.toDecimalPlaces(2);
}

function parseDueDate(value: string | null | undefined): Date | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Due date must be a valid date");
  }
  return date;
}

function toOpenDueData(input: InvestmentOpenDueInput) {
  if (!input.companyId.trim()) {
    throw new Error("Company is required");
  }
  return {
    companyId: input.companyId.trim(),
    amount: parseAmount(input.amount),
    dueDate: parseDueDate(input.dueDate),
    remark: input.remark?.trim() || null,
  };
}

function formatDueDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export async function listInvestmentOpenDues(): Promise<
  InvestmentOpenDueListRow[]
> {
  const rows = await prisma.investmentOpenDue.findMany({
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      companyId: true,
      amount: true,
      dueDate: true,
      remark: true,
      company: { select: { name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    companyId: row.companyId,
    companyName: row.company.name,
    amount: row.amount.toString(),
    dueDate: formatDueDate(row.dueDate),
    remark: row.remark,
  }));
}

export async function createInvestmentOpenDue(input: InvestmentOpenDueInput) {
  await prisma.investmentOpenDue.create({
    data: toOpenDueData(input),
    select: { id: true },
  });
  revalidatePath("/investments");
  revalidatePath("/investments/open-due");
}

export async function updateInvestmentOpenDue(
  id: string,
  input: InvestmentOpenDueInput,
) {
  await prisma.investmentOpenDue.update({
    where: { id },
    data: toOpenDueData(input),
    select: { id: true },
  });
  revalidatePath("/investments");
  revalidatePath("/investments/open-due");
}

export async function deleteInvestmentOpenDue(id: string) {
  await prisma.investmentOpenDue.delete({ where: { id } });
  revalidatePath("/investments");
  revalidatePath("/investments/open-due");
}
