import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

type LegacyBillRow = {
  id: string;
  fileName: string | null;
  fileMime: string | null;
  fileData: Buffer | null;
};

async function legacyBillFileColumnsExist(): Promise<boolean> {
  const cols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Bill'
      AND column_name IN ('fileName', 'fileMime', 'fileData')
  `;
  return cols.length === 3;
}

async function main() {
  if (!(await legacyBillFileColumnsExist())) {
    console.log("Legacy Bill file columns not found; nothing to backfill.");
    return;
  }

  const bills = await prisma.$queryRaw<LegacyBillRow[]>`
    SELECT b.id, b."fileName", b."fileMime", b."fileData"
    FROM "Bill" b
    WHERE b."fileData" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "BillFile" f WHERE f."billId" = b.id
      )
  `;

  let copied = 0;
  for (const bill of bills) {
    if (!bill.fileData || !bill.fileName || !bill.fileMime) continue;
    await prisma.billFile.create({
      data: {
        billId: bill.id,
        fileName: bill.fileName,
        fileMime: bill.fileMime,
        fileData: bill.fileData,
        sortOrder: 0,
      },
    });
    copied += 1;
  }

  console.log(`Copied ${copied} of ${bills.length} bills into BillFile`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
