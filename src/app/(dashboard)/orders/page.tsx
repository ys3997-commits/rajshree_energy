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
import { formatRs } from "@/lib/domain/computations";
import {
  daysSinceOrder,
  displayOrderBalance,
  displayOrderQuantity,
  formatCreditPeriod,
  formatIndianNumber,
  formatOrderStatusForDisplay,
  formatOrderType,
  formatSaleOrderMt,
} from "@/lib/domain/format";
import { CreateOrderButton } from "@/components/CreateOrderButton";
import { CreateDispatchButton } from "@/components/CreateDispatchButton";
import { CloseQuantityButton } from "@/components/CloseQuantityButton";
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
      status: sp.status || "",
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
              rate: o.rate?.toString() ?? null,
              customer: o.customer,
            }))}
            purchaseOrders={balancePurchases.map((p) => ({
              poNumber: p.poNumber,
              balanceOrder: p.balanceOrder?.toString() ?? null,
              rate: p.rate?.toString() ?? null,
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
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
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

      <div className="table-wrap table-wrap-scroll">
        <table className="data orders-table">
          <thead>
            <tr>
              <th>PO number</th>
              <th>Customer</th>
              <th>Type</th>
              <th className="num col-lorries">
                Number of
                <br />
                lorries
              </th>
              <th className="num">Order quantity</th>
              <th className="num">Dispatched quantity</th>
              <th className="num">Closing quantity</th>
              <th className="num">Balance</th>
              <th className="num">Trucks dispatch</th>
              <th className="num col-days-since-order">
                Days since
                <br />
                order
              </th>
              <th className="num">Basic rate</th>
              <th>Status</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row) => {
              const canClose =
                row.quantity != null &&
                row.closingQuantity == null &&
                row.balanceOrder != null &&
                row.balanceOrder.gt(0);
              return (
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
                <td>{formatOrderType(row.orderType)}</td>
                <td className="num col-lorries">
                  {formatIndianNumber(row.numberOfLorries)}
                </td>
                <td className="num">{formatSaleOrderMt(displayOrderQuantity(row))}</td>
                <td className="num">{formatSaleOrderMt(row.dispatchedOrder)}</td>
                <td className="num">{formatSaleOrderMt(row.closingQuantity)}</td>
                <td className="num">{formatSaleOrderMt(displayOrderBalance(row))}</td>
                <td className="num">
                  {formatIndianNumber(row._count.dispatches)}
                </td>
                <td className="num col-days-since-order">
                  {formatCreditPeriod(
                    daysSinceOrder(row.orderDate, row.createdAt),
                  )}
                </td>
                <td className="num">{formatRs(row.rate)}</td>
                <td>{formatOrderStatusForDisplay(row)}</td>
                <td className="col-actions">
                  {canClose ? (
                    <CloseQuantityButton
                      orderId={row.id}
                      kind="sale"
                      balanceMt={row.balanceOrder!.toString()}
                    />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={13}>No orders match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
