"use server";

import { Decimal } from "@prisma/client/runtime/library";
import {
  actionFail,
  actionOk,
  type ActionResult,
} from "@/lib/actions/actionResult";
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

type OpenDueData = {
  companyId: string;
  amount: Decimal;
  dueDate: Date | null;
  remark: string | null;
};

function parseAmount(value: string | number): Decimal | string {
  try {
    const d = toDecimal(value);
    if (!d.isFinite()) return "Amount must be a valid number";
    return d.toDecimalPlaces(2);
  } catch {
    return "Amount must be a valid number";
  }
}

function parseDueDate(value: string | null | undefined): Date | null | string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return "Due date must be a valid date";
  }
  return date;
}

function toOpenDueData(input: InvestmentOpenDueInput): OpenDueData | string {
  if (!input.companyId.trim()) {
    return "Company is required";
  }
  const amount = parseAmount(input.amount);
  if (typeof amount === "string") return amount;
  const dueDate = parseDueDate(input.dueDate);
  if (typeof dueDate === "string") return dueDate;
  return {
    companyId: input.companyId.trim(),
    amount,
    dueDate,
    remark: input.remark?.trim() || null,
  };
}

function formatDueDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function revalidateOpenDuePaths() {
  revalidatePath("/investments");
  revalidatePath("/investments/open-due");
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

export async function createInvestmentOpenDue(
  input: InvestmentOpenDueInput,
): Promise<ActionResult> {
  const data = toOpenDueData(input);
  if (typeof data === "string") return actionFail(data);
  await prisma.investmentOpenDue.create({
    data,
    select: { id: true },
  });
  revalidateOpenDuePaths();
  return actionOk();
}

export async function updateInvestmentOpenDue(
  id: string,
  input: InvestmentOpenDueInput,
): Promise<ActionResult> {
  const data = toOpenDueData(input);
  if (typeof data === "string") return actionFail(data);
  await prisma.investmentOpenDue.update({
    where: { id },
    data,
    select: { id: true },
  });
  revalidateOpenDuePaths();
  return actionOk();
}

export async function deleteInvestmentOpenDue(
  id: string,
): Promise<ActionResult> {
  await prisma.investmentOpenDue.delete({ where: { id } });
  revalidateOpenDuePaths();
  return actionOk();
}
