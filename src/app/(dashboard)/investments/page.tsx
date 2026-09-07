import { listInvestmentCompanies } from "@/lib/actions/investments";
import { InvestmentCompaniesClient } from "./InvestmentCompaniesClient";

export default async function InvestmentsPage() {
  const rows = await listInvestmentCompanies();
  return <InvestmentCompaniesClient initial={rows} />;
}
