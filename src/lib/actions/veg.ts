"use server";

import { Decimal } from "@prisma/client/runtime/library";
import {
  CustomerCategory,
  Prisma,
  VegPaymentBasis,
} from "@/generated/prisma";
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
  beginDate: string;
  stopDate: string | null;
  active: boolean;
};

export type VegIndustryCustomer = {
  id: string;
  name: string;
};

export type VegFactoryInput = {
  id?: string;
  customerId: string;
  paymentBasis: VegPaymentBasis | string;
  amount: string | number;
  beginDate: string;
  stopDate?: string | null;
};

export type VegCreateInput = {
  name: string;
  mobile?: string | null;
  role?: string | null;
  factories: VegFactoryInput[];
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

function formatDay(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function parseDate(value: string, label: string): Date {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error(`${label} is required`);
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${label.toLowerCase()}`);
  }
  return date;
}

function parseOptionalDate(
  value: string | null | undefined,
  label: string,
): Date | null {
  if (value == null || String(value).trim() === "") return null;
  return parseDate(String(value), label);
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

function parsePerson(input: {
  name: string;
  mobile?: string | null;
  role?: string | null;
}) {
  const name = capitalizeName(input.name) ?? input.name.trim();
  if (!name) throw new Error("Veg name is required");
  return {
    name,
    mobile: normalizePhone(input.mobile),
    role: toSentenceCase(input.role),
  };
}

async function parseFactory(input: VegFactoryInput, labelPrefix = "") {
  const customerId = await requireIndustryCustomer(input.customerId);
  const beginLabel = labelPrefix ? `${labelPrefix} begin date` : "Begin date";
  const stopLabel = labelPrefix ? `${labelPrefix} stop date` : "Stop date";
  const beginDate = parseDate(input.beginDate ?? "", beginLabel);
  const stopDate = parseOptionalDate(input.stopDate, stopLabel);
  if (stopDate && stopDate < beginDate) {
    throw new Error(
      labelPrefix
        ? `${labelPrefix}: stop date cannot be before begin date`
        : "Stop date cannot be before begin date",
    );
  }
  return {
    customerId,
    paymentBasis: parsePaymentBasis(input.paymentBasis),
    amount: parseAmount(input.amount),
    beginDate,
    stopDate,
  };
}

async function assertUniqueFactoryAssignment(
  customerId: string,
  name: string,
  excludeId?: string,
) {
  const existing = await prisma.veg.findFirst({
    where: {
      customerId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, customer: { select: { name: true } } },
  });
  if (!existing) return;
  const factory =
    capitalizeName(existing.customer.name) ?? existing.customer.name;
  throw new Error(
    `${name} is already assigned to ${factory}. Edit that row to change dates, or pick another factory.`,
  );
}

async function syncPersonContact(
  name: string,
  mobile: string | null,
  role: string | null,
  exceptId: string,
) {
  await prisma.veg.updateMany({
    where: {
      id: { not: exceptId },
      name: { equals: name, mode: "insensitive" },
    },
    data: { mobile, role },
  });
}

function asUniqueFactoryError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new Error(
      "This veg is already assigned to this factory. Edit that row to change dates.",
    );
  }
  throw error;
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
    orderBy: [{ name: "asc" }, { customer: { name: "asc" } }],
    select: {
      id: true,
      customerId: true,
      name: true,
      mobile: true,
      role: true,
      paymentBasis: true,
      amount: true,
      beginDate: true,
      stopDate: true,
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
    beginDate: formatDay(row.beginDate) ?? "",
    stopDate: formatDay(row.stopDate),
    active: row.active,
  }));
}

function revalidateVegPaths() {
  revalidatePath("/veg");
  revalidatePath("/reports/veg");
  revalidatePath("/reports/veg/discount");
  revalidatePath("/reports/veg/ledger");
}

export async function createVeg(input: VegCreateInput) {
  const person = parsePerson(input);
  if (!input.factories.length) {
    throw new Error("Add at least one factory");
  }

  const factories = [];
  for (let i = 0; i < input.factories.length; i++) {
    const label = input.factories.length > 1 ? `Factory ${i + 1}` : "";
    factories.push(await parseFactory(input.factories[i], label));
  }

  const customerIds = factories.map((factory) => factory.customerId);
  if (new Set(customerIds).size !== customerIds.length) {
    throw new Error("Each factory can be added only once");
  }

  for (const factory of factories) {
    await assertUniqueFactoryAssignment(factory.customerId, person.name);
  }

  let created: { id: string }[];
  try {
    created = await prisma.$transaction(
      factories.map((factory) =>
        prisma.veg.create({
          data: {
            ...person,
            ...factory,
            active: factory.stopDate == null,
          },
          select: { id: true },
        }),
      ),
    );
  } catch (error) {
    asUniqueFactoryError(error);
  }
  await syncPersonContact(
    person.name,
    person.mobile,
    person.role,
    created[0].id,
  );
  revalidateVegPaths();
}

export async function updateVeg(input: VegCreateInput) {
  const person = parsePerson(input);
  if (!input.factories.length) {
    throw new Error("Add at least one factory");
  }

  const factories: Array<{
    id?: string;
    customerId: string;
    paymentBasis: VegPaymentBasis;
    amount: ReturnType<typeof parseAmount>;
    beginDate: Date;
    stopDate: Date | null;
  }> = [];
  for (let i = 0; i < input.factories.length; i++) {
    const factory = input.factories[i];
    const label = input.factories.length > 1 ? `Factory ${i + 1}` : "";
    factories.push({
      id: factory.id?.trim() || undefined,
      ...(await parseFactory(factory, label)),
    });
  }

  const customerIds = factories.map((factory) => factory.customerId);
  if (new Set(customerIds).size !== customerIds.length) {
    throw new Error("Each factory can be added only once");
  }

  for (const factory of factories) {
    await assertUniqueFactoryAssignment(
      factory.customerId,
      person.name,
      factory.id,
    );
  }

  try {
    await prisma.$transaction(
      factories.map((factory) => {
        const data = {
          ...person,
          customerId: factory.customerId,
          paymentBasis: factory.paymentBasis,
          amount: factory.amount,
          beginDate: factory.beginDate,
          stopDate: factory.stopDate,
          ...(factory.stopDate != null ? { active: false } : {}),
        };
        if (factory.id) {
          return prisma.veg.update({
            where: { id: factory.id },
            data,
            select: { id: true },
          });
        }
        return prisma.veg.create({
          data: { ...data, active: factory.stopDate == null },
          select: { id: true },
        });
      }),
    );
  } catch (error) {
    asUniqueFactoryError(error);
  }

  const existingId = factories.find((factory) => factory.id)?.id;
  if (existingId) {
    await syncPersonContact(person.name, person.mobile, person.role, existingId);
  }
  revalidateVegPaths();
}

export async function updateVegActive(id: string, active: boolean) {
  const existing = await prisma.veg.findUnique({
    where: { id },
    select: { id: true, stopDate: true },
  });
  if (!existing) throw new Error("Veg not found");
  if (active && existing.stopDate) {
    throw new Error("Clear stop date before setting Active");
  }

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
