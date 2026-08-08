import { listCustomerAnalysisReport } from "@/lib/actions/reports";
import { CustomerAnalysisList } from "./CustomerAnalysisList";

export default async function CustomerAnalysisListPage() {
  const customers = await listCustomerAnalysisReport();

  return <CustomerAnalysisList customers={customers} />;
}
