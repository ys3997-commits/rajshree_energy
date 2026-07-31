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
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            Reports
          </p>
          <h1 className="page-title">Vessel report</h1>
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
