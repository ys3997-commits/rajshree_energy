"use server";

import { BillStatus } from "@/generated/prisma";
import {
  AccessDeniedError,
  requireOwner,
  requireSignedIn,
} from "@/lib/auth/access";
import {
  canReviewBill,
  canUploadBill,
  canViewBill,
  parseBillStatusFilter,
  validateBillFile,
  validateBillRemark,
  type BillStatus as BillStatusName,
} from "@/lib/domain/bills";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BILLS_PAGE_SIZE = 20;

const billSelect = {
  id: true,
  date: true,
  remark: true,
  fileName: true,
  fileMime: true,
  status: true,
  reviewRemark: true,
  reviewedAt: true,
  staffId: true,
  createdAt: true,
  staff: { select: { id: true, name: true } },
} as const;

export type BillRow = {
  id: string;
  date: string;
  remark: string;
  fileName: string;
  fileMime: string;
  status: BillStatusName;
  reviewRemark: string;
  reviewedAt: string | null;
  staffId: string;
  staffName: string;
};

export type BillListResult = {
  rows: BillRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: { all: number; pending: number; approved: number; rejected: number };
  canUpload: boolean;
  isOwner: boolean;
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

function toBillRow(row: {
  id: string;
  date: Date;
  remark: string;
  fileName: string;
  fileMime: string;
  status: BillStatus;
  reviewRemark: string;
  reviewedAt: Date | null;
  staffId: string;
  staff: { name: string };
}): BillRow {
  return {
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    remark: row.remark,
    fileName: row.fileName,
    fileMime: row.fileMime,
    status: row.status,
    reviewRemark: row.reviewRemark,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    staffId: row.staffId,
    staffName: row.staff.name,
  };
}

async function requireBillsAccess() {
  const access = await requireSignedIn();
  if (access.kind === "owner") return access;
  if (!access.pageKeys.includes("bills")) {
    throw new AccessDeniedError();
  }
  return access;
}

function staffScope(access: Awaited<ReturnType<typeof requireBillsAccess>>) {
  return access.kind === "staff" ? { staffId: access.id } : {};
}

export async function listBills(options?: {
  page?: number;
  status?: string | null;
}): Promise<BillListResult> {
  const access = await requireBillsAccess();
  const pageSize = BILLS_PAGE_SIZE;
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));
  const status = parseBillStatusFilter(options?.status);
  const scope = staffScope(access);

  const [all, pending, approved, rejected, total] = await Promise.all([
    prisma.bill.count({ where: scope }),
    prisma.bill.count({ where: { ...scope, status: "PENDING" } }),
    prisma.bill.count({ where: { ...scope, status: "APPROVED" } }),
    prisma.bill.count({ where: { ...scope, status: "REJECTED" } }),
    prisma.bill.count({
      where: { ...scope, ...(status ? { status } : {}) },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const rows = await prisma.bill.findMany({
    where: { ...scope, ...(status ? { status } : {}) },
    select: billSelect,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    skip,
    take: pageSize,
  });

  return {
    rows: rows.map(toBillRow),
    total,
    page,
    pageSize,
    totalPages,
    counts: { all, pending, approved, rejected },
    canUpload: canUploadBill(access),
    isOwner: access.kind === "owner",
  };
}

export async function createBill(formData: FormData): Promise<BillRow> {
  const access = await requireBillsAccess();
  if (!canUploadBill(access) || access.kind !== "staff") {
    throw new AccessDeniedError("Only staff can upload bills");
  }

  const date = parseDate(String(formData.get("date") ?? ""));
  const remark = validateBillRemark(String(formData.get("remark") ?? ""), "Remark");
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("File is required");

  const meta = validateBillFile({
    name: file.name,
    type: file.type,
    size: file.size,
  });
  const fileData = Buffer.from(await file.arrayBuffer());

  const row = await prisma.bill.create({
    data: {
      date,
      remark,
      fileName: meta.fileName,
      fileMime: meta.mime,
      fileData,
      staffId: access.id,
    },
    select: billSelect,
  });

  revalidatePath("/bills");
  return toBillRow(row);
}

export async function reviewBill(
  id: string,
  status: "APPROVED" | "REJECTED",
  remark: string,
): Promise<BillRow> {
  const access = await requireOwner();
  const reviewRemark = validateBillRemark(
    remark,
    status === "APPROVED" ? "Approval remark" : "Rejection remark",
  );

  const existing = await prisma.bill.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error("Bill not found");
  if (!canReviewBill(access, existing.status)) {
    throw new Error("This bill has already been reviewed");
  }

  const row = await prisma.bill.update({
    where: { id },
    data: {
      status,
      reviewRemark,
      reviewedAt: new Date(),
    },
    select: billSelect,
  });

  revalidatePath("/bills");
  return toBillRow(row);
}

export async function getBillFile(id: string): Promise<{
  fileName: string;
  fileMime: string;
  fileData: Uint8Array;
}> {
  const access = await requireBillsAccess();
  const row = await prisma.bill.findUnique({
    where: { id },
    select: {
      staffId: true,
      fileName: true,
      fileMime: true,
      fileData: true,
    },
  });
  if (!row || !canViewBill(access, row.staffId)) {
    throw new AccessDeniedError();
  }
  return {
    fileName: row.fileName,
    fileMime: row.fileMime,
    fileData: row.fileData,
  };
}
