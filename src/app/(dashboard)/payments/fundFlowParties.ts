import { listCustomersForSelect } from "@/lib/actions/customers";
import { listInvestmentCompanies } from "@/lib/actions/investments";
import { listTransporters } from "@/lib/actions/transporters";
import { memoize } from "@/lib/memoryCache";

export async function loadFundFlowParties() {
  return memoize("payments:fund-flow-parties", 30_000, async () => {
    const [customers, transporters, investments] = await Promise.all([
      listCustomersForSelect({ activeOnly: true }),
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
  });
}
