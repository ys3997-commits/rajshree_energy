import { listCustomerAgeingReport } from "@/lib/actions/ageingReport";
import { requirePage } from "@/lib/auth/access";
import {
  AGEING_REPORT_PAGE_KEY,
  filterRowsByExecScope,
  getStaffReportExecScope,
} from "@/lib/auth/report-exec-access";
import { AgeingReportClient } from "./AgeingReportClient";

export default async function AgeingReportPage() {
  const access = await requirePage(AGEING_REPORT_PAGE_KEY);
  const rows = await listCustomerAgeingReport();
  const execScope = getStaffReportExecScope(access, AGEING_REPORT_PAGE_KEY);
  const filteredRows = filterRowsByExecScope(rows, execScope);

  return <AgeingReportClient rows={filteredRows} />;
}
