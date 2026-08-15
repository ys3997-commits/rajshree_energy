import Link from "next/link";
import { listTransportDueRows } from "@/lib/actions/transportDue";
import { TransportDueClient } from "./TransportDueClient";

export default async function TransportDuePage() {
  const rows = await listTransportDueRows();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Transport
            <span aria-hidden="true"> · </span>
            Transport Due
          </p>
          <h1 className="page-title">Transport Due</h1>
          <p className="page-subtitle">
            Outstanding freight balances with transporters.
          </p>
        </div>
      </div>

      <TransportDueClient initialRows={rows} />
    </div>
  );
}
