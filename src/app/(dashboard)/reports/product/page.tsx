import Link from "next/link";
import { listQualityReport } from "@/lib/actions/reports";
import { QualityReportList } from "./QualityReportList";

export default async function QualityReportListPage() {
  const rows = await listQualityReport();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Product
            <span aria-hidden="true"> · </span>
            Quality Report
          </p>
          <h1 className="page-title">Quality Report</h1>
          <p className="page-subtitle">
            Stock in hand and order in hand by quality class, with unsold qty
            (stock in hand − order in hand).
          </p>
        </div>
      </div>

      <QualityReportList rows={rows} />
    </div>
  );
}
