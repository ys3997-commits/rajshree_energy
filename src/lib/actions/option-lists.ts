"use server";

import {
  documentGroupsFromEntities,
  isDocumentKind,
  slugFromDocumentName,
  type DocumentEntity,
  type DocumentGroup,
  type DocumentKind,
} from "@/app/(dashboard)/documents/documentEntities";
import { Prisma } from "@/generated/prisma";
import { capitalizeName } from "@/lib/domain/format";
import { INDIAN_STATES_AND_UTS } from "@/lib/domain/indianStates";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const OPTION_PATHS = [
  "/options",
  "/customers",
  "/transporters",
  "/bills",
  "/documents",
] as const;

function revalidateOptionPaths() {
  for (const path of OPTION_PATHS) {
    revalidatePath(path);
  }
}

function trimName(name: string, label: string) {
  const trimmed = capitalizeName(name);
  if (!trimmed) throw new Error(`${label} is required`);
  return trimmed;
}

export async function listSaleExecutiveOptions() {
  return prisma.saleExecutiveOption.findMany({ orderBy: { name: "asc" } });
}

export async function createSaleExecutiveOption(name: string) {
  const row = await prisma.saleExecutiveOption.create({
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function updateSaleExecutiveOption(id: string, name: string) {
  const row = await prisma.saleExecutiveOption.update({
    where: { id },
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function deleteSaleExecutiveOption(id: string) {
  await prisma.saleExecutiveOption.delete({ where: { id } });
  revalidateOptionPaths();
}

function trimState(state: string, label = "State") {
  const trimmed = state.trim();
  if (!trimmed) throw new Error(`${label} is required`);
  if (!INDIAN_STATES_AND_UTS.includes(trimmed as (typeof INDIAN_STATES_AND_UTS)[number])) {
    throw new Error("Select a valid Indian state or union territory");
  }
  return trimmed;
}

export async function listCityOptions() {
  return prisma.cityOption.findMany({ orderBy: { name: "asc" } });
}

export async function createCityOption(name: string, state: string) {
  const row = await prisma.cityOption.create({
    data: {
      name: trimName(name, "Name"),
      state: trimState(state),
    },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function updateCityOption(id: string, name: string, state: string) {
  const row = await prisma.cityOption.update({
    where: { id },
    data: {
      name: trimName(name, "Name"),
      state: trimState(state),
    },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function deleteCityOption(id: string) {
  await prisma.cityOption.delete({ where: { id } });
  revalidateOptionPaths();
}

export async function listStateOptions() {
  return prisma.stateOption.findMany({ orderBy: { name: "asc" } });
}

export async function createStateOption(name: string) {
  const row = await prisma.stateOption.create({
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function updateStateOption(id: string, name: string) {
  const row = await prisma.stateOption.update({
    where: { id },
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function deleteStateOption(id: string) {
  await prisma.stateOption.delete({ where: { id } });
  revalidateOptionPaths();
}

export async function listSectorOptions() {
  return prisma.sectorOption.findMany({ orderBy: { name: "asc" } });
}

export async function createSectorOption(name: string) {
  const row = await prisma.sectorOption.create({
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function updateSectorOption(id: string, name: string) {
  const row = await prisma.sectorOption.update({
    where: { id },
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function deleteSectorOption(id: string) {
  await prisma.sectorOption.delete({ where: { id } });
  revalidateOptionPaths();
}

export async function listDealingCompanyOptions() {
  return prisma.dealingCompanyOption.findMany({ orderBy: { name: "asc" } });
}

export async function createDealingCompanyOption(name: string) {
  const row = await prisma.dealingCompanyOption.create({
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function updateDealingCompanyOption(id: string, name: string) {
  const row = await prisma.dealingCompanyOption.update({
    where: { id },
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function deleteDealingCompanyOption(id: string) {
  await prisma.dealingCompanyOption.delete({ where: { id } });
  revalidateOptionPaths();
}

function asDocumentUniqueError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new Error("A document with this name already exists");
  }
  throw error;
}

function trimDocumentKind(kind: string): DocumentKind {
  if (!isDocumentKind(kind)) {
    throw new Error("Select Company or Individual");
  }
  return kind;
}

async function uniqueDocumentSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await prisma.documentOption.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function listDocumentOptions() {
  return prisma.documentOption.findMany({
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
}

export async function listDocumentGroups(): Promise<DocumentGroup[]> {
  const rows = await listDocumentOptions();
  const entities: DocumentEntity[] = rows.map((row) => ({
    slug: row.slug,
    label: row.name,
    kind: trimDocumentKind(row.kind),
  }));
  return documentGroupsFromEntities(entities);
}

function revalidateDocumentPaths() {
  revalidateOptionPaths();
  revalidatePath("/", "layout");
}

export async function createDocumentOption(name: string, kind: string) {
  const trimmed = trimName(name, "Name");
  const documentKind = trimDocumentKind(kind);
  const slug = await uniqueDocumentSlug(slugFromDocumentName(trimmed));
  try {
    const row = await prisma.documentOption.create({
      data: { name: trimmed, slug, kind: documentKind },
    });
    revalidateDocumentPaths();
    return { id: row.id };
  } catch (error) {
    asDocumentUniqueError(error);
  }
}

export async function updateDocumentOption(
  id: string,
  name: string,
  kind: string,
) {
  const trimmed = trimName(name, "Name");
  const documentKind = trimDocumentKind(kind);
  try {
    const row = await prisma.documentOption.update({
      where: { id },
      data: { name: trimmed, kind: documentKind },
    });
    revalidateDocumentPaths();
    return { id: row.id };
  } catch (error) {
    asDocumentUniqueError(error);
  }
}

export async function deleteDocumentOption(id: string) {
  const used = await prisma.memberDocument.count({ where: { memberId: id } });
  if (used > 0) {
    throw new Error("Cannot delete: this member has uploaded documents");
  }
  await prisma.documentOption.delete({ where: { id } });
  revalidateDocumentPaths();
}

export type DocumentEntryRow = {
  id: string;
  name: string;
  kind: DocumentKind;
};

export async function listDocumentEntries(): Promise<DocumentEntryRow[]> {
  const rows = await prisma.documentEntry.findMany({
    orderBy: [{ name: "asc" }],
  });
  return rows.flatMap((row) =>
    isDocumentKind(row.kind)
      ? [{ id: row.id, name: row.name, kind: row.kind }]
      : [],
  );
}

export async function createDocumentEntry(name: string, kind: string) {
  const trimmed = trimName(name, "Document name");
  const documentKind = trimDocumentKind(kind);
  try {
    const row = await prisma.documentEntry.create({
      data: { name: trimmed, kind: documentKind },
    });
    revalidateDocumentPaths();
    return { id: row.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("This document already exists");
    }
    throw error;
  }
}

export async function updateDocumentEntry(
  id: string,
  name: string,
  kind: string,
) {
  const trimmed = trimName(name, "Document name");
  const documentKind = trimDocumentKind(kind);
  try {
    const row = await prisma.documentEntry.update({
      where: { id },
      data: { name: trimmed, kind: documentKind },
    });
    revalidateDocumentPaths();
    return { id: row.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("This document already exists");
    }
    throw error;
  }
}

export async function deleteDocumentEntry(id: string) {
  const used = await prisma.memberDocument.count({
    where: { documentEntryId: id },
  });
  if (used > 0) {
    throw new Error("Cannot delete: this document has uploads");
  }
  await prisma.documentEntry.delete({ where: { id } });
  revalidateDocumentPaths();
}

function revalidateLeadershipPaths() {
  revalidatePath("/options");
  revalidatePath("/bills");
  revalidatePath("/");
}

export async function listOwnerOptions() {
  return prisma.ownerOption.findMany({ orderBy: { name: "asc" } });
}

export async function createOwnerOption(name: string) {
  const row = await prisma.ownerOption.create({
    data: { name: trimName(name, "Name") },
  });
  revalidateLeadershipPaths();
  return { id: row.id };
}

export async function updateOwnerOption(id: string, name: string) {
  const row = await prisma.ownerOption.update({
    where: { id },
    data: { name: trimName(name, "Name") },
  });
  revalidateLeadershipPaths();
  return { id: row.id };
}

export async function deleteOwnerOption(id: string) {
  await prisma.ownerOption.delete({ where: { id } });
  revalidateLeadershipPaths();
}
