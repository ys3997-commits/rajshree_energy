import { CustomerCategory, PurchaseOrderStatus } from "@/generated/prisma";
import {
  listPurchaseOrders,
  suggestNextPurchasePoNumber,
} from "@/lib/actions/purchaseOrders";
import { listCustomers } from "@/lib/actions/customers";
import { listVessels } from "@/lib/actions/vessels";
import {
  formatMt,
  formatPurchaseOrderStatus,
  formatRs,
} from "@/lib/domain/computations";
import { CreatePurchaseOrderButton } from "@/components/CreatePurchaseOrderButton";
import Link from "next/link";

type SearchParams = Promise<{
  status?: string;
  importerId?: string;
  vesselId?: string;
}>;

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const statusFilter =
    sp.status === PurchaseOrderStatus.RUNNING ||
    sp.status === PurchaseOrderStatus.COMPLETED
      ? sp.status
      : "";

  const [orders, customers, vessels, suggestedPo] = await Promise.all([
    listPurchaseOrders({
      status: statusFilter,
      importerId: sp.importerId || "",
      vesselId: sp.vesselId || "",
    }),
    listCustomers(),
    listVessels(),
    suggestNextPurchasePoNumber(),
  ]);

  const importers = customers
    .filter((c) => c.category === CustomerCategory.SUPPLIER)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase orders</h1>
          <p className="page-subtitle">
            Costing POs by vendor and vessel — used when dispatching.
          </p>
        </div>
        <CreatePurchaseOrderButton
          importers={importers}
          vessels={vessels.map((v) => ({
            id: v.id,
            vesselName: v.vesselName,
            qualityClassId: v.qualityClassId,
            qualityClass: v.qualityClass,
            port: v.port,
          }))}
          suggestedPo={suggestedPo}
        />
      </div>

      <form className="filters" method="get">
        <label>
          Status
          <select name="status" defaultValue={statusFilter}>
            <option value="">All</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
        <label>
          Vendor
          <select name="importerId" defaultValue={sp.importerId ?? ""}>
            <option value="">All</option>
            {importers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vessel
          <select name="vesselId" defaultValue={sp.vesselId ?? ""}>
            <option value="">All</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vesselName}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
      </form>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Purchase PO</th>
              <th>Vendor</th>
              <th>Vessel</th>
              <th>Type</th>
              <th>Quantity (MT)</th>
              <th>Dispatched (MT)</th>
              <th>Balance (MT)</th>
              <th>Rate (Rs)</th>
              <th>Final rate (Rs)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link
                    href={`/purchase-orders/${row.id}`}
                    className="font-medium"
                  >
                    {row.poNumber}
                  </Link>
                </td>
                <td>{row.importer.name}</td>
                <td>{row.vessel.vesselName}</td>
                <td>{row.orderType}</td>
                <td>{formatMt(row.quantity)}</td>
                <td>{formatMt(row.dispatchedOrder)}</td>
                <td>{formatMt(row.balanceOrder)}</td>
                <td>{formatRs(row.rate)}</td>
                <td>{formatRs(row.finalRate)}</td>
                <td>{formatPurchaseOrderStatus(row.orderStatus)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={10}>No purchase orders match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
