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
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            Reports
          </p>
          <h1 className="page-title">Sales engine</h1>
          <p className="page-subtitle">
            Purchaser contacts, balance orders, and planned sales calls.
          </p>
        </div>
      </div>

      <SalesEngineClient initialRows={rows} />
    </div>
  );
}
