import { PurchaseOrderStatus } from "@/generated/prisma";
import {
  listPurchaseOrders,
  suggestNextPurchasePoNumber,
} from "@/lib/actions/purchaseOrders";
import { listCustomers } from "@/lib/actions/customers";
import { listVessels } from "@/lib/actions/vessels";
import { formatRs } from "@/lib/domain/computations";
import {
  daysSinceOrder,
  displayOrderBalance,
  displayOrderQuantity,
  formatCreditPeriod,
  formatOrderStatusForDisplay,
  formatOrderType,
  formatSaleOrderMt,
} from "@/lib/domain/format";
import { CreatePurchaseOrderButton } from "@/components/CreatePurchaseOrderButton";
import { CloseQuantityButton } from "@/components/CloseQuantityButton";
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
    listCustomers({ activeOnly: true }),
    listVessels(),
    suggestNextPurchasePoNumber(),
  ]);

  const importers = customers.map((c) => ({ id: c.id, name: c.name }));
  const activeVessels = vessels.filter((v) => v.active);

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
          vessels={activeVessels.map((v) => ({
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

      <div className="table-wrap table-wrap-scroll">
        <table className="data purchase-orders-table">
          <thead>
            <tr>
              <th>Purchase PO</th>
              <th className="col-vendor">Vendor</th>
              <th className="col-vessel">Vessel</th>
              <th>Type</th>
              <th className="num col-days-since-order">
                Days since
                <br />
                order
              </th>
              <th className="num">Quantity</th>
              <th className="num">Dispatched</th>
              <th className="num">Closing</th>
              <th className="num">Balance</th>
              <th className="num">Basic rate</th>
              <th className="num">Final rate</th>
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
                      href={`/purchase-orders/${row.id}`}
                      className="font-medium"
                    >
                      {row.poNumber}
                    </Link>
                  </td>
                  <td className="col-vendor">{row.importer.name}</td>
                  <td className="col-vessel">{row.vessel.vesselName}</td>
                  <td>{formatOrderType(row.orderType)}</td>
                  <td className="num col-days-since-order">
                    {formatCreditPeriod(
                      daysSinceOrder(row.orderDate, row.createdAt),
                    )}
                  </td>
                  <td className="num">{formatSaleOrderMt(displayOrderQuantity(row))}</td>
                  <td className="num">{formatSaleOrderMt(row.dispatchedOrder)}</td>
                  <td className="num">{formatSaleOrderMt(row.closingQuantity)}</td>
                  <td className="num">{formatSaleOrderMt(displayOrderBalance(row))}</td>
                  <td className="num">{formatRs(row.rate)}</td>
                  <td className="num">{formatRs(row.finalRate)}</td>
                  <td>{formatOrderStatusForDisplay(row)}</td>
                  <td className="col-actions">
                    {canClose ? (
                      <CloseQuantityButton
                        orderId={row.id}
                        kind="purchase"
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
                <td colSpan={13}>No purchase orders match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
