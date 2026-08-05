import Link from "next/link";
import { listVesselReport } from "@/lib/actions/reports";
import { VesselReportList } from "./VesselReportList";

export default async function VesselReportListPage() {
  const vessels = await listVesselReport();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Vessel
            <span aria-hidden="true"> · </span>
            Vessel Report
          </p>
          <h1 className="page-title">Vessel Report</h1>
          <p className="page-subtitle">
            Order, dispatch, closing, and balance quantities rolled up from
            purchase orders on each vessel.
          </p>
        </div>
      </div>

      <VesselReportList vessels={vessels} />
    </div>
  );
}
