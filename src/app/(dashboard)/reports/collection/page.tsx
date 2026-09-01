import Link from "next/link";
import { requirePage } from "@/lib/auth/access";
import {
  COLLECTION_ENGINE_PAGE_KEY,
  filterRowsByExecScope,
  getStaffReportExecScope,
} from "@/lib/auth/report-exec-access";
import { listCustomersWithDue } from "@/lib/actions/customers";
import { CollectionClient } from "./CollectionClient";

export default async function CollectionReportPage() {
  const access = await requirePage(COLLECTION_ENGINE_PAGE_KEY);
  const rows = await listCustomersWithDue();
  const execScope = getStaffReportExecScope(access, COLLECTION_ENGINE_PAGE_KEY);
  const filteredRows = filterRowsByExecScope(rows, execScope);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Collection
            <span aria-hidden="true"> · </span>
            Collection Engine
          </p>
          <h1 className="page-title">Collection Engine</h1>
        </div>
      </div>

      <CollectionClient
        initialRows={filteredRows}
        allowedSaleExecutives={execScope}
      />
    </div>
  );
}
