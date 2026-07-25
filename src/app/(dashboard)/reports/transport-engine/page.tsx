import Link from "next/link";
import { listTransportEngineRows } from "@/lib/actions/transportEngine";
import { TransportEngineClient } from "./TransportEngineClient";

export default async function TransportEnginePage() {
  const rows = await listTransportEngineRows();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            Reports
          </p>
          <h1 className="page-title">Transport engine</h1>
          <p className="page-subtitle">
            Dispatch-wise freight, weights, and transport document checklist.
          </p>
        </div>
      </div>

      <TransportEngineClient initialRows={rows} />
    </div>
  );
}
