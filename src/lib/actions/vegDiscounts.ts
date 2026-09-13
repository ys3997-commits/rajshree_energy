"use server";

import { DiscountStatus, type Prisma } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import { hasDateFilter, utcDayRange } from "@/lib/domain/dateRange";
import { canModifySameDayEntry } from "@/lib/auth/sameDayEntryModify";
import { parseVegFlowType } from "@/app/(dashboard)/reports/veg/vegHref";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requirePage, type Access } from "@/lib/auth/access";

const VEG_DISCOUNTS_PAGE_SIZE = 35;
const VEG_DISCOUNT_PAGE_KEY = "reports-veg-discount";

export type VegDiscountInput = {
  date: string;
  vegId: string;
  status: "RECEIVED" | "PAID" | string;
  amount: string | number;
  remarks?: string | null;
};

export type VegDiscountRow = {
  id: string;
  date: string;
  vegId: string;
  vegName: string;
  customerId: string;
  customerName: string;
  status: "RECEIVED" | "PAID";
  amount: string;
  remarks: string;
  canEdit: boolean;
  canDelete: boolean;
};

export type VegDiscountTotals = {
  received: string;
  paid: string;
  net: string;
};

export type VegDiscountListResult = {
  rows: VegDiscountRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: VegDiscountTotals | null;
};

function parseStatus(value: string): DiscountStatus {
  if (value === DiscountStatus.RECEIVED || value === DiscountStatus.PAID) {
    return value;
  }
  throw new Error("Select Discount Received or Discount Paid");
}

function parseDate(value: string): Date {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Date is required");
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
}

function canModifyVegDiscount(
  access: Exclude<Access, { kind: "none" }>,
  row: { createdAt: Date; createdByStaffId: string | null },
): boolean {
  return canModifySameDayEntry(access, row);
}

const vegDiscountInclude = {
  veg: {
    select: {
      id: true,
      name: true,
      customerId: true,
      customer: { select: { name: true } },
    },
  },
} as const;

function toVegDiscountRow(
  row: {
    id: string;
    date: Date;
    createdAt: Date;
    createdByStaffId: string | null;
    vegId: string;
    status: DiscountStatus;
    amount: { toString(): string };
    remarks: string;
    veg: {
      name: string;
      customerId: string;
      customer: { name: string };
    };
  },
  access: Exclude<Access, { kind: "none" }>,
): VegDiscountRow {
  const canModify = canModifyVegDiscount(access, row);
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    vegId: row.vegId,
    vegName: row.veg.name,
    customerId: row.veg.customerId,
    customerName: row.veg.customer.name,
    status: row.status,
    amount: row.amount.toString(),
    remarks: row.remarks,
    canEdit: canModify,
    canDelete: canModify,
  };
}

