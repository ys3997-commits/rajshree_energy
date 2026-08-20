"use server";

import { capitalizeName } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const OPTION_PATHS = [
  "/options",
  "/customers",
  "/transporters",
  "/bills",
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

export async function listCityOptions() {
  return prisma.cityOption.findMany({ orderBy: { name: "asc" } });
}

export async function createCityOption(name: string) {
  const row = await prisma.cityOption.create({
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function updateCityOption(id: string, name: string) {
  const row = await prisma.cityOption.update({
    where: { id },
    data: { name: trimName(name, "Name") },
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

export async function listOwnerOptions() {
  return prisma.ownerOption.findMany({ orderBy: { name: "asc" } });
}

export async function createOwnerOption(name: string) {
  const row = await prisma.ownerOption.create({
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function updateOwnerOption(id: string, name: string) {
  const row = await prisma.ownerOption.update({
    where: { id },
    data: { name: trimName(name, "Name") },
  });
  revalidateOptionPaths();
  return { id: row.id };
}

export async function deleteOwnerOption(id: string) {
  await prisma.ownerOption.delete({ where: { id } });
  revalidateOptionPaths();
}
