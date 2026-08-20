import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const bills = await prisma.bill.findMany({
    select: {
      id: true,
      fileName: true,
      fileMime: true,
      fileData: true,
      _count: { select: { files: true } },
    },
  });

  let copied = 0;
  for (const bill of bills) {
    if (bill._count.files > 0) continue;
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
