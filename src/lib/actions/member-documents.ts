"use server";

import { requireOwner, requirePage } from "@/lib/auth/access";
import { isDocumentKind } from "@/app/(dashboard)/documents/documentEntities";
import { validateBillFile } from "@/lib/domain/bills";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type MemberDocumentRow = {
  id: string;
  documentName: string;
  remarks: string;
  fileName: string;
  fileMime: string;
};

export async function listMemberDocumentChoices(kind: string) {
  await requirePage("documents");
  if (!isDocumentKind(kind)) return [];
  return prisma.documentEntry.findMany({
    where: { kind },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function listMemberDocuments(
  memberId: string,
): Promise<MemberDocumentRow[]> {
  await requirePage("documents");
  const rows = await prisma.memberDocument.findMany({
    where: { memberId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      remarks: true,
      fileName: true,
      fileMime: true,
      documentEntry: { select: { name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    documentName: row.documentEntry.name,
    remarks: row.remarks,
    fileName: row.fileName,
    fileMime: row.fileMime,
  }));
}

export async function createMemberDocument(formData: FormData) {
  await requirePage("documents");
  const memberId = String(formData.get("memberId") ?? "");
  const documentEntryId = String(formData.get("documentEntryId") ?? "");
  const remarks = String(formData.get("remarks") ?? "").trim();
  const uploaded = formData.get("file");
  if (!(uploaded instanceof File)) throw new Error("Upload a document");

  const member = await prisma.documentOption.findUnique({
    where: { id: memberId },
  });
  if (!member || !isDocumentKind(member.kind)) {
    throw new Error("Member not found");
  }
  const entry = await prisma.documentEntry.findUnique({
    where: { id: documentEntryId },
  });
  if (!entry || entry.kind !== member.kind) {
    throw new Error("Select a document for this member");
  }

  const meta = validateBillFile({
    name: uploaded.name,
    type: uploaded.type,
    size: uploaded.size,
  });

  await prisma.memberDocument.create({
    data: {
      memberId,
      documentEntryId,
      remarks,
      fileName: meta.fileName,
      fileMime: meta.mime,
      fileData: Buffer.from(await uploaded.arrayBuffer()),
    },
  });

  revalidatePath(`/documents/${member.kind}/${member.slug}`);
}

export async function deleteMemberDocument(id: string) {
  await requireOwner();
  const row = await prisma.memberDocument.findUnique({
    where: { id },
    select: { member: { select: { kind: true, slug: true } } },
  });
  if (!row) throw new Error("Document not found");
  await prisma.memberDocument.delete({ where: { id } });
  revalidatePath(`/documents/${row.member.kind}/${row.member.slug}`);
}

export async function getMemberDocumentFile(id: string) {
  await requirePage("documents");
  const row = await prisma.memberDocument.findUnique({
    where: { id },
    select: { fileName: true, fileMime: true, fileData: true },
  });
  if (!row) throw new Error("Document not found");
  return row;
}
