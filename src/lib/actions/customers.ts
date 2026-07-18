"use server";

import { CustomerCategory } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listCustomers() {
  return prisma.customer.findMany({
    include: {
      dealBy: { select: { id: true, name: true } },
      approachForFunds: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
}

/** Lightweight lookup for sale-order form auto-fill. */
export async function getCustomerOrderDefaults(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, category: true, creditDays: true },
  });
  if (!customer) throw new Error("Customer not found");
  return customer;
}

export type CustomerInput = {
  name: string;
  category: CustomerCategory;
  ownerName?: string | null;
  ownerContact?: string | null;
  purchaserName?: string | null;
  purchaserContact?: string | null;
  purchaserRole?: string | null;
  paymentInChargeName?: string | null;
  paymentInChargeContact?: string | null;
  paymentInChargeRole?: string | null;
  accountantName?: string | null;
  accountantContact?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  creditDays?: number | null;
  sector?: string | null;
  dealById?: string | null;
  approachForFundsId?: string | null;
};

function toCustomerData(input: CustomerInput) {
  return {
    name: input.name,
    category: input.category,
    ownerName: input.ownerName || null,
    ownerContact: input.ownerContact || null,
    purchaserName: input.purchaserName || null,
    purchaserContact: input.purchaserContact || null,
    purchaserRole: input.purchaserRole || null,
    paymentInChargeName: input.paymentInChargeName || null,
    paymentInChargeContact: input.paymentInChargeContact || null,
    paymentInChargeRole: input.paymentInChargeRole || null,
    accountantName: input.accountantName || null,
    accountantContact: input.accountantContact || null,
    email: input.email || null,
    city: input.city || null,
    state: input.state || null,
    creditDays:
      input.creditDays === undefined || input.creditDays === null
        ? null
        : input.creditDays,
    sector: input.sector || null,
    dealById: input.dealById || null,
    approachForFundsId: input.approachForFundsId || null,
  };
}

export async function createCustomer(input: CustomerInput) {
  const row = await prisma.customer.create({
    data: toCustomerData(input),
  });
  revalidatePath("/customers");
  return row;
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const row = await prisma.customer.update({
    where: { id },
    data: toCustomerData(input),
  });
  revalidatePath("/customers");
  return row;
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}
