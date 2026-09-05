"use server";

import { CoalOrigin, DiscountStatus, type Prisma } from "@/generated/prisma";
import { toDecimal } from "@/lib/domain/computations";
import { hasDateFilter, utcDayRange } from "@/lib/domain/dateRange";
import {
  adjustCustomerDue,
  discountDueDelta,
} from "@/lib/domain/customerDue";
import { parseFundFlowType } from "@/app/(dashboard)/payments/paymentsHref";
import {
  parsePaymentParty,
  tryParsePartyKey,
  type PaymentParty,
} from "@/lib/domain/paymentParty";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requirePage, type Access } from "@/lib/auth/access";

const DISCOUNTS_PAGE_SIZE = 35;

export type DiscountInput = {
  date: string;
  customerId?: string | null;
  transporterId?: string | null;
  status: "RECEIVED" | "PAID" | string;
  amount: string | number;
  coalOrigin: "DOMESTIC" | "IMPORTED" | string;
  remarks: string;
};

export type DiscountRow = {
  id: string;
  date: string;
  customerId: string | null;
  transporterId: string | null;
  customerName: string;
  status: "RECEIVED" | "PAID";
  amount: string;
  coalOrigin: "DOMESTIC" | "IMPORTED" | null;
  remarks: string;
  canEdit: boolean;
  canDelete: boolean;
};

export type DiscountFlowTotals = {
  received: string;
  paid: string;
  net: string;
};

export type DiscountListResult = {
  rows: DiscountRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totals: DiscountFlowTotals | null;
};

function parseStatus(value: string): DiscountStatus {
  if (value === DiscountStatus.RECEIVED || value === DiscountStatus.PAID) {
    return value;
  }
  throw new Error("Select Discount Received or Discount Paid");
}

function parseCoalOrigin(value: string): CoalOrigin {
  if (value === CoalOrigin.DOMESTIC || value === CoalOrigin.IMPORTED) {
    return value;
  }
  throw new Error("Select Domestic coal or Imported coal");
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

const IST_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
});

function dayKeyInIst(value: Date): string {
  return IST_DAY_FORMATTER.format(value);
}

function canStaffModifyEntry(
  access: Extract<Access, { kind: "staff" }>,
  row: { createdAt: Date; createdByStaffId: string | null },
): boolean {
  if (!row.createdByStaffId) return false;
  if (row.createdByStaffId !== access.id) return false;
  return dayKeyInIst(row.createdAt) === dayKeyInIst(new Date());
}

function canModifyEntry(
  access: Exclude<Access, { kind: "none" }>,
  row: { createdAt: Date; createdByStaffId: string | null },
): boolean {
  if (access.kind === "owner") return true;
  return canStaffModifyEntry(access, row);
}

function toDiscountRow(
  row: {
    id: string;
    date: Date;
    createdAt: Date;
    createdByStaffId: string | null;
    customerId: string | null;
    transporterId: string | null;
    status: DiscountStatus;
    amount: { toString(): string };
    coalOrigin: CoalOrigin | null;
    remarks: string;
    customer: { name: string } | null;
    transporter: { name: string } | null;
  },
  access: Exclude<Access, { kind: "none" }>,
): DiscountRow {
  const canModify = canModifyEntry(access, row);
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    customerId: row.customerId,
    transporterId: row.transporterId,
    customerName: row.customer?.name ?? row.transporter?.name ?? "—",
    status: row.status,
    amount: row.amount.toString(),
    coalOrigin: row.coalOrigin,
    remarks: row.remarks,
    canEdit: canModify,
    canDelete: canModify,
  };
}

function validateDiscountInput(input: DiscountInput) {
  const party = parsePaymentParty(input);
  const remarks = String(input.remarks ?? "").trim();
  if (!remarks) throw new Error("Remarks are required");
  const amount = toDecimal(input.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Amount must be greater than zero");
  }
  return {
    date: parseDate(input.date),
    party,
    status: parseStatus(String(input.status)),
    amount,
    coalOrigin: parseCoalOrigin(String(input.coalOrigin ?? "")),
    remarks,
  };
}

