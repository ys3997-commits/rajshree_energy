import { prisma } from "../src/lib/prisma";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { usernameFromName } from "../src/lib/auth/username";
import { GRANTABLE_PAGES } from "../src/lib/auth/pages";

const targets = [
  { username: "prakash.surana", password: process.env.PW_PRAKASH ?? "" },
  { username: "praveen.surana", password: process.env.PW_PRAVEEN ?? "" },
];

async function main() {
  if (targets.some((target) => target.password.length < 6)) {
    throw new Error("Set PW_PRAKASH and PW_PRAVEEN before running this script");
  }

  const staff = await prisma.staff.findMany({
    select: { id: true, name: true },
  });
  const pageKeys = GRANTABLE_PAGES.map((page) => page.key);
  const every = ["*"];

  for (const target of targets) {
    const row = staff.find(
      (item) => usernameFromName(item.name) === target.username,
    );
    if (!row) throw new Error(`No staff login named ${target.username}`);

    const passwordHash = await hashPassword(target.password);
    await prisma.staff.update({
      where: { id: row.id },
      data: {
        role: "Admin",
        passwordHash,
        pageKeys,
        collectionSalesExecs: every,
        salesEngineSalesExecs: every,
        saleOrderSalesExecs: every,
        purchaseOrderSalesExecs: every,
        ageingReportSalesExecs: every,
        customerLedgerSalesExecs: every,
      },
    });

    const saved = await prisma.staff.findUnique({
      where: { id: row.id },
      select: { role: true, passwordHash: true },
    });
    const passwordOk = saved?.passwordHash
      ? await verifyPassword(target.password, saved.passwordHash)
      : false;
    console.log(`${target.username} role=${saved?.role} passwordOk=${passwordOk}`);
  }

  const team = await prisma.staff.updateMany({
    where: { role: null },
    data: { role: "Team" },
  });
  const listed = await prisma.staff.findMany({
    select: { name: true, role: true },
    orderBy: { name: "asc" },
  });
  for (const row of listed) {
    console.log(`${row.name} role=${row.role ?? "null"}`);
  }
  console.log(`nullRolesSet=${team.count}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Update failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
