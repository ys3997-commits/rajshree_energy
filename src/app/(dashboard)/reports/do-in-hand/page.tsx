import Link from "next/link";
import {
  listDoInHandFunds,
  listDoInHandRunningPurchaseOrders,
} from "@/lib/actions/doInHand";
import { DoInHandClient } from "./DoInHandClient";

export const dynamic = "force-dynamic";

export default async function DoInHandReportPage() {
  const [purchaseOrders, funds] = await Promise.all([
    listDoInHandRunningPurchaseOrders(),
    listDoInHandFunds(),
  ]);

  return (
    <div className="do-in-hand-shell">
      <div className="page-header do-in-hand-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            DO in Hand
          </p>
          <h1 className="page-title">DO in Hand</h1>
        </div>
      </div>

      <DoInHandClient purchaseOrders={purchaseOrders} funds={funds} />
    </div>
  );
}
