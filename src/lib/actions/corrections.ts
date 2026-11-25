"use server";

import { CorrectionStatus, Prisma } from "@/generated/prisma";
import {
  AccessDeniedError,
  requireSignedIn,
} from "@/lib/auth/access";
import { hasFullPower } from "@/lib/auth/fullPower";
import { staffHasPageKey } from "@/lib/auth/pages";
import {
  CORRECTION_STATUS_LABEL,
  parseCorrectionStatus,
  validateCorrectionMessage,
  type CorrectionStatus as CorrectionStatusName,
} from "@/lib/domain/corrections";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";
import { capitalizeName, formatDateDdMmYyyy } from "@/lib/domain/format";
import { forgetMemoPrefix } from "@/lib/memoryCache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateCorrections() {
  forgetMemoPrefix("nav:pending-corrections");
  revalidatePath("/corrections");
  revalidatePath("/", "layout");
}

function assertCorrectionsAccess(
  access: Awaited<ReturnType<typeof requireSignedIn>>,
) {
  if (canAccessCorrections(access)) return;
  throw new AccessDeniedError("No access to Correction");
}

export type CorrectionDispatchOption = {
  id: string;
  label: string;
};

function canAccessCorrections(
  access: Awaited<ReturnType<typeof requireSignedIn>>,
): boolean {
  if (hasFullPower(access)) return true;
  if (access.pageKeys === "all") return true;
  return staffHasPageKey(access.pageKeys, "corrections");
}

/** Pending correction count for the nav badge. Returns 0 without access. */
export async function countPendingCorrections(): Promise<number> {
  const access = await requireSignedIn();
  if (!canAccessCorrections(access)) return 0;

  return prisma.dispatchCorrection.count({
    where: { status: CorrectionStatus.PENDING },
  });
}

export type CorrectionRow = {
  id: string;
  dispatchId: string;
  dispatchNumber: string;
  /** Same pattern as the Dispatch no dropdown: `0001 · 24/11/2026`. */
  dispatchLabel: string;
  message: string;
  status: CorrectionStatusName;
  statusLabel: string;
  createdByName: string;
  createdAt: string;
  resolvedAt: string | null;
};

function correctionDispatchLabel(
  dispatchNumber: string | null | undefined,
  dispatchDate: Date,
): string {
  const number = displayDispatchNumber(dispatchNumber);
  const date = formatDateDdMmYyyy(
    new Date(dispatchDate).toISOString().slice(0, 10),
  );
  return `${number} · ${date}`;
}

export async function listCorrectionDispatchOptions(): Promise<
  CorrectionDispatchOption[]
> {
  const access = await requireSignedIn();
  assertCorrectionsAccess(access);

  const rows = await prisma.dispatch.findMany({
    where: { dispatchNumber: { not: null } },
    select: {
      id: true,
      dispatchNumber: true,
      dispatchDate: true,
    },
    orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
    take: 2000,
  });

  return rows
    .filter((row) => row.dispatchNumber)
    .map((row) => ({
      id: row.id,
      label: correctionDispatchLabel(row.dispatchNumber, row.dispatchDate),
    }));
}

function mapCorrectionRow(row: {
  id: string;
  dispatchId: string;
  message: string;
  status: CorrectionStatus;
  createdAt: Date;
  resolvedAt: Date | null;
  dispatch: { dispatchNumber: string | null; dispatchDate: Date };
  createdByStaff: { name: string } | null;
}): CorrectionRow {
  return {
    id: row.id,
    dispatchId: row.dispatchId,
    dispatchNumber: displayDispatchNumber(row.dispatch.dispatchNumber),
    dispatchLabel: correctionDispatchLabel(
      row.dispatch.dispatchNumber,
      row.dispatch.dispatchDate,
    ),
    message: row.message,
    status: row.status,
    statusLabel: CORRECTION_STATUS_LABEL[row.status],
    createdByName: row.createdByStaff?.name?.trim()
      ? (capitalizeName(row.createdByStaff.name) ?? row.createdByStaff.name)
      : "Owner",
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  };
}