const discountInclude = {
  customer: { select: { id: true, name: true } },
  transporter: { select: { id: true, name: true } },
} as const;

const discountOrderBy = [
  { date: "desc" as const },
  { createdAt: "desc" as const },
];

function partyCreateData(party: PaymentParty) {
  return party.kind === "customer"
    ? { customer: { connect: { id: party.id } } }
    : { transporter: { connect: { id: party.id } } };
}

function partyUpdateData(party: PaymentParty) {
  return {
    customer:
      party.kind === "customer"
        ? { connect: { id: party.id } }
        : { disconnect: true },
    transporter:
      party.kind === "transporter"
        ? { connect: { id: party.id } }
        : { disconnect: true },
  };
}

async function assertPartyExists(party: PaymentParty) {
  if (party.kind === "customer") {
    const customer = await prisma.customer.findUnique({
      where: { id: party.id },
      select: { id: true },
    });
    if (!customer) throw new Error("Customer not found");
    return;
  }
  const transporter = await prisma.transporter.findUnique({
    where: { id: party.id },
    select: { id: true },
  });
  if (!transporter) throw new Error("Transporter not found");
}

function revalidateDiscountPaths(party?: PaymentParty) {
  revalidatePath("/");
  revalidatePath("/payments");
  revalidatePath("/customers");
  revalidatePath("/reports/collection");
  revalidatePath("/reports/collection/vendor");
  revalidatePath("/reports/profit-analysis");
  revalidatePath("/reports/profit-analysis/daily");
  revalidatePath("/reports/profit-analysis/month-wise");
  if (!party || party.kind === "transporter") {
    revalidatePath("/transporters");
    revalidatePath("/reports/transport/due");
    revalidatePath("/reports/transport/ledger");
  }
}

function discountWhere(options?: {
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}): Prisma.DiscountWhereInput {
  const and: Prisma.DiscountWhereInput[] = [];
  const date = utcDayRange(options?.dateFrom, options?.dateTo);
  if (date) and.push({ date });

  const parsedParty = tryParsePartyKey(options?.party);
  if (parsedParty?.kind === "customer") {
    and.push({ customerId: parsedParty.id });
  } else if (parsedParty?.kind === "transporter") {
    and.push({ transporterId: parsedParty.id });
  }

  const flowType = parseFundFlowType(options?.type);
  if (flowType === "received") {
    and.push({ status: DiscountStatus.RECEIVED });
  } else if (flowType === "paid") {
    and.push({ status: DiscountStatus.PAID });
  }

  return and.length ? { AND: and } : {};
}

