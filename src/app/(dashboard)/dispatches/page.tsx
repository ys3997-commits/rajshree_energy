import Link from "next/link";
import { ReceiptStatus } from "@/generated/prisma";
import { listDispatches } from "@/lib/actions/receipts";
import { listCustomers } from "@/lib/actions/customers";
import { listOrdersWithBalance } from "@/lib/actions/orders";
import {
  listPurchaseOrdersWithBalance,
  suggestNextPurchasePoNumber,
} from "@/lib/actions/purchaseOrders";
import { listStaff } from "@/lib/actions/staff";
import { listTransporters } from "@/lib/actions/transporters";
import { listVessels } from "@/lib/actions/vessels";
import { suggestNextPoNumber } from "@/lib/actions/dispatch";
import { CreateDispatchButton } from "@/components/CreateDispatchButton";
import { DispatchBoolToggle } from "@/components/DispatchBoolToggle";
import { EditDispatchInvoicesButton } from "@/components/EditDispatchInvoicesButton";
import { formatDispatchTerms, formatRs } from "@/lib/domain/computations";

type SearchParams = Promise<{
  receiptStatus?: string;
  poNumber?: string;
  purchasePoNumber?: string;
  vesselId?: string;
  importerId?: string;
  dispatchDate?: string;
}>;

export default async function DispatchesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [
    dispatches,
    customers,
    vessels,
    balanceOrders,
    balancePurchases,
    transporters,
    staff,
    suggestedPo,
    suggestedPurchasePo,
  ] = await Promise.all([
    listDispatches({
      receiptStatus: (sp.receiptStatus as ReceiptStatus) || "",
      poNumber: sp.poNumber || "",
      purchasePoNumber: sp.purchasePoNumber || "",
      vesselId: sp.vesselId || "",
      importerId: sp.importerId || "",
      dispatchDate: sp.dispatchDate || "",
    }),
    listCustomers({ activeOnly: true }),
    listVessels(),
    listOrdersWithBalance(),
    listPurchaseOrdersWithBalance(),
    listTransporters(),
    listStaff(),
    suggestNextPoNumber(),
    suggestNextPurchasePoNumber(),
  ]);

  const customerOpts = customers.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
  }));
  const activeVessels = vessels.filter((v) => v.active);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispatches</h1>
          <p className="page-subtitle">
            All truck movements, receipts, and quantity diffs.
          </p>
        </div>
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
          vessels={activeVessels.map((v) => ({
            id: v.id,
            vesselName: v.vesselName,
          }))}
          staff={staff.map((s) => ({ id: s.id, name: s.name }))}
          suggestedPo={suggestedPo}
          suggestedPurchasePo={suggestedPurchasePo}
        />
      </div>

      <form className="filters" method="get">
        <label>
          Receipt status
          <select
            name="receiptStatus"
            defaultValue={sp.receiptStatus ?? ""}
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="RECEIVED">RECEIVED</option>
          </select>
        </label>
        <label>
          Sale PO
          <input
            name="poNumber"
            defaultValue={sp.poNumber ?? ""}
            placeholder="Search sale PO"
          />
        </label>
        <label>
          Purchase PO
          <input
            name="purchasePoNumber"
            defaultValue={sp.purchasePoNumber ?? ""}
            placeholder="Search purchase PO"
          />
        </label>
        <label>
          Dispatch date
          <input
            type="date"
            name="dispatchDate"
            defaultValue={sp.dispatchDate ?? ""}
          />
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
          Importer
          <select name="importerId" defaultValue={sp.importerId ?? ""}>
            <option value="">All</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
              <th>Dispatch date</th>
              <th>Sale PO</th>
              <th>Purchase PO</th>
              <th>Qty (MT)</th>
              <th>Terms</th>
              <th>Freight (Rs/MT)</th>
              <th>Transporter</th>
              <th>Profit (Rs)</th>
              <th>Lorry</th>
              <th>Sale invoice</th>
              <th>Purchase invoice</th>
              <th>Receipt</th>
              <th>Received (MT)</th>
              <th>Diff (MT)</th>
              <th className="cell-center">Soft copy</th>
              <th className="cell-center">Tally</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((row) => (
              <tr key={row.id}>
                <td>
                  {new Date(row.dispatchDate).toISOString().slice(0, 10)}
                </td>
                <td>
                  {row.order ? (
                    <Link
                      href={`/orders/${row.order.id}`}
                      className="font-medium"
                    >
                      {row.poNumber}
                    </Link>
                  ) : (
                    row.poNumber
                  )}
                </td>
                <td>
                  {row.purchaseOrder ? (
                    <Link
                      href={`/purchase-orders/${row.purchaseOrder.id}`}
                      className="font-medium"
                      title={`${row.purchaseOrder.importer?.name ?? ""} — ${row.purchaseOrder.vessel?.vesselName ?? ""}`}
                    >
                      {row.purchasePoNumber}
                    </Link>
                  ) : (
                    row.purchasePoNumber
                  )}
                </td>
                <td>{row.dispatchedQuantity.toString()}</td>
                <td>{formatDispatchTerms(row.dispatchTerms)}</td>
                <td>{formatRs(row.freight)}</td>
                <td className={row.transporter ? undefined : "cell-center"}>
                  {row.transporter?.name ?? "—"}
                </td>
                <td>{formatRs(row.lineProfit)}</td>
                <td className={row.lorryNumber ? undefined : "cell-center"}>
                  {row.lorryNumber ?? "—"}
                </td>
                <td
                  className={
                    row.saleInvoiceNumber ? undefined : "cell-center"
                  }
                >
                  {row.saleInvoiceNumber ?? "—"}
                </td>
                <td
                  className={
                    row.purchaseInvoiceNumber ? undefined : "cell-center"
                  }
                >
                  {row.purchaseInvoiceNumber ?? "—"}
                </td>
                <td>{row.receiptStatus}</td>
                <td
                  className={
                    row.receivingQuantity != null ? undefined : "cell-center"
                  }
                >
                  {row.receivingQuantity != null
                    ? row.receivingQuantity.toString()
                    : "—"}
                </td>
                <td
                  className={
                    row.diffInQuantity != null ? undefined : "cell-center"
                  }
                >
                  {row.diffInQuantity != null
                    ? row.diffInQuantity.toString()
                    : "—"}
                </td>
                <td className="cell-center">
                  <DispatchBoolToggle
                    dispatchId={row.id}
                    field="softCopyStatus"
                    value={row.softCopyStatus}
                  />
                </td>
                <td className="cell-center">
                  <DispatchBoolToggle
                    dispatchId={row.id}
                    field="entryInTally"
                    value={row.entryInTally}
                  />
                </td>
                <td>
                  <EditDispatchInvoicesButton
                    dispatchId={row.id}
                    saleInvoiceNumber={row.saleInvoiceNumber}
                    purchaseInvoiceNumber={row.purchaseInvoiceNumber}
                  />
                </td>
              </tr>
            ))}
            {dispatches.length === 0 && (
              <tr>
                <td colSpan={17}>No dispatches match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
