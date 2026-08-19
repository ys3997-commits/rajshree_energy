"use server";

import { clearStaffSession, writeStaffSession } from "@/lib/auth/access";
import { firstAllowedPath } from "@/lib/auth/pages";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function signInWithStaffPassword(password: string) {
  const secret = password.trim();
  if (!secret) return { ok: false as const };

  const staff = await prisma.staff.findMany({
    where: { passwordHash: { not: null } },
    select: { id: true, name: true, passwordHash: true, pageKeys: true },
  });

  for (const row of staff) {
    if (!row.passwordHash) continue;
    if (!(await verifyPassword(secret, row.passwordHash))) continue;
    if (row.pageKeys.length === 0) {
      return { ok: false as const, reason: "no-pages" as const };
    }
    await writeStaffSession(row.id);
    return {
      ok: true as const,
      name: row.name,
      href: firstAllowedPath(row.pageKeys),
    };
  }

  return { ok: false as const };
}

export async function signOutStaff() {
  await clearStaffSession();
}
