import { CustomerCategory, OrderStatus } from "@/generated/prisma";
import {
  listPurchaseOrders,
  suggestNextPurchasePoNumber,
} from "@/lib/actions/purchaseOrders";
import { listCustomers } from "@/lib/actions/customers";
import { listStaff } from "@/lib/actions/staff";
import { listVessels } from "@/lib/actions/vessels";
import { formatMt, formatRs } from "@/lib/domain/computations";
import { CreatePurchaseOrderButton } from "@/components/CreatePurchaseOrderButton";
import Link from "next/link";

type SearchParams = Promise<{
  status?: string;
  importerId?: string;
  vesselId?: string;
  orderById?: string;
}>;

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [orders, customers, staff, vessels, suggestedPo] = await Promise.all([
    listPurchaseOrders({
      status: (sp.status as OrderStatus) || "",
      importerId: sp.importerId || "",
      vesselId: sp.vesselId || "",
      orderById: sp.orderById || "",
    }),
    listCustomers(),
    listStaff(),
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
            Costing POs by importer and vessel — used when dispatching.
          </p>
        </div>
        <CreatePurchaseOrderButton
          importers={importers}
          vessels={vessels.map((v) => ({
            id: v.id,
            vesselName: v.vesselName,
            importerId: v.importerId,
            importer: v.importer,
          }))}
          staff={staff.map((s) => ({ id: s.id, name: s.name }))}
          suggestedPo={suggestedPo}
        />
      </div>

      <form className="filters" method="get">
        <label>
          Status
          <select name="status" defaultValue={sp.status ?? ""}>
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="PENDING">PENDING</option>
            <option value="PARTIALLY_DISPATCHED">PARTIALLY_DISPATCHED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </label>
        <label>
          Importer
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
        <label>
          Order by
          <select name="orderById" defaultValue={sp.orderById ?? ""}>
            <option value="">All</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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
              <th>Importer</th>
              <th>Vessel</th>
              <th>Type</th>
              <th>Quantity (MT)</th>
              <th>Dispatched (MT)</th>
              <th>Balance (MT)</th>
              <th>Rate (Rs)</th>
              <th>Status</th>
              <th>Order by</th>
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
                <td>{row.orderStatus}</td>
                <td>{row.orderBy?.name ?? "—"}</td>
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
