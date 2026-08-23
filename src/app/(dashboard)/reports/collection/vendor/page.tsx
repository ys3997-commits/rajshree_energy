import Link from "next/link";
import { listCustomersWithDue } from "@/lib/actions/customers";
import { VendorCollectionClient } from "./VendorCollectionClient";

export default async function VendorCollectionReportPage() {
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
            Vendor Collection
          </p>
          <h1 className="page-title">Vendor Collection</h1>
          <p className="page-subtitle">
            Supplier collection balances and outstanding dues.
          </p>
        </div>
      </div>

      <VendorCollectionClient initialRows={rows} />
    </div>
  );
}
