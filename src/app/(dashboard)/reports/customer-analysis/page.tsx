import Link from "next/link";
import { listCustomers } from "@/lib/actions/customers";
import { CustomerAnalysisList } from "./CustomerAnalysisList";

export default async function CustomerAnalysisListPage() {
  const customers = await listCustomers();

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/">Home</Link>
            <span aria-hidden="true"> · </span>
            Reports
          </p>
          <h1 className="page-title">Customer analysis</h1>
          <p className="page-subtitle">
            Pick a customer to see buy-side and sell-side volume, balance, and
            margin.
          </p>
        </div>
      </div>

      <CustomerAnalysisList
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
          active: c.active,
          city: c.city,
          state: c.state,
        }))}
      />
    </div>
  );
}
