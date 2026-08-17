import { listCustomerAgeingReport } from "@/lib/actions/ageingReport";
import { AgeingReportClient } from "./AgeingReportClient";

export default async function AgeingReportPage() {
  const rows = await listCustomerAgeingReport();
  return <AgeingReportClient rows={rows} />;
}
