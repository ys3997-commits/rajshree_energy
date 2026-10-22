"use server";

import { Prisma } from "@/generated/prisma";
import { capitalizeName } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type BankAccountTypeRow = {
  id: string;
  name: string;
};

function trimName(name: string) {
  const trimmed = capitalizeName(name);
  if (!trimmed) throw new Error("Type of account is required");
  return trimmed;
}

function asUniqueTypeError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new Error("This type of bank account already exists");
  }
  throw error;
}

function revalidateBankTypePaths() {
  revalidatePath("/bank-accounts");
  revalidatePath("/bank-accounts/types");
}

export async function listBankAccountTypes(): Promise<BankAccountTypeRow[]> {
  return prisma.bankAccountTypeOption.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createBankAccountType(name: string) {
  try {
    const row = await prisma.bankAccountTypeOption.create({
      data: { name: trimName(name) },
      select: { id: true },
    });
    revalidateBankTypePaths();
    return row;
  } catch (error) {
    asUniqueTypeError(error);
  }
}

export async function updateBankAccountType(id: string, name: string) {
  try {
    const row = await prisma.bankAccountTypeOption.update({
      where: { id },
      data: { name: trimName(name) },
      select: { id: true },
    });
    revalidateBankTypePaths();
    return row;
  } catch (error) {
    asUniqueTypeError(error);
  }
}

export async function deleteBankAccountType(id: string) {
  try {
    await prisma.bankAccountTypeOption.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new Error(
        "This type is used by a bank account and cannot be deleted",
      );
    }
    throw error;
  }
  revalidateBankTypePaths();
}
