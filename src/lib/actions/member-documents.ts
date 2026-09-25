"use server";

import { AccessDeniedError, requireOwner, requireSignedIn } from "@/lib/auth/access";
import { canAccessPath, hasDocumentKindAccess } from "@/lib/auth/pages";
import { isDocumentKind } from "@/app/(dashboard)/documents/documentEntities";
import { MAX_MEMBER_DOCUMENT_BYTES, validateBillFile } from "@/lib/domain/bills";
import { parseMemberDocumentExpiry } from "@/lib/domain/documentExpiry";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type MemberDocumentRow = {
  id: string;
  documentEntryId: string;
  documentName: string;
  remarks: string;
  /** YYYY-MM-DD, or null when no expiry was entered. */
  expiryDate: string | null;
  fileName: string;
  fileMime: string;
};

async function requireDocumentMember(kind: string, slug: string) {
  const access = await requireSignedIn();
  if (!canAccessPath(access.pageKeys, `/documents/${kind}/${slug}`)) {
    throw new AccessDeniedError();
  }
}

export async function listMemberDocumentChoices(kind: string) {
  const access = await requireSignedIn();
  if (!hasDocumentKindAccess(access.pageKeys, kind)) {
    throw new AccessDeniedError();
  }
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
  const access = await requireSignedIn();
  const member = await prisma.documentOption.findUnique({
    where: { id: memberId },
    select: { kind: true, slug: true },
  });
  if (!member) return [];
  if (!canAccessPath(access.pageKeys, `/documents/${member.kind}/${member.slug}`)) {
    throw new AccessDeniedError();
  }
  const rows = await prisma.memberDocument.findMany({
    where: { memberId },
    orderBy: { documentEntry: { name: "asc" } },
    select: {
      id: true,
      documentEntryId: true,
      remarks: true,
      expiryDate: true,
      fileName: true,
      fileMime: true,
      documentEntry: { select: { name: true } },
    },
  });
  return rows
    .map((row) => ({
      id: row.id,
      documentEntryId: row.documentEntryId,
      documentName: row.documentEntry.name,
      remarks: row.remarks,
      expiryDate: row.expiryDate,
      fileName: row.fileName,
      fileMime: row.fileMime,
    }))
    .sort((a, b) =>
      a.documentName.localeCompare(b.documentName, "en", { sensitivity: "base" }),
    );
}

export async function createMemberDocument(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  const documentEntryId = String(formData.get("documentEntryId") ?? "");
  const remarks = String(formData.get("remarks") ?? "").trim();
  const expiryDate = parseMemberDocumentExpiry(
    String(formData.get("expiryDate") ?? ""),
  );
  const uploaded = formData.get("file");
  if (!(uploaded instanceof File)) throw new Error("Upload a document");

  const member = await prisma.documentOption.findUnique({
    where: { id: memberId },
  });
  if (!member || !isDocumentKind(member.kind)) {
    throw new Error("Member not found");
  }
  await requireDocumentMember(member.kind, member.slug);
  const entry = await prisma.documentEntry.findUnique({
    where: { id: documentEntryId },
  });
  if (!entry || entry.kind !== member.kind) {
    throw new Error("Select a document for this member");
  }

  const meta = validateBillFile(
    {
      name: uploaded.name,
      type: uploaded.type,
      size: uploaded.size,
    },
    MAX_MEMBER_DOCUMENT_BYTES,
  );

  await prisma.memberDocument.create({
    data: {
      memberId,
      documentEntryId,
      remarks,
      expiryDate,
      fileName: meta.fileName,
      fileMime: meta.mime,
      fileData: Buffer.from(await uploaded.arrayBuffer()),
    },
  });

  revalidatePath(`/documents/${member.kind}/${member.slug}`);
}

export async function updateMemberDocument(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  const documentEntryId = String(formData.get("documentEntryId") ?? "");
  const remarks = String(formData.get("remarks") ?? "").trim();
  const expiryDate = parseMemberDocumentExpiry(
    String(formData.get("expiryDate") ?? ""),
  );
  const uploaded = formData.get("file");

  const existing = await prisma.memberDocument.findUnique({
    where: { id },
    include: { member: true },
  });
  if (!existing || !isDocumentKind(existing.member.kind)) {
    throw new Error("Document not found");
  }
  const entry = await prisma.documentEntry.findUnique({
    where: { id: documentEntryId },
  });
  if (!entry || entry.kind !== existing.member.kind) {
    throw new Error("Select a document for this member");
  }

  const data: {
    documentEntryId: string;
    remarks: string;
    expiryDate: string | null;
    fileName?: string;
    fileMime?: string;
    fileData?: Buffer;
  } = { documentEntryId, remarks, expiryDate };

  if (uploaded instanceof File && uploaded.size > 0) {
    const meta = validateBillFile(
      {
        name: uploaded.name,
        type: uploaded.type,
        size: uploaded.size,
      },
      MAX_MEMBER_DOCUMENT_BYTES,
    );
    data.fileName = meta.fileName;
    data.fileMime = meta.mime;
    data.fileData = Buffer.from(await uploaded.arrayBuffer());
  }

  await prisma.memberDocument.update({ where: { id }, data });
  revalidatePath(`/documents/${existing.member.kind}/${existing.member.slug}`);
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
  const row = await prisma.memberDocument.findUnique({
    where: { id },
    select: {
      fileName: true,
      fileMime: true,
      fileData: true,
      member: { select: { kind: true, slug: true } },
    },
  });
  if (!row) throw new Error("Document not found");
  await requireDocumentMember(row.member.kind, row.member.slug);
  return {
    fileName: row.fileName,
    fileMime: row.fileMime,
    fileData: row.fileData,
  };
}
