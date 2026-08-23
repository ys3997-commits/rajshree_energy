"use server";

import { DispatchTerms } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import {
  diffInQuantity,
  effectiveReceivingQuantity,
  toDecimal,
} from "@/lib/domain/computations";
import { prisma } from "@/lib/prisma";

export type TransportEngineRow = {
  id: string;
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
  entryInTally: boolean;
};

export type TransportChecklistInput = {
  biltyHardCopy: boolean;
  transportInvoiceNo: string | null;
  invoiceHardCopy: boolean;
  softCopyStatus: boolean;
  entryInTally: boolean;
};

/** Dispatch-wise rows for the transport checklist / freight report. */
export async function listTransportEngineRows(): Promise<TransportEngineRow[]> {
  const rows = await prisma.dispatch.findMany({
    select: {
      id: true,
      dispatchDate: true,
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
      entryInTally: true,
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
      entryInTally: row.entryInTally,
    };
  });
}

/** Update transport checklist fields on a dispatch. */
export async function updateTransportChecklist(
  dispatchId: string,
  input: TransportChecklistInput,
): Promise<TransportChecklistInput> {
  if (!dispatchId) throw new Error("Dispatch is required");

  const existing = await prisma.dispatch.findUnique({
    where: { id: dispatchId },
    select: { id: true },
  });
  if (!existing) throw new Error("Dispatch not found");

  const transportInvoiceNo =
    input.transportInvoiceNo == null || input.transportInvoiceNo.trim() === ""
      ? null
      : input.transportInvoiceNo.trim();

  const row = await prisma.dispatch.update({
    where: { id: dispatchId },
    data: {
      biltyHardCopy: Boolean(input.biltyHardCopy),
      transportInvoiceNo,
      invoiceHardCopy: Boolean(input.invoiceHardCopy),
      softCopyStatus: Boolean(input.softCopyStatus),
      entryInTally: Boolean(input.entryInTally),
    },
    select: {
      biltyHardCopy: true,
      transportInvoiceNo: true,
      invoiceHardCopy: true,
      softCopyStatus: true,
      entryInTally: true,
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
    entryInTally: row.entryInTally,
  };
}
