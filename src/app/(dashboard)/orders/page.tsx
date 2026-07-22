import { CustomerCategory, OrderStatus } from "@/generated/prisma";
import { listOrders, listOrdersWithBalance } from "@/lib/actions/orders";
import {
  listPurchaseOrdersWithBalance,
  suggestNextPurchasePoNumber,
} from "@/lib/actions/purchaseOrders";
import { listCustomers } from "@/lib/actions/customers";
import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import { listStaff } from "@/lib/actions/staff";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { suggestNextPoNumber } from "@/lib/actions/dispatch";
import { formatMt, formatRs } from "@/lib/domain/computations";
import { formatCreditPeriod } from "@/lib/domain/format";
import { CreateOrderButton } from "@/components/CreateOrderButton";
import { CreateDispatchButton } from "@/components/CreateDispatchButton";
import Link from "next/link";

type SearchParams = Promise<{
  status?: string;
  customerId?: string;
  portId?: string;
  orderById?: string;
}>;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [
    orders,
    customers,
    staff,
    ports,
    balanceOrders,
    balancePurchases,
    transporters,
    vessels,
    qualityClasses,
    suggestedPo,
    suggestedPurchasePo,
  ] = await Promise.all([
    listOrders({
      status: (sp.status as OrderStatus) || "",
      customerId: sp.customerId || "",
      portId: sp.portId || "",
      orderById: sp.orderById || "",
    }),
    listCustomers({ activeOnly: true }),
    listStaff(),
    listPortOptions(),
    listOrdersWithBalance(),
    listPurchaseOrdersWithBalance(),
    listTransporters(),
    listVessels({ activeOnly: true }),
    listQualityClasses(),
    suggestNextPoNumber(),
    suggestNextPurchasePoNumber(),
  ]);

  const customerOpts = customers.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    creditDays: c.creditDays,
  }));
  const importerOpts = customers
    .filter((c) => c.category === CustomerCategory.SUPPLIER)
    .map((c) => ({ id: c.id, name: c.name }));
  const staffOpts = staff.map((s) => ({ id: s.id, name: s.name }));
  const portOpts = ports.map((p) => ({ id: p.id, name: p.name }));
  const qualityClassOpts = qualityClasses.map((qc) => ({
    id: qc.id,
    domestic: qc.domestic,
    origin: qc.origin,
    qualityOption: qc.qualityOption,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sale orders</h1>
          <p className="page-subtitle">Track POs, balances, and dispatch progress.</p>
        </div>
        <div className="flex gap-2">
          <CreateOrderButton
            customers={customerOpts}
            ports={portOpts}
            qualityClasses={qualityClassOpts}
            suggestedPo={suggestedPo}
          />
          <CreateDispatchButton
            orders={balanceOrders.map((o) => ({
              poNumber: o.poNumber,
              balanceOrder: o.balanceOrder?.toString() ?? null,
              customer: o.customer,
            }))}
            purchaseOrders={balancePurchases.map((p) => ({
              poNumber: p.poNumber,
              balanceOrder: p.balanceOrder?.toString() ?? null,
              importer: p.importer,
              vessel: p.vessel,
              qualityClass: p.qualityClass,
            }))}
            transporters={transporters.map((t) => ({ id: t.id, name: t.name }))}
            customers={customerOpts}
            vessels={vessels.map((v) => ({
              id: v.id,
              vesselName: v.vesselName,
            }))}
            staff={staffOpts}
            suggestedPo={suggestedPo}
            suggestedPurchasePo={suggestedPurchasePo}
          />
        </div>
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
          Customer
          <select name="customerId" defaultValue={sp.customerId ?? ""}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Port
          <select name="portId" defaultValue={sp.portId ?? ""}>
            <option value="">All</option>
            {ports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
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
              <th>PO</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Quantity (MT)</th>
              <th>Dispatched (MT)</th>
              <th>Balance (MT)</th>
              <th>Status</th>
              <th>Credit period</th>
              <th>Port</th>
              <th>Basic rate</th>
              <th>Final rate</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link
                    href={`/orders/${row.id}`}
                    className="font-medium"
                  >
                    {row.poNumber}
                  </Link>
                </td>
                <td>{row.customer.name}</td>
                <td>{row.orderType}</td>
                <td>{formatMt(row.quantity)}</td>
                <td>{formatMt(row.dispatchedOrder)}</td>
                <td>{formatMt(row.balanceOrder)}</td>
                <td>{row.orderStatus}</td>
                <td>{formatCreditPeriod(row.creditDays)}</td>
                <td>{row.port?.name ?? "—"}</td>
                <td>{formatRs(row.rate)}</td>
                <td>{formatRs(row.finalRate)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={11}>No orders match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
