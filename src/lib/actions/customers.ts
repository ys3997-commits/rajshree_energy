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

export type CustomerInput = {
  name: string;
  category: CustomerCategory;
  contactNumber?: string | null;
  pocName?: string | null;
  area?: string | null;
  industrySector?: string | null;
  dealById?: string | null;
  approachForFundsId?: string | null;
};

export async function createCustomer(input: CustomerInput) {
  const row = await prisma.customer.create({
    data: {
      name: input.name,
      category: input.category,
      contactNumber: input.contactNumber || null,
      pocName: input.pocName || null,
      area: input.area || null,
      industrySector: input.industrySector || null,
      dealById: input.dealById || null,
      approachForFundsId: input.approachForFundsId || null,
    },
  });
  revalidatePath("/customers");
  return row;
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const row = await prisma.customer.update({
    where: { id },
    data: {
      name: input.name,
      category: input.category,
      contactNumber: input.contactNumber || null,
      pocName: input.pocName || null,
      area: input.area || null,
      industrySector: input.industrySector || null,
      dealById: input.dealById || null,
      approachForFundsId: input.approachForFundsId || null,
    },
  });
  revalidatePath("/customers");
  return row;
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}