function validateVegDiscountInput(input: VegDiscountInput) {
  const vegId = input.vegId.trim();
  if (!vegId) throw new Error("Veg is required");
  const amount = toDecimal(input.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  return {
    date: parseDate(input.date),
    vegId,
    status: parseStatus(String(input.status)),
    amount,
    remarks: input.remarks?.trim() ?? "",
  };
}

async function assertVegExists(vegId: string) {
  const veg = await prisma.veg.findUnique({
    where: { id: vegId },
    select: { id: true },
  });
  if (!veg) throw new Error("Veg not found");
}

function revalidateVegDiscountPaths() {
  revalidatePath("/reports/veg/discount");
  revalidatePath("/reports/veg/ledger");
}

function vegDiscountWhere(options?: {
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}): Prisma.VegDiscountWhereInput {
  const and: Prisma.VegDiscountWhereInput[] = [];
  const date = utcDayRange(options?.dateFrom, options?.dateTo);
  if (date) and.push({ date });
  const party = options?.party?.trim() ?? "";
  if (party) and.push({ vegId: party });
  const flowType = parseVegFlowType(options?.type);
  if (flowType === "received") {
    and.push({ status: DiscountStatus.RECEIVED });
  } else if (flowType === "paid") {
    and.push({ status: DiscountStatus.PAID });
  }
  return and.length ? { AND: and } : {};
}

async function vegDiscountTotals(
  where: Prisma.VegDiscountWhereInput,
  dateFrom?: string,
  dateTo?: string,
): Promise<VegDiscountTotals | null> {
  if (!hasDateFilter(dateFrom, dateTo)) return null;
  const groups = await prisma.vegDiscount.groupBy({
    by: ["status"],
    where,
    _sum: { amount: true },
  });
  const received =
    groups.find((g) => g.status === DiscountStatus.RECEIVED)?._sum.amount ?? 0;
  const paid =
    groups.find((g) => g.status === DiscountStatus.PAID)?._sum.amount ?? 0;
  const receivedDec = toDecimal(received);
  const paidDec = toDecimal(paid);
  return {
    received: receivedDec.toFixed(2),
    paid: paidDec.toFixed(2),
    net: receivedDec.minus(paidDec).toFixed(2),
  };
}

export async function listVegDiscounts(options?: {
  page?: number;
  pageSize?: number;
  all?: boolean;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}): Promise<VegDiscountListResult> {
  const access = await requirePage(VEG_DISCOUNT_PAGE_KEY);
  const where = vegDiscountWhere(options);

  if (options?.all) {
    const [rows, totals] = await Promise.all([
      prisma.vegDiscount.findMany({
        where,
        include: vegDiscountInclude,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      vegDiscountTotals(where, options.dateFrom, options.dateTo),
    ]);
    return {
      rows: rows.map((row) => toVegDiscountRow(row, access)),
      total: rows.length,
      page: 1,
      pageSize: Math.max(1, rows.length),
      totalPages: 1,
      totals,
    };
  }

  const pageSize = Math.max(
    1,
    Math.min(100, options?.pageSize ?? VEG_DISCOUNTS_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));
  const total = await prisma.vegDiscount.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const [rows, totals] = await Promise.all([
    prisma.vegDiscount.findMany({
      where,
      include: vegDiscountInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    vegDiscountTotals(where, options?.dateFrom, options?.dateTo),
  ]);

  return {
    rows: rows.map((row) => toVegDiscountRow(row, access)),
    total,
    page,
    pageSize,
    totalPages,
    totals,
  };
}

export async function createVegDiscount(
  input: VegDiscountInput,
): Promise<VegDiscountRow> {
  const access = await requirePage(VEG_DISCOUNT_PAGE_KEY);
  const data = validateVegDiscountInput(input);
  await assertVegExists(data.vegId);

  const row = await prisma.vegDiscount.create({
    data: {
      date: data.date,
      status: data.status,
      amount: data.amount,
      remarks: data.remarks,
      veg: { connect: { id: data.vegId } },
      ...(access.kind === "staff"
        ? { createdByStaff: { connect: { id: access.id } } }
        : {}),
    },
    include: vegDiscountInclude,
  });

  revalidateVegDiscountPaths();
  return toVegDiscountRow(row, access);
}

export async function updateVegDiscount(
  id: string,
  input: VegDiscountInput,
): Promise<VegDiscountRow> {
  const access = await requirePage(VEG_DISCOUNT_PAGE_KEY);
  const data = validateVegDiscountInput(input);

  const existing = await prisma.vegDiscount.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Veg discount not found");
  if (!canModifyVegDiscount(access, existing)) {
    throw new AccessDeniedError(
      "You can edit only your own veg discount on the same day.",
    );
  }

  await assertVegExists(data.vegId);

  const row = await prisma.vegDiscount.update({
    where: { id },
    data: {
      date: data.date,
      status: data.status,
      amount: data.amount,
      remarks: data.remarks,
      veg: { connect: { id: data.vegId } },
    },
    include: vegDiscountInclude,
  });

  revalidateVegDiscountPaths();
  return toVegDiscountRow(row, access);
}

export async function deleteVegDiscount(id: string) {
  const access = await requirePage(VEG_DISCOUNT_PAGE_KEY);
  const existing = await prisma.vegDiscount.findUnique({
    where: { id },
    select: { id: true, createdAt: true, createdByStaffId: true },
  });
  if (!existing) throw new Error("Veg discount not found");
  if (!canModifyVegDiscount(access, existing)) {
    throw new AccessDeniedError(
      "You can delete only your own veg discount on the same day.",
    );
  }

  await prisma.vegDiscount.delete({ where: { id } });
  revalidateVegDiscountPaths();
}
