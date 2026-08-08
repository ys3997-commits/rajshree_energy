import Link from "next/link";
import { listVesselSuppliedReport } from "@/lib/actions/reports";
import { VesselSuppliedList } from "./VesselSuppliedList";

export default async function VesselSuppliedPage() {
  const vessels = await listVesselSuppliedReport();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Vessel
            <span aria-hidden="true"> · </span>
            Vessel Supplied
          </p>
          <h1 className="page-title">Vessel Supplied</h1>
          <p className="page-subtitle">
            Total dispatched quantity per vessel, split between industry and
            trader/vendor customers.
          </p>
        </div>
      </div>

      <VesselSuppliedList vessels={vessels} />
    </div>
  );
}
