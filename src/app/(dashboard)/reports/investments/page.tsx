import Link from "next/link";
import {
  listInvestmentPeriods,
  listInvestmentReportRows,
} from "@/lib/actions/investmentReport";
import { InvestmentsReportClient } from "./InvestmentsReportClient";

export default async function InvestmentsReportPage() {
  const [rows, periods] = await Promise.all([
    listInvestmentReportRows(),
    listInvestmentPeriods(),
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Investments
          </p>
          <h1 className="page-title">Investments</h1>
          <p className="page-subtitle">
            Track current investment and period profit / loss.
          </p>
        </div>
      </div>

      <InvestmentsReportClient initialRows={rows} initialPeriods={periods} />
    </div>
  );
}
