import { listCustomers } from "@/lib/actions/customers";
import { listInvestmentCompanies } from "@/lib/actions/investments";
import { listTransporters } from "@/lib/actions/transporters";

export async function loadFundFlowParties() {
  const [customers, transporters, investments] = await Promise.all([
    listCustomers({ activeOnly: true }),
    listTransporters(),
    listInvestmentCompanies(),
  ]);

  return [
    ...customers.map((c) => ({
      id: c.id,
      name: c.name,
      kind: "customer" as const,
      category: c.category,
    })),
    ...transporters.map((t) => ({
      id: t.id,
      name: t.name,
      kind: "transporter" as const,
    })),
    ...investments.map((c) => ({
      id: c.id,
      name: c.name,
      kind: "investment" as const,
    })),
  ];
}
