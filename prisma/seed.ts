import { CustomerCategory, OrderType, PrismaClient } from "../src/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  await prisma.dispatch.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.vessel.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.transporter.deleteMany();
  await prisma.staff.deleteMany();

  const amit = await prisma.staff.create({
    data: { name: "Amit Sharma", role: "Trader" },
  });
  const priya = await prisma.staff.create({
    data: { name: "Priya Patel", role: "Operations" },
  });
  const rahul = await prisma.staff.create({
    data: { name: "Rahul Mehta", role: "Finance" },
  });

  await prisma.transporter.createMany({
    data: [
      {
        name: "Singh Logistics",
        area: "Nagpur",
        contactPersonName: "Gurpreet Singh",
        contactNumber: "9876500001",
      },
      {
        name: "Deccan Transport",
        area: "Raipur",
        contactPersonName: "Suresh Rao",
        contactNumber: "9876500002",
      },
    ],
  });

  const eastern = await prisma.customer.create({
    data: {
      name: "Eastern Coal Suppliers",
      category: CustomerCategory.SUPPLIER,
      contactNumber: "9811100001",
      pocName: "Vikram Das",
      area: "Kolkata",
      dealById: amit.id,
      approachForFundsId: rahul.id,
    },
  });

  const bharat = await prisma.customer.create({
    data: {
      name: "Bharat Steel Works",
      category: CustomerCategory.INDUSTRY,
      contactNumber: "9811100002",
      pocName: "Anil Kumar",
      area: "Jamshedpur",
      industrySector: "Steel",
      dealById: amit.id,
    },
  });

  await prisma.customer.create({
    data: {
      name: "PowerGrid Cement",
      category: CustomerCategory.INDUSTRY,
      contactNumber: "9811100003",
      pocName: "Meera Joshi",
      area: "Raipur",
      industrySector: "Cement",
      dealById: priya.id,
      approachForFundsId: rahul.id,
    },
  });

  const vessel = await prisma.vessel.create({
    data: {
      vesselName: "MV Black Diamond",
      importerId: eastern.id,
      quality: "4800 GAR",
      quantity: new Decimal(10000),
    },
  });

  await prisma.order.create({
    data: {
      poNumber: "PO-2026-0001",
      orderType: OrderType.REGULAR,
      customerId: bharat.id,
      orderDate: new Date(),
      area: "Jamshedpur",
      creditDays: 30,
      quality: "4800 GAR",
      rate: new Decimal(8500),
      quantity: new Decimal(2000),
      orderById: amit.id,
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      poNumber: "PU-1",
      orderType: OrderType.REGULAR,
      importerId: eastern.id,
      vesselId: vessel.id,
      orderDate: new Date(),
      quality: "4800 GAR",
      rate: new Decimal(7200),
      quantity: new Decimal(5000),
      orderById: amit.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
