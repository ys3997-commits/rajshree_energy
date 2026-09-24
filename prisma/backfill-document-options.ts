import { PrismaClient } from "../src/generated/prisma";
import { DEFAULT_DOCUMENT_ENTITIES } from "../src/app/(dashboard)/documents/documentEntities";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.documentOption.createMany({
    data: DEFAULT_DOCUMENT_ENTITIES.map((item) => ({
      name: item.label,
      slug: item.slug,
      kind: item.kind,
    })),
    skipDuplicates: true,
  });
  const count = await prisma.documentOption.count();
  console.log(`Inserted ${result.count} document folders; ${count} total`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
