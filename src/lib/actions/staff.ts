"use server";

import { requireOwner } from "@/lib/auth/access";
import { GRANTABLE_PAGES } from "@/lib/auth/pages";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { capitalizeName } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const STAFF_PATHS = ["/options", "/", "/customers", "/orders", "/dispatches"] as const;
const GRANTABLE_KEYS = new Set(GRANTABLE_PAGES.map((page) => page.key));

function revalidateStaffPaths() {
  for (const path of STAFF_PATHS) {
    revalidatePath(path);
  }
}

function publicStaff<T extends { passwordHash?: string | null }>(row: T) {
  const { passwordHash, ...rest } = row;
  return {
    ...rest,
    hasLogin: Boolean(passwordHash),
  };
}

function normalizePageKeys(pageKeys: string[] | undefined): string[] {
  const unique = new Set<string>();
  for (const key of pageKeys ?? []) {
    if (GRANTABLE_KEYS.has(key)) unique.add(key);
  }
  return [...unique];
}

async function assertPasswordAvailable(password: string, exceptStaffId?: string) {
  const others = await prisma.staff.findMany({
    where: {
      passwordHash: { not: null },
      ...(exceptStaffId ? { id: { not: exceptStaffId } } : {}),
    },
    select: { passwordHash: true },
  });
  for (const row of others) {
    if (row.passwordHash && (await verifyPassword(password, row.passwordHash))) {
      throw new Error("That password is already used by another person");
    }
  }
}

export async function listStaff() {
  await requireOwner();
  const rows = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  return rows.map((row) => publicStaff(row));
}

export async function createStaff(input: {
  name: string;
  role?: string | null;
  password?: string | null;
  pageKeys?: string[];
}) {
  await requireOwner();
  const name = capitalizeName(input.name);
  if (!name) throw new Error("Name is required");
  const password = input.password?.trim() || "";
  const pageKeys = normalizePageKeys(input.pageKeys);

  let passwordHash: string | null = null;
  if (password) {
    if (password.length < 6) throw new Error("Password must be at least 6 characters");
    if (pageKeys.length === 0) {
      throw new Error("Select at least one page for login access");
    }
    await assertPasswordAvailable(password);
    passwordHash = await hashPassword(password);
  }

  const row = await prisma.staff.create({
    data: {
      name,
      role: capitalizeName(input.role),
      passwordHash,
      pageKeys: passwordHash ? pageKeys : [],
    },
  });
  revalidateStaffPaths();
  return publicStaff(row);
}

export async function updateStaff(
  id: string,
  input: {
    name: string;
    role?: string | null;
    password?: string | null;
    pageKeys?: string[];
    disableLogin?: boolean;
  },
) {
  await requireOwner();
  const name = capitalizeName(input.name);
  if (!name) throw new Error("Name is required");

  const existing = await prisma.staff.findUnique({ where: { id } });
  if (!existing) throw new Error("Person not found");

  const pageKeys = normalizePageKeys(input.pageKeys);
  let passwordHash = existing.passwordHash;
  let nextPages = existing.pageKeys;

  if (input.disableLogin) {
    passwordHash = null;
    nextPages = [];
  } else {
    const password = input.password?.trim() || "";
    if (password) {
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      await assertPasswordAvailable(password, id);
      passwordHash = await hashPassword(password);
    }
    if (passwordHash) {
      if (pageKeys.length === 0) {
        throw new Error("Select at least one page for login access");
      }
      nextPages = pageKeys;
    } else {
      nextPages = [];
    }
  }

  const row = await prisma.staff.update({
    where: { id },
    data: {
      name,
      role: capitalizeName(input.role),
      passwordHash,
      pageKeys: nextPages,
    },
  });
  revalidateStaffPaths();
  return publicStaff(row);
}

export async function deleteStaff(id: string) {
  await requireOwner();
  await prisma.staff.delete({ where: { id } });
  revalidateStaffPaths();
}
