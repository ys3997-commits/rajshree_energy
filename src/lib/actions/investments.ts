"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { capitalizeName } from "@/lib/domain/format";
import { toDecimal } from "@/lib/domain/computations";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type InvestmentCompanyListRow = {
  id: string;
  name: string;
  openingDue: string;
  remark: string | null;
};

export type InvestmentCompanyInput = {
  name: string;
  openingDue?: string | number | null;
  remark?: string | null;
};

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

function toCompanyData(input: InvestmentCompanyInput) {
  const name = capitalizeName(input.name) ?? input.name.trim();
  if (!name) throw new Error("Company name is required");
  return {
    name,
    openingDue: parseOpeningDue(input.openingDue),
    remark: input.remark?.trim() || null,
  };
}

export async function listInvestmentCompanies(): Promise<
  InvestmentCompanyListRow[]
> {
  const rows = await prisma.investmentCompany.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      openingDue: true,
      remark: true,
    },
  });
  return rows.map((row) => ({
    ...row,
    openingDue: row.openingDue.toString(),
  }));
}

export async function createInvestmentCompany(input: InvestmentCompanyInput) {
  await prisma.investmentCompany.create({
    data: toCompanyData(input),
    select: { id: true },
  });
  revalidatePath("/investments");
  revalidatePath("/investments/open-due");
  revalidatePath("/reports/investments");
}

export async function updateInvestmentCompany(
  id: string,
  input: InvestmentCompanyInput,
) {
  await prisma.investmentCompany.update({
    where: { id },
    data: toCompanyData(input),
    select: { id: true },
  });
  revalidatePath("/investments");
  revalidatePath("/investments/open-due");
  revalidatePath("/reports/investments");
}

export async function deleteInvestmentCompany(id: string) {
  const [dueCount, paymentCount, discountCount] = await Promise.all([
    prisma.investmentOpenDue.count({ where: { companyId: id } }),
    prisma.payment.count({ where: { investmentCompanyId: id } }),
    prisma.discount.count({ where: { investmentCompanyId: id } }),
  ]);
  if (dueCount > 0) {
    throw new Error(
      "Cannot delete: this company has one or more open due entries",
    );
  }
  if (paymentCount > 0 || discountCount > 0) {
    throw new Error(
      "Cannot delete: this company is used by one or more bank entries",
    );
  }
  await prisma.investmentCompany.delete({ where: { id } });
  revalidatePath("/investments");
  revalidatePath("/investments/open-due");
  revalidatePath("/payments");
  revalidatePath("/reports/investments");
}
