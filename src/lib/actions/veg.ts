"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { CustomerCategory, VegPaymentBasis } from "@/generated/prisma";
import { capitalizeName, toSentenceCase } from "@/lib/domain/format";
import { toDecimal } from "@/lib/domain/computations";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type VegListRow = {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  mobile: string | null;
  role: string | null;
  paymentBasis: VegPaymentBasis;
  amount: string;
  active: boolean;
};

export type VegIndustryCustomer = {
  id: string;
  name: string;
};

export type VegInput = {
  customerId: string;
  name: string;
  mobile?: string | null;
  role?: string | null;
  paymentBasis: VegPaymentBasis | string;
  amount: string | number;
};

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || null;
}

function parsePaymentBasis(value: VegPaymentBasis | string): VegPaymentBasis {
  if (value === VegPaymentBasis.PER_MT || value === VegPaymentBasis.PER_LORRY) {
    return value;
  }
  throw new Error("Select Per MT or Per Lorry");
}

function parseAmount(value: string | number | null | undefined): Decimal {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error("Rate is required");
  }
  const d = toDecimal(value);
  if (!d.isFinite() || d.lt(0)) {
    throw new Error("Rate must be a valid amount");
  }
  return d.toDecimalPlaces(0);
}

async function requireIndustryCustomer(customerId: string) {
  const id = customerId.trim();
  if (!id) throw new Error("Customer is required");
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { id: true, category: true },
  });
  if (!customer) throw new Error("Customer not found");
  if (customer.category !== CustomerCategory.INDUSTRY) {
    throw new Error("Customer must be Industry");
  }
  return customer.id;
}

async function toVegData(input: VegInput) {
  const customerId = await requireIndustryCustomer(input.customerId);
  const name = capitalizeName(input.name) ?? input.name.trim();
  if (!name) throw new Error("Veg name is required");
  return {
    customerId,
    name,
    mobile: normalizePhone(input.mobile),
    role: toSentenceCase(input.role),
    paymentBasis: parsePaymentBasis(input.paymentBasis),
    amount: parseAmount(input.amount),
  };
}

export async function listIndustryCustomers(): Promise<VegIndustryCustomer[]> {
  return prisma.customer.findMany({
    where: { category: CustomerCategory.INDUSTRY },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function listVegs(): Promise<VegListRow[]> {
  const rows = await prisma.veg.findMany({
    orderBy: [{ customer: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      customerId: true,
      name: true,
      mobile: true,
      role: true,
      paymentBasis: true,
      amount: true,
      active: true,
      customer: { select: { name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    customerId: row.customerId,
    customerName: row.customer.name,
    name: row.name,
    mobile: row.mobile,
    role: row.role,
    paymentBasis: row.paymentBasis,
    amount: row.amount.toString(),
    active: row.active,
  }));
}

function revalidateVegPaths() {
  revalidatePath("/veg");
  revalidatePath("/reports/veg");
  revalidatePath("/reports/veg/discount");
  revalidatePath("/reports/veg/ledger");
}

export async function createVeg(input: VegInput) {
  await prisma.veg.create({
    data: { ...(await toVegData(input)), active: true },
    select: { id: true },
  });
  revalidateVegPaths();
}

export async function updateVeg(id: string, input: VegInput) {
  await prisma.veg.update({
    where: { id },
    data: await toVegData(input),
    select: { id: true },
  });
  revalidateVegPaths();
}

export async function updateVegActive(id: string, active: boolean) {
  const existing = await prisma.veg.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error("Veg not found");

  await prisma.veg.update({
    where: { id },
    data: { active },
    select: { id: true },
  });
  revalidateVegPaths();
}

export async function deleteVeg(id: string) {
  const [paymentCount, discountCount] = await Promise.all([
    prisma.vegPayment.count({ where: { vegId: id } }),
    prisma.vegDiscount.count({ where: { vegId: id } }),
  ]);
  if (paymentCount > 0 || discountCount > 0) {
    throw new Error(
      "Cannot delete: this veg has payment or discount records",
    );
  }
  await prisma.veg.delete({ where: { id } });
  revalidateVegPaths();
}
