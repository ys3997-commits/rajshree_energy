import Link from "next/link";
import { requirePage } from "@/lib/auth/access";
import {
  filterRowsByExecScope,
  getStaffReportExecScope,
  SALES_ENGINE_PAGE_KEY,
} from "@/lib/auth/report-exec-access";
import { listSalesEngineRows } from "@/lib/actions/salesEngine";
import { SalesEngineClient } from "./SalesEngineClient";

export default async function SalesEnginePage() {
  const access = await requirePage(SALES_ENGINE_PAGE_KEY);
  const rows = await listSalesEngineRows();
  const execScope = getStaffReportExecScope(access, SALES_ENGINE_PAGE_KEY);
  const filteredRows = filterRowsByExecScope(rows, execScope);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Sales
            <span aria-hidden="true"> · </span>
            Sales Engine Report
          </p>
          <h1 className="page-title">Sales Engine Report</h1>
          <p className="page-subtitle">
            Purchaser contacts with balance orders and planned sales calls.
          </p>
        </div>
      </div>

      <SalesEngineClient
        initialRows={filteredRows}
        allowedSaleExecutives={execScope}
      />
    </div>
  );
}
