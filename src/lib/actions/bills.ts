"use server";

import { BillStatus } from "@/generated/prisma";
import {
  AccessDeniedError,
  requireOwner,
  requireSignedIn,
} from "@/lib/auth/access";
import { toDecimal } from "@/lib/domain/computations";
import {
  billDateRange,
  canApproveBill,
  canRejectBill,
  canUploadBill,
  canViewBill,
  parseBillStatusFilter,
  parseBillTextFilter,
  parseIsoDay,
  validateApproverName,
  validateBillFiles,
  validateOwnerReviewRemark,
  validateAccountVoucherNo,
  validateInvoiceAmount,
  validateInvoiceIssuedBy,
  type BillStatus as BillStatusName,
} from "@/lib/domain/bills";
import {
  approvalYearFromIsoDay,
  nextApprovalNumber,
  parseApprovalNumber,
} from "@/lib/domain/approvalNumbers";
import { capitalizeName } from "@/lib/domain/format";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BILLS_PAGE_SIZE = 20;

const billSelect = {
  id: true,
  approvalNo: true,
  date: true,
  invoiceIssuedBy: true,
  invoiceAmount: true,
  approverName: true,
  remark: true,
  status: true,
  reviewRemark: true,
  accountVoucherNo: true,
  reviewedAt: true,
  staffId: true,
  createdAt: true,
  staff: { select: { id: true, name: true } },
  files: {
    select: { id: true, fileName: true, fileMime: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

export type BillFileRow = {
  id: string;
  fileName: string;
  fileMime: string;
};

export type BillRow = {
  id: string;
  approvalNo: string | null;
  date: string;
  invoiceIssuedBy: string;
  invoiceAmount: string | null;
  approverName: string;
  remark: string;
  files: BillFileRow[];
  status: BillStatusName;
  reviewRemark: string;
  accountVoucherNo: string;
  reviewedAt: string | null;
  staffId: string;
  staffName: string;
};

export type BillSenderOption = {
  id: string;
  name: string;
};

export type BillListResult = {
  rows: BillRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: { all: number; pending: number; approved: number; rejected: number };
  senders: BillSenderOption[];
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
  approvalNo: string | null;
  date: Date;
  invoiceIssuedBy: string;
  invoiceAmount: { toString(): string } | null;
  approverName: string;
  remark: string;
  status: BillStatus;
  reviewRemark: string;
  accountVoucherNo: string;
  reviewedAt: Date | null;
  staffId: string;
  staff: { name: string };
  files: { id: string; fileName: string; fileMime: string }[];
}): BillRow {
  return {
    id: row.id,
    approvalNo: row.approvalNo,
    date: row.date.toISOString().slice(0, 10),
    invoiceIssuedBy: row.invoiceIssuedBy,
    invoiceAmount: row.invoiceAmount?.toString() ?? null,
    approverName: row.approverName,
    remark: row.remark,
    files: row.files.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      fileMime: file.fileMime,
    })),
    status: row.status,
    reviewRemark: row.reviewRemark,
    accountVoucherNo: row.accountVoucherNo,
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

function formFile(formData: FormData): File | null {
  const single = formData.get("file");
  if (single instanceof File && (single.size > 0 || single.name.trim() !== "")) {
    return single;
  }
  return null;
}

type BillTx = Pick<typeof prisma, "bill">;

async function ensureBillApprovalNumbers(): Promise<void> {
  const missing = await prisma.bill.findMany({
    where: { approvalNo: null },
    select: { id: true, date: true, createdAt: true },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });
  if (missing.length === 0) return;

  const existing = await prisma.bill.findMany({
    where: { approvalNo: { not: null } },
    select: { approvalNo: true },
  });
  const byYear = new Map<number, string[]>();
  for (const row of existing) {
    const parsed = parseApprovalNumber(row.approvalNo);
    if (!parsed) continue;
    const list = byYear.get(parsed.year) ?? [];
    list.push(row.approvalNo!);
    byYear.set(parsed.year, list);
  }

  for (const bill of missing) {
    const year = bill.date.getUTCFullYear();
    const numbers = byYear.get(year) ?? [];
    const approvalNo = nextApprovalNumber(numbers, year);
    await prisma.bill.update({
      where: { id: bill.id },
      data: { approvalNo },
    });
    numbers.push(approvalNo);
    byYear.set(year, numbers);
  }
}

async function allocateApprovalNumber(tx: BillTx, year: number): Promise<string> {
  const rows = await tx.bill.findMany({
    where: { approvalNo: { startsWith: `AN ${year}-` } },
    select: { approvalNo: true },
  });
  const approvalNo = nextApprovalNumber(
    rows.map((row) => row.approvalNo),
    year,
  );
  const existing = await tx.bill.findUnique({
    where: { approvalNo },
    select: { id: true },
  });
  if (existing) {
    throw new Error(`Approval number ${approvalNo} is already taken`);
  }
  return approvalNo;
}

/** Suggest the next approval number for the bill date year (AN 2025-0001). */
export async function suggestNextApprovalNumber(dateIso: string): Promise<string> {
  await ensureBillApprovalNumbers();
  const year = approvalYearFromIsoDay(dateIso);
  const rows = await prisma.bill.findMany({
    where: { approvalNo: { startsWith: `AN ${year}-` } },
    select: { approvalNo: true },
  });
  return nextApprovalNumber(
    rows.map((row) => row.approvalNo),
    year,
  );
}

export async function listBills(options?: {
  page?: number;
  status?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  approver?: string | null;
  sentBy?: string | null;
}): Promise<BillListResult> {
  const access = await requireBillsAccess();
  await ensureBillApprovalNumbers();
  const pageSize = BILLS_PAGE_SIZE;
  const requestedPage = Math.max(1, Math.floor(options?.page ?? 1));
  const status = parseBillStatusFilter(options?.status);
  const dateFrom = parseIsoDay(options?.dateFrom);
  const dateTo = parseIsoDay(options?.dateTo);
  const approver = parseBillTextFilter(options?.approver);
  const sentBy =
    access.kind === "owner" ? parseBillTextFilter(options?.sentBy) : null;
  const scope = staffScope(access);
  const extra = {
    ...(approver ? { approverName: approver } : {}),
    ...(sentBy ? { staffId: sentBy } : {}),
    ...billDateRange(dateFrom, dateTo),
  };
  const filterWhere = { ...scope, ...extra };
  const listWhere = { ...filterWhere, ...(status ? { status } : {}) };

  const [all, pending, approved, rejected, total, senders] = await Promise.all([
    prisma.bill.count({ where: filterWhere }),
    prisma.bill.count({ where: { ...filterWhere, status: "PENDING" } }),
    prisma.bill.count({ where: { ...filterWhere, status: "APPROVED" } }),
    prisma.bill.count({ where: { ...filterWhere, status: "REJECTED" } }),
    prisma.bill.count({ where: listWhere }),
    access.kind === "owner"
      ? prisma.staff.findMany({
          where: { bills: { some: {} } },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const rows = await prisma.bill.findMany({
    where: listWhere,
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
    senders,
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
  const invoiceIssuedBy =
    capitalizeName(validateInvoiceIssuedBy(String(formData.get("invoiceIssuedBy") ?? ""))) ??
    "";
  const invoiceAmount = toDecimal(
    validateInvoiceAmount(String(formData.get("invoiceAmount") ?? "")),
  );
  const approverName = validateApproverName(
    String(formData.get("approverName") ?? ""),
  );
  const ownerMatch = await prisma.ownerOption.findFirst({
    where: { name: approverName },
    select: { id: true },
  });
  if (!ownerMatch) {
    throw new Error("Approver name must be an owner from Options");
  }
  const remark = validateOwnerReviewRemark(
    String(formData.get("remark") ?? ""),
    "Doer remark",
  );
  const uploaded = formFile(formData);
  const meta = validateBillFiles(
    uploaded
      ? [{ name: uploaded.name, type: uploaded.type, size: uploaded.size }]
      : [],
  );

  await ensureBillApprovalNumbers();

  const row = await prisma.$transaction(async (tx) => {
    const year = date.getUTCFullYear();
    const approvalNo = await allocateApprovalNumber(tx, year);
    return tx.bill.create({
      data: {
        approvalNo,
        date,
        invoiceIssuedBy,
        invoiceAmount,
        approverName,
        remark,
        staffId: access.id,
        files: {
          create: {
            fileName: meta[0].fileName,
            fileMime: meta[0].mime,
            fileData: Buffer.from(await uploaded!.arrayBuffer()),
            sortOrder: 0,
          },
        },
      },
      select: billSelect,
    });
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
  const reviewRemark = validateOwnerReviewRemark(
    remark,
    status === "APPROVED" ? "Approval remark" : "Rejection remark",
  );

  const existing = await prisma.bill.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error("Bill not found");
  const allowed =
    status === "APPROVED"
      ? canApproveBill(access, existing.status)
      : canRejectBill(access, existing.status);
  if (!allowed) {
    throw new Error("This bill cannot be reviewed in its current state");
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

export async function updateBillAccountVoucherNo(
  id: string,
  accountVoucherNo: string,
): Promise<BillRow> {
  const access = await requireBillsAccess();
  const existing = await prisma.bill.findUnique({
    where: { id },
    select: { staffId: true },
  });
  if (!existing) throw new Error("Bill not found");
  if (!canViewBill(access, existing.staffId)) {
    throw new AccessDeniedError();
  }

  const row = await prisma.bill.update({
    where: { id },
    data: {
      accountVoucherNo: validateAccountVoucherNo(accountVoucherNo),
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
  const row = await prisma.billFile.findUnique({
    where: { id },
    select: {
      fileName: true,
      fileMime: true,
      fileData: true,
      bill: { select: { staffId: true } },
    },
  });
  if (row) {
    if (!canViewBill(access, row.bill.staffId)) {
      throw new AccessDeniedError();
    }
    return {
      fileName: row.fileName,
      fileMime: row.fileMime,
      fileData: row.fileData,
    };
  }

  const bill = await prisma.bill.findUnique({
    where: { id },
    select: {
      staffId: true,
      files: {
        select: { fileName: true, fileMime: true, fileData: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });
  const first = bill?.files[0];
  if (!bill || !first || !canViewBill(access, bill.staffId)) {
    throw new AccessDeniedError();
  }
  return {
    fileName: first.fileName,
    fileMime: first.fileMime,
    fileData: first.fileData,
  };
}
