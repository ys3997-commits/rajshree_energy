import { listInvestmentOpenDues } from "@/lib/actions/investmentOpenDues";
import { listInvestmentCompanies } from "@/lib/actions/investments";
import { InvestmentOpenDueClient } from "./InvestmentOpenDueClient";

export default async function InvestmentOpenDuePage() {
  const [rows, companies] = await Promise.all([
    listInvestmentOpenDues(),
    listInvestmentCompanies(),
  ]);

  return (
    <InvestmentOpenDueClient
      initial={rows}
      companies={companies.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
