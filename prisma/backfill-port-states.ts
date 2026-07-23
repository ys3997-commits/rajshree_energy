import { PrismaClient } from "../src/generated/prisma";
import { capitalizeName } from "../src/lib/domain/format";

const PORT_STATE_BY_NAME: Record<string, string> = {
  haldia: "West Bengal",
  "haldia port": "West Bengal",
  "west bengal": "West Bengal",
  jharkhand: "Jharkhand",
  assam: "Assam",
  odisha: "Odisha",
  vishakapatnam: "Andhra Pradesh",
  visakhapatnam: "Andhra Pradesh",
};

function portStateForName(name: string): string {
  const key = name.trim().toLowerCase();
  if (PORT_STATE_BY_NAME[key]) return PORT_STATE_BY_NAME[key];
  if (key.includes("haldia")) return "West Bengal";
  return capitalizeName(name) ?? name;
}

const prisma = new PrismaClient();

async function main() {
  const ports = await prisma.portOption.findMany();
  let updated = 0;
  for (const port of ports) {
    const nextState = portStateForName(port.name);
    if (port.state !== nextState) {
      await prisma.portOption.update({
        where: { id: port.id },
        data: { state: nextState },
      });
      updated += 1;
      console.log(`${port.name} → ${nextState}`);
    }
  }
  console.log(`Done: updated ${updated} of ${ports.length} ports`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
