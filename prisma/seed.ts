import { CustomerCategory, OrderType, PrismaClient } from "../src/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  await prisma.dispatch.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.vessel.deleteMany();
  await prisma.portOption.deleteMany();
  await prisma.qualityClass.deleteMany();
  await prisma.qualityOption.deleteMany();
  await prisma.originOption.deleteMany();
  await prisma.saleExecutiveOption.deleteMany();
  await prisma.cityOption.deleteMany();
  await prisma.stateOption.deleteMany();
  await prisma.sectorOption.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.transporter.deleteMany();
  await prisma.staff.deleteMany();

  const ports = await Promise.all(
    [
      "Haldia Port",
      "Jharkhand",
      "West Bengal",
      "Assam",
      "Odisha",
      "Vishakapatnam",
    ].map((name) => prisma.portOption.create({ data: { name } })),
  );

  const origins = await Promise.all(
    ["Indonesia", "USA", "South Africa", "Coal India", "Open Market"].map(
      (name) => prisma.originOption.create({ data: { name } }),
    ),
  );

  const qualities = await Promise.all(
    ["6000 GCV", "Coal Fines", "Domestic ROM", "USA Coal"].map((name) =>
      prisma.qualityOption.create({ data: { name } }),
    ),
  );

  await Promise.all(
    ["Amit Sharma", "Priya Patel"].map((name) =>
      prisma.saleExecutiveOption.create({ data: { name } }),
    ),
  );

  await Promise.all(
    ["Kolkata", "Jamshedpur", "Raipur", "Paradip", "Nagpur"].map((name) =>
      prisma.cityOption.create({ data: { name } }),
    ),
  );

  await Promise.all(
    [
      "West Bengal",
      "Jharkhand",
      "Chhattisgarh",
      "Odisha",
      "Maharashtra",
    ].map((name) => prisma.stateOption.create({ data: { name } })),
  );

  await Promise.all(
    ["Trading", "Steel", "Cement"].map((name) =>
      prisma.sectorOption.create({ data: { name } }),
    ),
  );

  const indonesia = origins.find((o) => o.name === "Indonesia")!;
  const gcv6000 = qualities.find((q) => q.name === "6000 GCV")!;

  const qualityClass = await prisma.qualityClass.create({
    data: {
      originId: indonesia.id,
      domestic: false,
      qualityOptionId: gcv6000.id,
    },
  });

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
        ownerName: "Gurpreet Singh",
        ownerContactNumber1: "9876500001",
        ownerContactNumber2: "9876500003",
        email: "gurpreet@singhlogistics.in",
        city: "Nagpur",
        state: "Maharashtra",
      },
      {
        name: "Deccan Transport",
        ownerName: "Suresh Rao",
        ownerContactNumber1: "9876500002",
        ownerContactNumber2: null,
        email: "suresh@deccantransport.in",
        city: "Raipur",
        state: "Chhattisgarh",
      },
    ],
  });

  const eastern = await prisma.customer.create({
    data: {
      name: "Eastern Coal Suppliers",
      category: CustomerCategory.SUPPLIER,
      ownerName: "Vikram Das",
      ownerContact: "9811100001",
      purchaserName: "Suresh Mehta",
      purchaserContact: "9811100011",
      purchaserRole: "Purchase Manager",
      city: "Kolkata",
      state: "West Bengal",
      creditDays: 30,
      sector: "Trading",
      saleExecutive: "Amit Sharma",
      approachForFundsId: rahul.id,
    },
  });

  const bharat = await prisma.customer.create({
    data: {
      name: "Bharat Steel Works",
      category: CustomerCategory.INDUSTRY,
      ownerName: "Anil Kumar",
      ownerContact: "9811100002",
      purchaserName: "Ravi Singh",
      purchaserContact: "9811100022",
      purchaserRole: "GM Purchase",
      paymentInChargeName: "Sunita Rao",
      paymentInChargeContact: "9811100023",
      paymentInChargeRole: "Finance Head",
      accountantName: "Karan Shah",
      accountantContact: "9811100024",
      email: "accounts@bharatsteel.example",
      city: "Jamshedpur",
      state: "Jharkhand",
      creditDays: 45,
      sector: "Steel",
      saleExecutive: "Amit Sharma",
    },
  });

  await prisma.customer.create({
    data: {
      name: "PowerGrid Cement",
      category: CustomerCategory.INDUSTRY,
      ownerName: "Meera Joshi",
      ownerContact: "9811100003",
      purchaserName: "Deepak Nair",
      purchaserContact: "9811100033",
      purchaserRole: "Buyer",
      paymentInChargeName: "Neha Patel",
      paymentInChargeContact: "9811100034",
      paymentInChargeRole: "Collections",
      email: "purchase@powergridcement.example",
      city: "Raipur",
      state: "Chhattisgarh",
      creditDays: 21,
      sector: "Cement",
      saleExecutive: "Priya Patel",
      approachForFundsId: rahul.id,
    },
  });

  await prisma.customer.create({
    data: {
      name: "Coastal Coal Traders",
      category: CustomerCategory.TRADER,
      ownerName: "Imran Khan",
      ownerContact: "9811100004",
      purchaserName: "Farhan Ali",
      purchaserContact: "9811100044",
      purchaserRole: "Trader",
      city: "Paradip",
      state: "Odisha",
      creditDays: 15,
      sector: "Trading",
      saleExecutive: "Amit Sharma",
      approachForFundsId: rahul.id,
    },
  });

  const haldia = ports.find((p) => p.name === "Haldia Port")!;

  const vessel = await prisma.vessel.create({
    data: {
      vesselName: "MV Black Diamond",
      qualityClassId: qualityClass.id,
      portId: haldia.id,
    },
  });

  await prisma.order.create({
    data: {
      poNumber: "SO 0001",
      orderType: OrderType.REGULAR,
      customerId: bharat.id,
      orderDate: new Date(),
      portId: haldia.id,
      creditDays: 30,
      qualityClassId: qualityClass.id,
      rate: new Decimal(8500),
      // Industry: 8500 + 18% GST = 10030
      finalRate: new Decimal(10030),
      quantity: new Decimal(2000),
      orderById: amit.id,
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO 0001",
      orderType: OrderType.REGULAR,
      importerId: eastern.id,
      vesselId: vessel.id,
      orderDate: new Date(),
      qualityClassId: qualityClass.id,
      rate: new Decimal(7200),
      finalRate: new Decimal("8665.92"),
      quantity: new Decimal(5000),
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