async function discountTotals(
  where: Prisma.DiscountWhereInput,
  dateFrom?: string,
  dateTo?: string,
): Promise<DiscountFlowTotals | null> {
  if (!hasDateFilter(dateFrom, dateTo)) return null;

  const groups = await prisma.discount.groupBy({
    by: ["status"],
    where,
    _sum: { amount: true },
  });
  const received =
    groups.find((g) => g.status === DiscountStatus.RECEIVED)?._sum.amount ??
    0;
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

export async function listDiscounts(options?: {
  page?: number;
  pageSize?: number;
  all?: boolean;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}): Promise<DiscountListResult> {
  const access = await requirePage("payments-discount");
  const where = discountWhere(options);

  if (options?.all) {
    const [rows, totals] = await Promise.all([
      prisma.discount.findMany({
        where,
        include: discountInclude,
        orderBy: discountOrderBy,
      }),
      discountTotals(where, options.dateFrom, options.dateTo),
    ]);
    return {
      rows: rows.map((row) => toDiscountRow(row, access)),
      total: rows.length,
      page: 1,
      pageSize: Math.max(1, rows.length),
      totalPages: 1,
      totals,
    };
  }

  const pageSize = Math.max(
    1,
    Math.min(100, options?.pageSize ?? DISCOUNTS_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));

  const total = await prisma.discount.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const [rows, totals] = await Promise.all([
    prisma.discount.findMany({
      where,
      include: discountInclude,
      orderBy: discountOrderBy,
      skip,
      take: pageSize,
    }),
    discountTotals(where, options?.dateFrom, options?.dateTo),
  ]);

  return {
    rows: rows.map((row) => toDiscountRow(row, access)),
    total,
    page,
    pageSize,
    totalPages,
    totals,
  };
}

export async function createDiscount(
  input: DiscountInput,
): Promise<DiscountRow> {
  const access = await requirePage("payments-discount");
  const data = validateDiscountInput(input);
  await assertPartyExists(data.party);

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.discount.create({
      data: {
        date: data.date,
        status: data.status,
        amount: data.amount,
        coalOrigin: data.coalOrigin,
        remarks: data.remarks,
        ...(access.kind === "staff"
          ? { createdByStaff: { connect: { id: access.id } } }
          : {}),
        ...partyCreateData(data.party),
      },
      include: discountInclude,
    });

    if (data.party.kind === "customer") {
      await adjustCustomerDue(
        tx,
        data.party.id,
        discountDueDelta(data.status, data.amount),
      );
    }

    return created;
  });

  revalidateDiscountPaths(data.party);
  return toDiscountRow(row, access);
}

export async function updateDiscount(
  id: string,
  input: DiscountInput,
): Promise<DiscountRow> {
  const access = await requirePage("payments-discount");
  const data = validateDiscountInput(input);

  const existing = await prisma.discount.findUnique({
    where: { id },
    select: {
      id: true,
      customerId: true,
      transporterId: true,
      status: true,
      amount: true,
      createdAt: true,
      createdByStaffId: true,
    },
  });
  if (!existing) throw new Error("Discount not found");
  if (!canModifyEntry(access, existing)) {
    throw new AccessDeniedError(
      "You can edit only your own discount entry on the same day.",
    );
  }

  await assertPartyExists(data.party);

  const row = await prisma.$transaction(async (tx) => {
    if (existing.customerId) {
      await adjustCustomerDue(
        tx,
        existing.customerId,
        discountDueDelta(existing.status, existing.amount).neg(),
      );
    }

    const updated = await tx.discount.update({
      where: { id },
      data: {
        date: data.date,
        status: data.status,
        amount: data.amount,
        coalOrigin: data.coalOrigin,
        remarks: data.remarks,
        ...partyUpdateData(data.party),
      },
      include: discountInclude,
    });

    if (data.party.kind === "customer") {
      await adjustCustomerDue(
        tx,
        data.party.id,
        discountDueDelta(data.status, data.amount),
      );
    }

    return updated;
  });

  revalidateDiscountPaths(data.party);
  return toDiscountRow(row, access);
}

export async function deleteDiscount(id: string) {
  const access = await requirePage("payments-discount");
  const existing = await prisma.discount.findUnique({
    where: { id },
    select: {
      id: true,
      customerId: true,
      transporterId: true,
      status: true,
      amount: true,
      createdAt: true,
      createdByStaffId: true,
    },
  });
  if (!existing) throw new Error("Discount not found");
  if (!canModifyEntry(access, existing)) {
    throw new AccessDeniedError(
      "You can delete only your own discount entry on the same day.",
    );
  }

  await prisma.$transaction(async (tx) => {
    if (existing.customerId) {
      await adjustCustomerDue(
        tx,
        existing.customerId,
        discountDueDelta(existing.status, existing.amount).neg(),
      );
    }
    await tx.discount.delete({ where: { id } });
  });

  revalidateDiscountPaths(
    existing.transporterId
      ? { kind: "transporter", id: existing.transporterId }
      : undefined,
  );
}
