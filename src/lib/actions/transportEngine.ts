"use server";

import { DispatchTerms } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import {
  diffInQuantity,
  effectiveReceivingQuantity,
  toDecimal,
} from "@/lib/domain/computations";
import {
  isTransportChecklistComplete,
  nextChecklistCompletedAt,
} from "@/lib/domain/dispatchChecklist";
import { prisma } from "@/lib/prisma";
import { getCurrentAccess, requireSignedIn } from "@/lib/auth/access";
import {
  assertCanEditTransportChecklist,
  canEditTransportChecklist,
} from "@/lib/auth/checklistEditAccess";

export type TransportEngineRow = {
  id: string;
  dispatchNumber: string | null;
  dispatchDate: string;
  saleInvoiceNumber: string | null;
  lorryNumber: string | null;
  loadingWeight: string;
  receivingWeight: string | null;
  diffInWeight: string | null;
  customerName: string | null;
  portName: string | null;
  transporterName: string | null;
  dispatchTerms: DispatchTerms;
  freightPerTon: string | null;
  freightAmount: string | null;
  biltyHardCopy: boolean;
  transportInvoiceNo: string | null;
  invoiceHardCopy: boolean;
  softCopyStatus: boolean;
  transportEntryInTally: boolean;
  canEdit: boolean;
};

export type TransportChecklistInput = {
  biltyHardCopy: boolean;
  transportInvoiceNo: string | null;
  invoiceHardCopy: boolean;
  softCopyStatus: boolean;
  transportEntryInTally: boolean;
};

/** Dispatch-wise rows for the transport checklist / freight report. */
export async function listTransportEngineRows(): Promise<TransportEngineRow[]> {
  const access = await getCurrentAccess();
  if (access.kind === "none") return [];

  const rows = await prisma.dispatch.findMany({
    select: {
      id: true,
      dispatchNumber: true,
      dispatchDate: true,
      createdAt: true,
      createdByStaffId: true,
      saleInvoiceNumber: true,
      lorryNumber: true,
      dispatchedQuantity: true,
      receivingQuantity: true,
      dispatchTerms: true,
      freight: true,
      biltyHardCopy: true,
      transportInvoiceNo: true,
      invoiceHardCopy: true,
      softCopyStatus: true,
      transportEntryInTally: true,
      transportChecklistCompletedAt: true,
      transporter: { select: { name: true } },
      vessel: {
        select: {
          port: { select: { name: true } },
        },
      },
      order: {
        select: {
          customer: { select: { name: true } },
        },
      },
    },
    orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
  });

  return rows.map((row) => {
    const isFor = row.dispatchTerms === DispatchTerms.FOR;
    const freightPerTon = isFor && row.freight != null ? row.freight : null;
    const freightAmount =
      freightPerTon != null
        ? toDecimal(freightPerTon).mul(row.dispatchedQuantity)
        : null;
    const diff = diffInQuantity(row);
    const receivingWeight = effectiveReceivingQuantity(row);

    return {
      id: row.id,
      dispatchNumber: row.dispatchNumber,
      dispatchDate: row.dispatchDate.toISOString().slice(0, 10),
      saleInvoiceNumber: row.saleInvoiceNumber,
      lorryNumber: row.lorryNumber,
      loadingWeight: row.dispatchedQuantity.toString(),
      receivingWeight: receivingWeight?.toString() ?? null,
      diffInWeight: diff?.toString() ?? null,
      customerName: row.order?.customer?.name ?? null,
      portName: row.vessel?.port?.name ?? null,
      transporterName: row.transporter?.name ?? null,
      dispatchTerms: row.dispatchTerms,
      freightPerTon: freightPerTon?.toString() ?? null,
      freightAmount: freightAmount?.toString() ?? null,
      biltyHardCopy: row.biltyHardCopy,
      transportInvoiceNo: row.transportInvoiceNo,
      invoiceHardCopy: row.invoiceHardCopy,
      softCopyStatus: row.softCopyStatus,
      transportEntryInTally: row.transportEntryInTally,
      canEdit: canEditTransportChecklist(access, row),
    };
  });
}

/** Update transport checklist fields on a dispatch. */
export async function updateTransportChecklist(
  dispatchId: string,
  input: TransportChecklistInput,
): Promise<TransportChecklistInput> {
  if (!dispatchId) throw new Error("Dispatch is required");

  const access = await requireSignedIn();
  const existing = await prisma.dispatch.findUnique({
    where: { id: dispatchId },
    select: {
      id: true,
      biltyHardCopy: true,
      transportInvoiceNo: true,
      invoiceHardCopy: true,
      softCopyStatus: true,
      transportEntryInTally: true,
      transportChecklistCompletedAt: true,
    },
  });
  if (!existing) throw new Error("Dispatch not found");
  assertCanEditTransportChecklist(access, existing);

  const transportInvoiceNo =
    input.transportInvoiceNo == null || input.transportInvoiceNo.trim() === ""
      ? null
      : input.transportInvoiceNo.trim().toUpperCase();

  const nextTransportComplete = isTransportChecklistComplete({
    biltyHardCopy: Boolean(input.biltyHardCopy),
    transportInvoiceNo,
    invoiceHardCopy: Boolean(input.invoiceHardCopy),
    transportEntryInTally: Boolean(input.transportEntryInTally),
  });

  const row = await prisma.dispatch.update({
    where: { id: dispatchId },
    data: {
      biltyHardCopy: Boolean(input.biltyHardCopy),
      transportInvoiceNo,
      invoiceHardCopy: Boolean(input.invoiceHardCopy),
      softCopyStatus: Boolean(input.softCopyStatus),
      transportEntryInTally: Boolean(input.transportEntryInTally),
      transportChecklistCompletedAt: nextChecklistCompletedAt(
        isTransportChecklistComplete(existing),
        nextTransportComplete,
        existing.transportChecklistCompletedAt,
      ),
    },
    select: {
      biltyHardCopy: true,
      transportInvoiceNo: true,
      invoiceHardCopy: true,
      softCopyStatus: true,
      transportEntryInTally: true,
    },
  });

  revalidatePath("/reports/transport");
  revalidatePath("/update/transport");
  revalidatePath("/dispatches");
  revalidatePath("/update/purchase");
  revalidatePath("/update/sale");
  revalidatePath("/");

  return {
    biltyHardCopy: row.biltyHardCopy,
    transportInvoiceNo: row.transportInvoiceNo,
    invoiceHardCopy: row.invoiceHardCopy,
    softCopyStatus: row.softCopyStatus,
    transportEntryInTally: row.transportEntryInTally,
  };
}
