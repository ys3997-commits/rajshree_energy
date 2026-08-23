import Link from "next/link";
import { listCustomersWithDue } from "@/lib/actions/customers";
import { CollectionClient } from "./CollectionClient";

export default async function CollectionReportPage() {
  const rows = await listCustomersWithDue();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Collection Engine
            <span aria-hidden="true"> · </span>
            Collection Engine
          </p>
          <h1 className="page-title">Collection Engine</h1>
          <p className="page-subtitle">
            Buyer collection balances and planned calls.
          </p>
        </div>
      </div>

      <CollectionClient initialRows={rows} />
    </div>
  );
}
