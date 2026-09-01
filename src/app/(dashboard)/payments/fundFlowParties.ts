import { listCustomers } from "@/lib/actions/customers";
import { listTransporters } from "@/lib/actions/transporters";

export async function loadFundFlowParties() {
  const [customers, transporters] = await Promise.all([
    listCustomers({ activeOnly: true }),
    listTransporters(),
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
  ];
}
