import Link from "next/link";
import { listSalesEngineRows } from "@/lib/actions/salesEngine";
import { SalesEngineClient } from "./SalesEngineClient";

export default async function SalesEnginePage() {
  const rows = await listSalesEngineRows();

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

      <SalesEngineClient initialRows={rows} />
    </div>
  );
}
