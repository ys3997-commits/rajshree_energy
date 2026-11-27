"use server";

import { Decimal } from "@prisma/client/runtime/library";
import {
  actionFail,
  actionOk,
  type ActionResult,
} from "@/lib/actions/actionResult";
import { capitalizeName } from "@/lib/domain/format";
import { toDecimal } from "@/lib/domain/computations";
import { forgetMemo, memoize } from "@/lib/memoryCache";
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

type CompanyData = {
  name: string;
  openingDue: Decimal;
  remark: string | null;
};

function parseOpeningDue(
  value: string | number | null | undefined,
): Decimal | string {
  if (value === undefined || value === null || value === "") {
    return new Decimal(0);
  }
  try {
    const d = toDecimal(value);
    if (!d.isFinite()) return "Opening due must be a valid amount";
    return d.toDecimalPlaces(2);
  } catch {
    return "Opening due must be a valid amount";
  }
}

function toCompanyData(input: InvestmentCompanyInput): CompanyData | string {
  const name = capitalizeName(input.name) ?? input.name.trim();
  if (!name) return "Company name is required";
  const openingDue = parseOpeningDue(input.openingDue);
  if (typeof openingDue === "string") return openingDue;
  return {
    name,
    openingDue,
    remark: input.remark?.trim() || null,
  };
}

function revalidateInvestmentPaths() {
  forgetMemo("opts:investment-companies");
  revalidatePath("/investments");
  revalidatePath("/investments/open-due");
  revalidatePath("/reports/investments");
  revalidatePath("/reports/investments/ledger");
}

export async function listInvestmentCompanies(): Promise<
  InvestmentCompanyListRow[]
> {
  return memoize("opts:investment-companies", 30_000, async () => {
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
  });
}

export async function createInvestmentCompany(
  input: InvestmentCompanyInput,
): Promise<ActionResult> {
  const data = toCompanyData(input);
  if (typeof data === "string") return actionFail(data);
  await prisma.investmentCompany.create({
    data,
    select: { id: true },
  });
  revalidateInvestmentPaths();
  return actionOk();
}

export async function updateInvestmentCompany(
  id: string,
  input: InvestmentCompanyInput,
): Promise<ActionResult> {
  const data = toCompanyData(input);
  if (typeof data === "string") return actionFail(data);
  await prisma.investmentCompany.update({
    where: { id },
    data,
    select: { id: true },
  });
  revalidateInvestmentPaths();
  return actionOk();
}

export async function deleteInvestmentCompany(
  id: string,
): Promise<ActionResult> {
  const [dueCount, paymentCount, discountCount] = await Promise.all([
    prisma.investmentOpenDue.count({ where: { companyId: id } }),
    prisma.payment.count({ where: { investmentCompanyId: id } }),
    prisma.discount.count({ where: { investmentCompanyId: id } }),
  ]);
  if (dueCount > 0) {
    return actionFail(
      "Cannot delete: this company has one or more open due entries",
    );
  }
  if (paymentCount > 0 || discountCount > 0) {
    return actionFail(
      "Cannot delete: this company is used by one or more bank entries",
    );
  }
  await prisma.investmentCompany.delete({ where: { id } });
  revalidateInvestmentPaths();
  revalidatePath("/payments");
  return actionOk();
}