export async function listCorrections(filters: {
  status?: string;
} = {}): Promise<CorrectionRow[]> {
  const access = await requireSignedIn();
  assertCorrectionsAccess(access);

  const where: Prisma.DispatchCorrectionWhereInput = {};
  const status = parseCorrectionStatus(filters.status);
  if (status) where.status = status;

  const rows = await prisma.dispatchCorrection.findMany({
    where,
    include: {
      dispatch: { select: { dispatchNumber: true, dispatchDate: true } },
      createdByStaff: { select: { name: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 500,
  });

  return sortCorrectionRows(rows.map(mapCorrectionRow));
}

function sortCorrectionRows(rows: CorrectionRow[]): CorrectionRow[] {
  return [...rows].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "PENDING" ? -1 : 1;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function createCorrection(input: {
  dispatchId: string;
  message: string;
}): Promise<CorrectionRow> {
  const access = await requireSignedIn();
  assertCorrectionsAccess(access);

  const dispatchId = input.dispatchId.trim();
  if (!dispatchId) throw new Error("Select a dispatch number");
  const message = validateCorrectionMessage(input.message);

  const dispatch = await prisma.dispatch.findUnique({
    where: { id: dispatchId },
    select: { id: true, dispatchNumber: true },
  });
  if (!dispatch) throw new Error("Dispatch not found");

  const staffId = access.kind === "staff" ? access.id : null;

  const created = await prisma.dispatchCorrection.create({
    data: {
      dispatchId,
      message,
      status: CorrectionStatus.PENDING,
      createdByStaffId: staffId,
    },
    include: {
      dispatch: { select: { dispatchNumber: true, dispatchDate: true } },
      createdByStaff: { select: { name: true } },
    },
  });

  revalidateCorrections();
  return mapCorrectionRow(created);
}

const correctionInclude = {
  dispatch: { select: { dispatchNumber: true, dispatchDate: true } },
  createdByStaff: { select: { name: true } },
} as const;

export async function updateCorrection(input: {
  id: string;
  dispatchId: string;
  message: string;
}): Promise<CorrectionRow> {
  const access = await requireSignedIn();
  assertCorrectionsAccess(access);

  const id = input.id.trim();
  if (!id) throw new Error("Correction not found");
  const dispatchId = input.dispatchId.trim();
  if (!dispatchId) throw new Error("Select a dispatch number");
  const message = validateCorrectionMessage(input.message);

  const [existing, dispatch] = await Promise.all([
    prisma.dispatchCorrection.findUnique({
      where: { id },
      select: { id: true },
    }),
    prisma.dispatch.findUnique({
      where: { id: dispatchId },
      select: { id: true },
    }),
  ]);
  if (!existing) throw new Error("Correction not found");
  if (!dispatch) throw new Error("Dispatch not found");

  const updated = await prisma.dispatchCorrection.update({
    where: { id },
    data: { dispatchId, message },
    include: correctionInclude,
  });

  revalidateCorrections();
  return mapCorrectionRow(updated);
}

export async function deleteCorrection(input: {
  id: string;
}): Promise<void> {
  const access = await requireSignedIn();
  assertCorrectionsAccess(access);

  const id = input.id.trim();
  if (!id) throw new Error("Correction not found");

  const existing = await prisma.dispatchCorrection.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error("Correction not found");

  await prisma.dispatchCorrection.delete({ where: { id } });
  revalidateCorrections();
}

export async function updateCorrectionStatus(input: {
  id: string;
  status: string;
}): Promise<CorrectionRow> {
  const access = await requireSignedIn();
  assertCorrectionsAccess(access);

  const id = input.id.trim();
  if (!id) throw new Error("Correction not found");
  const status = parseCorrectionStatus(input.status);
  if (!status) throw new Error("Invalid status");

  const existing = await prisma.dispatchCorrection.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error("Correction not found");

  const updated = await prisma.dispatchCorrection.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === CorrectionStatus.DONE ? new Date() : null,
    },
    include: correctionInclude,
  });

  revalidateCorrections();
  return mapCorrectionRow(updated);
}
