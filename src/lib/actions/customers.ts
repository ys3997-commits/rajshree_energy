"use server";

import { CustomerCategory } from "@/generated/prisma";
import { capitalizeName } from "@/lib/domain/format";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listCustomers(options?: { activeOnly?: boolean }) {
  return prisma.customer.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: { name: "asc" },
  });
}

/** Lightweight lookup for sale-order form auto-fill. */
export async function getCustomerOrderDefaults(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, category: true, creditDays: true, active: true },
  });
  if (!customer) throw new Error("Customer not found");
  if (!customer.active) throw new Error("Customer is inactive");
  return customer;
}

export type CustomerInput = {
  name: string;
  category: CustomerCategory;
  active?: boolean;
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
  saleExecutive?: string | null;
  approachForFunds?: string | null;
};

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

function toCustomerData(input: CustomerInput) {
  return {
    name: capitalizeName(input.name) ?? input.name.trim(),
    category: input.category,
    active: input.active ?? true,
    ownerName: capitalizeName(input.ownerName),
    ownerContact: normalizePhone(input.ownerContact),
    purchaserName: capitalizeName(input.purchaserName),
    purchaserContact: normalizePhone(input.purchaserContact),
    purchaserRole: input.purchaserRole || null,
    paymentInChargeName: capitalizeName(input.paymentInChargeName),
    paymentInChargeContact: normalizePhone(input.paymentInChargeContact),
    paymentInChargeRole: input.paymentInChargeRole || null,
    accountantName: capitalizeName(input.accountantName),
    accountantContact: normalizePhone(input.accountantContact),
    email: input.email || null,
    city: input.city || null,
    state: input.state || null,
    creditDays:
      input.creditDays === undefined || input.creditDays === null
        ? null
        : input.creditDays,
    sector: input.sector || null,
    saleExecutive: input.saleExecutive || null,
    approachForFunds: input.approachForFunds || null,
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
