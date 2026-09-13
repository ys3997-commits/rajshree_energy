"use server";

import { type Prisma } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import { hasDateFilter, utcDayRange } from "@/lib/domain/dateRange";
import { canModifySameDayEntry } from "@/lib/auth/sameDayEntryModify";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requirePage, type Access } from "@/lib/auth/access";

const VEG_PAYMENTS_PAGE_SIZE = 35;
const VEG_PAYMENT_PAGE_KEY = "reports-veg-payment";

export type VegPaymentInput = {
  date: string;
  vegId: string;
  amount: string | number;
};

export type VegPaymentRow = {
  id: string;
  date: string;
  vegId: string;
  vegName: string;
  customerId: string;
  customerName: string;
  amount: string;
  canEdit: boolean;
  canDelete: boolean;
};

export type VegPaymentTotals = {
  paid: string;
};

export type VegPaymentListResult = {
  rows: VegPaymentRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: VegPaymentTotals | null;
};

function parseDate(value: string): Date {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Date is required");
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
}

function canModifyVegPayment(
  access: Exclude<Access, { kind: "none" }>,
  row: { createdAt: Date; createdByStaffId: string | null },
): boolean {
  return canModifySameDayEntry(access, row);
}

const vegPaymentInclude = {
  veg: {
    select: {
      id: true,
      name: true,
      customerId: true,
      customer: { select: { name: true } },
    },
  },
} as const;

function toVegPaymentRow(
  row: {
    id: string;
    date: Date;
    createdAt: Date;
    createdByStaffId: string | null;
    vegId: string;
    amount: { toString(): string };
    veg: {
      name: string;
      customerId: string;
      customer: { name: string };
    };
  },
  access: Exclude<Access, { kind: "none" }>,
): VegPaymentRow {
  const canModify = canModifyVegPayment(access, row);
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    vegId: row.vegId,
    vegName: row.veg.name,
    customerId: row.veg.customerId,
    customerName: row.veg.customer.name,
    amount: row.amount.toString(),
    canEdit: canModify,
    canDelete: canModify,
  };
}

function validateVegPaymentInput(input: VegPaymentInput) {
  const vegId = input.vegId.trim();
  if (!vegId) throw new Error("Veg is required");
  const amount = toDecimal(input.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  return {
    date: parseDate(input.date),
    vegId,
    amount,
  };
}

async function assertVegExists(vegId: string) {
  const veg = await prisma.veg.findUnique({
    where: { id: vegId },
    select: { id: true },
  });
  if (!veg) throw new Error("Veg not found");
}

function revalidateVegPaymentPaths() {
  revalidatePath("/reports/veg");
  revalidatePath("/reports/veg/ledger");
}

function vegPaymentWhere(options?: {
  dateFrom?: string;
  dateTo?: string;
  party?: string;
}): Prisma.VegPaymentWhereInput {
  const and: Prisma.VegPaymentWhereInput[] = [];
  const date = utcDayRange(options?.dateFrom, options?.dateTo);
  if (date) and.push({ date });
  const party = options?.party?.trim() ?? "";
  if (party) and.push({ vegId: party });
  return and.length ? { AND: and } : {};
}

async function vegPaymentTotals(
  where: Prisma.VegPaymentWhereInput,
  dateFrom?: string,
  dateTo?: string,
): Promise<VegPaymentTotals | null> {
  if (!hasDateFilter(dateFrom, dateTo)) return null;
  const agg = await prisma.vegPayment.aggregate({
    where,
    _sum: { amount: true },
  });
  return {
    paid: toDecimal(agg._sum.amount ?? 0).toFixed(2),
  };
}

export async function listVegPayments(options?: {
  page?: number;
  pageSize?: number;
  all?: boolean;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
}): Promise<VegPaymentListResult> {
  const access = await requirePage(VEG_PAYMENT_PAGE_KEY);
  const where = vegPaymentWhere(options);

  if (options?.all) {
    const [rows, totals] = await Promise.all([
      prisma.vegPayment.findMany({
        where,
        include: vegPaymentInclude,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      vegPaymentTotals(where, options.dateFrom, options.dateTo),
    ]);
    return {
      rows: rows.map((row) => toVegPaymentRow(row, access)),
      total: rows.length,
      page: 1,
      pageSize: Math.max(1, rows.length),
      totalPages: 1,
      totals,
    };
  }

  const pageSize = Math.max(
    1,
    Math.min(100, options?.pageSize ?? VEG_PAYMENTS_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));
  const total = await prisma.vegPayment.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const [rows, totals] = await Promise.all([
    prisma.vegPayment.findMany({
      where,
      include: vegPaymentInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    vegPaymentTotals(where, options?.dateFrom, options?.dateTo),
  ]);

  return {
    rows: rows.map((row) => toVegPaymentRow(row, access)),
    total,
    page,
    pageSize,
    totalPages,
    totals,
  };
}

export async function createVegPayment(
  input: VegPaymentInput,
): Promise<VegPaymentRow> {
  const access = await requirePage(VEG_PAYMENT_PAGE_KEY);
  const data = validateVegPaymentInput(input);
  await assertVegExists(data.vegId);

  const row = await prisma.vegPayment.create({
    data: {
      date: data.date,
      amount: data.amount,
      veg: { connect: { id: data.vegId } },
      ...(access.kind === "staff"
        ? { createdByStaff: { connect: { id: access.id } } }
        : {}),
    },
    include: vegPaymentInclude,
  });

  revalidateVegPaymentPaths();
  return toVegPaymentRow(row, access);
}

export async function updateVegPayment(
  id: string,
  input: VegPaymentInput,
): Promise<VegPaymentRow> {
  const access = await requirePage(VEG_PAYMENT_PAGE_KEY);
  const data = validateVegPaymentInput(input);

  const existing = await prisma.vegPayment.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Veg payment not found");
  if (!canModifyVegPayment(access, existing)) {
    throw new AccessDeniedError(
      "You can edit only your own veg payment on the same day.",
    );
  }

  await assertVegExists(data.vegId);

  const row = await prisma.vegPayment.update({
    where: { id },
    data: {
      date: data.date,
      amount: data.amount,
      veg: { connect: { id: data.vegId } },
    },
    include: vegPaymentInclude,
  });

  revalidateVegPaymentPaths();
  return toVegPaymentRow(row, access);
}

export async function deleteVegPayment(id: string) {
  const access = await requirePage(VEG_PAYMENT_PAGE_KEY);
  const existing = await prisma.vegPayment.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Veg payment not found");
  if (!canModifyVegPayment(access, existing)) {
    throw new AccessDeniedError(
      "You can delete only your own veg payment on the same day.",
    );
  }

  await prisma.vegPayment.delete({ where: { id } });
  revalidateVegPaymentPaths();
}
