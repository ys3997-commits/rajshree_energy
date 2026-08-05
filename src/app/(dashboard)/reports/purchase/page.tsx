import Link from "next/link";

export default function PurchaseReportPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Purchase
          </p>
          <h1 className="page-title">Purchase</h1>
          <p className="page-subtitle">Purchase report coming soon.</p>
        </div>
      </div>
    </div>
  );
}
